import { IsOptional, IsString } from 'class-validator';

export class CreateNodeDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}