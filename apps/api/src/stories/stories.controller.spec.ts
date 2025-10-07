import { Test, TestingModule } from '@nestjs/testing';
import StoriesController from './stories.controller';
import { StoriesService } from './stories.service';

describe('StoriesController', () => {
  let controller: StoriesController;
  let service: StoriesService;

  const mockStoriesService = {
    getStories: jest.fn(),
    getStoryById: jest.fn(),
    createStory: jest.fn(),
    updateStory: jest.fn(),
    deleteStory: jest.fn(),
    createNode: jest.fn(),
    getNodeWithChoices: jest.fn(),
    createChoice: jest.fn(),
    createOutcome: jest.fn(),
    getUserProgress: jest.fn(),
    saveProgress: jest.fn(),
  };

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

  const mockUser = {
    id: 'user1',
    email: 'test@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [
        {
          provide: StoriesService,
          useValue: mockStoriesService,
        },
      ],
    }).compile();

    controller = module.get<StoriesController>(StoriesController);
    service = module.get<StoriesService>(StoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllStories', () => {
    it('should return an array of stories', async () => {
      const stories = [mockStory];
      jest.spyOn(service, 'getStories').mockResolvedValue(stories);

      const result = await controller.getAllStories();
      expect(result).toBe(stories);
      expect(service.getStories).toHaveBeenCalled();
    });
  });

  describe('getStory', () => {
    it('should return a single story', async () => {
      jest.spyOn(service, 'getStoryById').mockResolvedValue(mockStory);

      const result = await controller.getStory('1');
      expect(result).toBe(mockStory);
      expect(service.getStoryById).toHaveBeenCalledWith('1');
    });
  });

  describe('createStory', () => {
    it('should create a new story', async () => {
      const createStoryDto = {
        title: 'New Story',
        description: 'New Description',
        imageUrl: 'new.jpg',
        audioUrl: 'new.mp3',
      };

      jest.spyOn(service, 'createStory').mockResolvedValue({
        ...mockStory,
        ...createStoryDto,
      });

      const result = await controller.createStory(createStoryDto);
      expect(result).toMatchObject(createStoryDto);
      expect(service.createStory).toHaveBeenCalledWith(createStoryDto);
    });
  });

  describe('saveProgress', () => {
    it('should save user progress', async () => {
      const progressData = {
        currentNode: 'node1',
        history: ['choice1', 'choice2'],
      };

      const mockProgress = {
        userId: 'user1',
        storyId: '1',
        ...progressData,
      };

      jest.spyOn(service, 'saveProgress').mockResolvedValue(mockProgress);

      const result = await controller.saveProgress(
        '1',
        { user: mockUser },
        progressData,
      );

      expect(result).toBe(mockProgress);
      expect(service.saveProgress).toHaveBeenCalledWith(
        mockUser.id,
        '1',
        progressData.currentNode,
        progressData.history,
      );
    });
  });

  describe('getProgress', () => {
    it('should get user progress for a story', async () => {
      const mockProgress = {
        userId: 'user1',
        storyId: '1',
        currentNode: 'node1',
        history: ['choice1'],
      };

      jest.spyOn(service, 'getUserProgress').mockResolvedValue(mockProgress);

      const result = await controller.getProgress('1', { user: mockUser });
      expect(result).toBe(mockProgress);
      expect(service.getUserProgress).toHaveBeenCalledWith(mockUser.id, '1');
    });
  });
});
