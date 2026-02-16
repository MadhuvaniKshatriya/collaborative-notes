import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import type { Block } from './types/block.type';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        title: dto.title,
        blocks: JSON.stringify(dto.blocks),
        updatedBy: 'system',
      },
    });

    return {
      ...note,
      blocks: JSON.parse(note.blocks) as Block[],
    };
  }

  async update(id: string, dto: UpdateNoteDto) {
    const existing = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Note not found');

    if (dto.version !== existing.version) {
      throw new ConflictException(
        `Version conflict: expected ${existing.version}, got ${dto.version}`
      );
    }

    // Save revision before updating
    await this.prisma.revision.create({
      data: {
        noteId: id,
        blocks: existing.blocks,
        version: existing.version,
      },
    });

    const updated = await this.prisma.note.update({
      where: { id },
      data: {
        title: dto.title,
        blocks: JSON.stringify(dto.blocks),
        version: existing.version + 1,
        updatedBy: dto.updatedBy || 'system',
      },
    });

    return {
      ...updated,
      blocks: JSON.parse(updated.blocks) as Block[],
    };
  }

  async delete(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) throw new NotFoundException('Note not found');

    const deleted = await this.prisma.note.delete({
      where: { id },
    });

    return {
      ...deleted,
      blocks: JSON.parse(deleted.blocks) as Block[],
    };
  }

  async getAll() {
    const notes = await this.prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return notes.map((note) => ({
      ...note,
      blocks: JSON.parse(note.blocks) as Block[],
    }));
  }

  async getOne(id: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) throw new NotFoundException('Note not found');

    return {
      ...note,
      blocks: JSON.parse(note.blocks) as Block[],
    };
  }

  async search(query: string) {
    const normalizedQuery = query.toLowerCase();

    const notes = await this.prisma.note.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return notes
      .map((note) => {
        const parsedBlocks = JSON.parse(note.blocks) as Block[];

        return {
          ...note,
          blocks: parsedBlocks,
        };
      })
      .filter((note) => {
        const titleMatch = note.title.toLowerCase().includes(normalizedQuery);

        const blocksMatch = note.blocks.some((block) =>
          block.content.toLowerCase().includes(normalizedQuery),
        );

        return titleMatch || blocksMatch;
      });
  }

  async getRevisions(id: string) {
    const revisions = await this.prisma.revision.findMany({
      where: { noteId: id },
      orderBy: { createdAt: 'desc' },
    });

    return revisions.map((rev) => ({
      ...rev,
      blocks: JSON.parse(rev.blocks) as Block[],
    }));
  }
}
