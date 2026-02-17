import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Block } from '../types/block.type';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  blocks?: Block[];

  @IsNumber()
  version: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
