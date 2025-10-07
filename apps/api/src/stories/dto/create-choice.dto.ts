import { IsString } from 'class-validator';

export class CreateChoiceDto {
  @IsString()
  text: string;

  @IsString()
  nextNodeId: string;
}