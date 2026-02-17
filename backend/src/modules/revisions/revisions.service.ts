import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
      include: { blocks: true },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Save current version as a new revision before restoring
    await this.prisma.revision.create({
      data: {
        noteId,
        blocks: JSON.stringify(note.blocks || []),
        version: note.version,
        createdBy: (note.lastEditedBy || note.createdBy || 'system'),
      },
    });

    // Restore the blocks from the revision (delete current blocks and recreate from snapshot)
    const blocksToRestore: Block[] = JSON.parse(revision.blocks || '[]');

    // Delete existing blocks and recreate
    await this.prisma.$transaction([
      this.prisma.block.deleteMany({ where: { noteId } }),
      this.prisma.block.createMany({
        data: blocksToRestore.map((b: any) => ({
          id: b.id,
          noteId,
          type: b.type || 'PARAGRAPH',
          content: b.content || '',
          order: b.order ?? 0,
          createdBy: b.createdBy || (note.lastEditedBy || note.createdBy || 'system'),
          lastEditedBy: b.lastEditedBy || (note.lastEditedBy || note.createdBy || 'system'),
          version: b.version ?? 1,
        })),
      }),
    ]);

    const restoredNote = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        version: note.version + 1,
        lastEditedBy: (note.lastEditedBy || note.createdBy || 'system'),
        lastEditedAt: new Date(),
      },
      include: { blocks: true },
    });

    return {
      ...restoredNote,
      blocks: blocksToRestore,
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
