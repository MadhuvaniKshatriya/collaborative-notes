import { Block } from '../types/block.type';

export class CreateNoteDto {
  title: string;
  blocks: Block[];
}
