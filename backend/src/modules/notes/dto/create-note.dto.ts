import { IsString, IsOptional, IsArray } from 'class-validator';
import { Block } from '../types/block.type';

export class CreateNoteDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  blocks?: Block[];
}
