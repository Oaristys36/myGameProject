import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { SupabaseGuard } from '../auth/supabase.guard';
import { GetUser, type AuthUser } from '../auth/get-user.decorator';
import {
  CreateStoryDto,
  UpdateStoryDto,
  CreateNodeDto,
  CreateChoiceDto,
} from './dto';

@Controller('stories')
@UseGuards(SupabaseGuard)
class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  // Public story endpoints
  @Get()
  getStories() {
    return this.storiesService.getStories();
  }

  @Get(':id')
  getStoryById(@Param('id') id: string) {
    return this.storiesService.getStoryById(id);
  }

  // Player progression endpoints
  @Post(':id/start')
  startStory(@Param('id') storyId: string, @GetUser() user: AuthUser) {
    return this.storiesService.startStory(user.id, storyId);
  }

  @Get('games/active')
  getActiveGames(@GetUser() user: AuthUser) {
    return this.storiesService.getActiveGames(user.id);
  }

  @Get(':storyId/current-node')
  getCurrentNode(@GetUser() user: AuthUser, @Param('storyId') storyId: string) {
    return this.storiesService.getCurrentNode(user.id, storyId);
  }

  @Get(':storyId/node/:nodeId/choices')
  getAvailableChoices(
    @GetUser() user: AuthUser,
    @Param('nodeId') nodeId: string,
    @Param('storyId') storyId: string,
  ) {
    return this.storiesService
      .getCurrentNode(user.id, storyId)
      .then(() => this.storiesService.getAvailableChoices(nodeId));
  }

  @Post(':storyId/choice/:choiceId')
  makeChoice(
    @GetUser() user: AuthUser,
    @Param('storyId') storyId: string,
    @Param('choiceId') choiceId: string,
  ) {
    return this.storiesService.makeChoice(user.id, storyId, choiceId);
  }

  // Player history and statistics
  @Get('player/history')
  getPlayerHistory(@GetUser() user: AuthUser) {
    return this.storiesService.getPlayerHistory(user.id);
  }

  @Get('player/progress')
  getUserProgress(@GetUser() user: AuthUser) {
    return this.storiesService.getUserProgress(user.id);
  }

  // Story statistics
  @Get(':id/statistics')
  getStoryStatistics(@Param('id') id: string) {
    return this.storiesService.getStoryStatistics(id);
  }

  // Admin endpoints (should be protected with additional guard)
  @Post()
  createStory(@Body() dto: CreateStoryDto) {
    console.log('create: ');
    console.log(dto);
    return this.storiesService.createStory(dto);
  }

  @Put(':id')
  updateStory(@Param('id') id: string, @Body() dto: UpdateStoryDto) {
    return this.storiesService.updateStory(id, dto);
  }

  @Delete(':id')
  deleteStory(@Param('id') id: string) {
    return this.storiesService.deleteStory(id);
  }

  @Post(':storyId/nodes')
  createNode(@Param('storyId') storyId: string, @Body() dto: CreateNodeDto) {
    return this.storiesService.createNode(storyId, dto);
  }

  @Post('nodes/:nodeId/choices')
  createChoice(@Param('nodeId') nodeId: string, @Body() dto: CreateChoiceDto) {
    return this.storiesService.createChoice(nodeId, dto);
  }

  // Admin - update/delete node
  @Put('nodes/:nodeId')
  updateNode(
    @Param('nodeId') nodeId: string,
    @Body() dto: import('./dto').UpdateNodeDto,
  ) {
    return this.storiesService.updateNode(nodeId, dto);
  }

  @Delete('nodes/:nodeId')
  deleteNode(@Param('nodeId') nodeId: string) {
    return this.storiesService.deleteNode(nodeId);
  }

  // Admin - update/delete choice
  @Put('choices/:choiceId')
  updateChoice(
    @Param('choiceId') choiceId: string,
    @Body() dto: import('./dto').UpdateChoiceDto,
  ) {
    return this.storiesService.updateChoice(choiceId, dto);
  }

  @Delete('choices/:choiceId')
  deleteChoice(@Param('choiceId') choiceId: string) {
    return this.storiesService.deleteChoice(choiceId);
  }
}

export default StoriesController;
