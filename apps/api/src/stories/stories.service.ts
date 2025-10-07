import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStoryDto,
  CreateNodeDto,
  CreateChoiceDto,
  UpdateStoryDto,
} from './dto';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  // Stories management
  async createStory(dto: CreateStoryDto) {
    return this.prisma.story.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        audioUrl: dto.audioUrl,
        // map to schema firstNodeId if provided
        ...(dto.firstNode ? { firstNodeId: dto.firstNode } : {}),
      },
    });
  }

  async getStories() {
    return this.prisma.story.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        audioUrl: true,
        _count: {
          select: { nodes: true },
        },
      },
    });
  }

  async getStoryById(id: string) {
    const story = await this.prisma.story.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    return story;
  }

  async updateStory(id: string, dto: UpdateStoryDto) {
    // allow mapping firstNode -> firstNodeId if provided
    const { firstNode, ...rest } = dto as UpdateStoryDto & {
      firstNode?: string;
    };
    return this.prisma.story.update({
      where: { id },
      data: {
        ...rest,
        ...(firstNode ? { firstNodeId: firstNode } : {}),
      },
    });
  }

  async deleteStory(id: string) {
    await this.prisma.story.delete({
      where: { id },
    });
  }

  // Create a node in a story
  async createNode(storyId: string, dto: CreateNodeDto) {
    return this.prisma.storyNode.create({
      data: {
        storyId,
        content: dto.content,
        imageUrl: dto.imageUrl,
        audioUrl: dto.audioUrl,
      },
    });
  }

  // Create a choice in a node
  async createChoice(nodeId: string, dto: CreateChoiceDto) {
    return this.prisma.choice.create({
      data: {
        nodeId,
        text: dto.text,
        nextNodeId: dto.nextNodeId,
      },
    });
  }

  async updateNode(nodeId: string, dto: import('./dto').UpdateNodeDto) {
    return this.prisma.storyNode.update({
      where: { id: nodeId },
      data: {
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.audioUrl !== undefined ? { audioUrl: dto.audioUrl } : {}),
      },
    });
  }

  async deleteNode(nodeId: string) {
    // Also deletes related choices via ON DELETE? Prisma requires explicit delete if not cascading
    // Here we delete choices first to avoid FK issues
    await this.prisma.choice.deleteMany({ where: { nodeId } });
    await this.prisma.storyNode.delete({ where: { id: nodeId } });
  }

  async updateChoice(choiceId: string, dto: import('./dto').UpdateChoiceDto) {
    return this.prisma.choice.update({
      where: { id: choiceId },
      data: {
        ...(dto.text !== undefined ? { text: dto.text } : {}),
        ...(dto.nextNodeId !== undefined ? { nextNodeId: dto.nextNodeId } : {}),
      },
    });
  }

  async deleteChoice(choiceId: string) {
    await this.prisma.saveChoice.deleteMany({ where: { choiceId } });
    await this.prisma.choice.delete({ where: { id: choiceId } });
  }

  // Story progression and gameplay
  async startStory(userId: string, storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      select: { firstNodeId: true },
    });

    if (!story || !story.firstNodeId) {
      throw new NotFoundException('Story not found');
    }

    // If a save already exists for this user/story, reset to the first node; otherwise create a new one
    const existing = await this.prisma.save.findFirst({
      where: { userId, storyId },
      select: { id: true },
    });

    if (existing) {
      return this.prisma.save.update({
        where: { id: existing.id },
        data: { currentNodeId: story.firstNodeId },
        include: {
          story: { select: { title: true, description: true } },
        },
      });
    }

    return this.prisma.save.create({
      data: {
        userId,
        storyId,
        currentNodeId: story.firstNodeId,
      },
      include: {
        story: { select: { title: true, description: true } },
      },
    });
  }

  async getCurrentNode(userId: string, storyId: string) {
    const save = await this.prisma.save.findFirst({
      where: { userId, storyId },
      select: { currentNodeId: true },
    });

    if (!save) {
      throw new NotFoundException('No active game found');
    }

    return this.prisma.storyNode.findUnique({
      where: { id: save.currentNodeId },
      include: { choices: true },
    });
  }

  async getAvailableChoices(nodeId: string) {
    return this.prisma.choice.findMany({ where: { nodeId } });
  }

  async makeChoice(userId: string, storyId: string, choiceId: string) {
    const [save, choice] = await Promise.all([
      this.prisma.save.findFirst({
        where: { userId, storyId },
        select: { id: true },
      }),
      this.prisma.choice.findUnique({
        where: { id: choiceId },
        select: { nextNodeId: true },
      }),
    ]);

    if (!save) {
      throw new NotFoundException('No active game found');
    }
    if (!choice) {
      throw new NotFoundException('Choice not found');
    }

    // Determine next order for SaveChoice
    const count = await this.prisma.saveChoice.count({
      where: { saveId: save.id },
    });

    await this.prisma.$transaction([
      this.prisma.saveChoice.create({
        data: { saveId: save.id, choiceId, order: count + 1 },
      }),
      this.prisma.save.update({
        where: { id: save.id },
        data: { currentNodeId: choice.nextNodeId },
      }),
    ]);

    return { success: true } as const;
  }

  // Active games for a user
  async getActiveGames(userId: string) {
    return this.prisma.save.findMany({
      where: { userId },
      include: {
        story: { select: { id: true, title: true, description: true } },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  // History for a user across stories
  async getPlayerHistory(userId: string) {
    return this.prisma.save.findMany({
      where: { userId },
      include: {
        story: { select: { id: true, title: true } },
        choices: { orderBy: { order: 'asc' }, include: { choice: true } },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  // Progress summary for a user
  async getUserProgress(userId: string) {
    const saves = await this.prisma.save.findMany({
      where: { userId },
      include: {
        story: { select: { id: true, title: true } },
        _count: { select: { choices: true } },
      },
    });

    return saves.map((s) => ({
      storyId: s.storyId,
      storyTitle: s.story?.title ?? null,
      currentNodeId: s.currentNodeId,
      choicesCount: s._count?.choices ?? 0,
      updatedAt: s.updated_at,
    }));
  }

  // Story statistics
  async getStoryStatistics(id: string) {
    const [nodes, choices, saves] = await Promise.all([
      this.prisma.storyNode.count({ where: { storyId: id } }),
      this.prisma.choice.count({ where: { node: { storyId: id } } }),
      this.prisma.save.count({ where: { storyId: id } }),
    ]);

    return { nodes, choices, saves } as const;
  }
}
