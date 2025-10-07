import { Test, TestingModule } from '@nestjs/testing';
import { StoriesService } from './stories.service';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDeep<PrismaClient>()),
}));

describe('StoriesService', () => {
  let service: StoriesService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockStory = {
    id: '1',
    title: 'Test Story',
    description: 'Test Description',
    imageUrl: 'test.jpg',
    audioUrl: 'test.mp3',
    firstNode: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNode = {
    id: '1',
    storyId: '1',
    content: 'Test Content',
    imageUrl: 'node.jpg',
    audioUrl: 'node.mp3',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoriesService],
    }).compile();

    service = module.get<StoriesService>(StoriesService);
    prisma = (service as any).prisma;
  });

  describe('createStory', () => {
    it('should create a new story', async () => {
      prisma.story.create.mockResolvedValue(mockStory);

      const result = await service.createStory({
        title: 'Test Story',
        description: 'Test Description',
        imageUrl: 'test.jpg',
        audioUrl: 'test.mp3',
      });

      expect(result).toEqual(mockStory);
      expect(prisma.story.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Story',
          description: 'Test Description',
          imageUrl: 'test.jpg',
          audioUrl: 'test.mp3',
        },
      });
    });
  });

  describe('getStories', () => {
    it('should return all stories', async () => {
      prisma.story.findMany.mockResolvedValue([mockStory]);

      const result = await service.getStories();

      expect(result).toEqual([mockStory]);
      expect(prisma.story.findMany).toHaveBeenCalled();
    });
  });

  describe('getStoryById', () => {
    it('should return a story by id with all related data', async () => {
      const mockStoryWithRelations = {
        ...mockStory,
        nodes: [{
          ...mockNode,
          choices: [{
            id: '1',
            text: 'Test Choice',
            outcomes: [{
              id: '1',
              nextNodeId: '2',
              probability: 1,
            }],
          }],
        }],
      };

      prisma.story.findUnique.mockResolvedValue(mockStoryWithRelations);

      const result = await service.getStoryById('1');

      expect(result).toEqual(mockStoryWithRelations);
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          nodes: {
            include: {
              choices: {
                include: {
                  outcomes: true,
                },
              },
            },
          },
        },
      });
    });

    it('should return null for non-existent story', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      const result = await service.getStoryById('999');

      expect(result).toBeNull();
    });
  });

  describe('saveProgress', () => {
    it('should save user progress', async () => {
      const mockProgress = {
        userId: 'user1',
        storyId: '1',
        currentNode: 'node1',
        history: ['choice1', 'choice2'],
      };

      prisma.save.upsert.mockResolvedValue(mockProgress);

      const result = await service.saveProgress(
        'user1',
        '1',
        'node1',
        ['choice1', 'choice2']
      );

      expect(result).toEqual(mockProgress);
      expect(prisma.save.upsert).toHaveBeenCalledWith({
        where: {
          userId_storyId: {
            userId: 'user1',
            storyId: '1',
          },
        },
        update: {
          currentNode: 'node1',
          history: ['choice1', 'choice2'],
        },
        create: {
          userId: 'user1',
          storyId: '1',
          currentNode: 'node1',
          history: ['choice1', 'choice2'],
        },
      });
    });
  });
});
