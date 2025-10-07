import { IsOptional, IsString } from 'class-validator';

export class UpdateNodeDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}