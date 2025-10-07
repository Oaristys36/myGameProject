import { IsOptional, IsString } from 'class-validator';

export class UpdateChoiceDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  nextNodeId?: string;
}