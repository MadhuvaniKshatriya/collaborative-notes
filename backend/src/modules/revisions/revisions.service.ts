import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Block } from '../notes/types/block.type';

@Injectable()
export class RevisionsService {
  constructor(private prisma: PrismaService) {}

  async restore(noteId: string, revisionId: string) {
    const revision = await this.prisma.revision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Save current version as a new revision before restoring
    await this.prisma.revision.create({
      data: {
        noteId,
        blocks: note.blocks,
        version: note.version,
      },
    });

    // Restore the blocks from the revision
    const restored = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        blocks: revision.blocks,
        version: note.version + 1,
        updatedBy: 'system',
      },
    });

    return {
      ...restored,
      blocks: JSON.parse(restored.blocks) as Block[],
    };
  }

  async restoreByRevisionId(revisionId: string) {
    const revision = await this.prisma.revision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    return this.restore(revision.noteId, revisionId);
  }
}
