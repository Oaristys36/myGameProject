import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  firstNode?: string;
}
