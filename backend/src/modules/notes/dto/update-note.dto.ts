import { Block } from '../types/block.type';

export class UpdateNoteDto {
  title: string;
  blocks: Block[];
  version: number;
  updatedBy?: string;
}
