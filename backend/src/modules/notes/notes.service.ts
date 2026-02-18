import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import type { Block } from './types/block.type';
import * as crypto from 'crypto';

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async createNote(
    workspaceId: string,
    userId: string,
    dto: CreateNoteDto,
  ) {
    const note = await this.prisma.note.create({
      data: {
        workspaceId,
        title: dto.title || 'Untitled Note',
        createdBy: userId,
        lastEditedBy: userId,
        blocks: {
          create: dto.blocks
            ? dto.blocks.map((block, index) => ({
                type: block.type || 'PARAGRAPH',
                content: block.content || '',
                order: index,
                createdBy: userId,
                lastEditedBy: userId,
              }))
            : [
                {
                  type: 'PARAGRAPH',
                  content: '',
                  order: 0,
                  createdBy: userId,
                  lastEditedBy: userId,
                },
              ],
        },
      },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
            lastEditedByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        createdByUser: {
          select: { id: true, username: true, avatar: true },
        },
        lastEditedByUser: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    // Log activity
    await this.activityService.logActivity(workspaceId, userId, {
      actionType: 'CREATE_NOTE',
      noteId: note.id,
    });

    return note;
  }

  async updateNote(
    noteId: string,
    userId: string,
    workspaceId: string,
    dto: UpdateNoteDto,
  ) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { blocks: true },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    // Check for version conflict
    if (dto.version !== note.version) {
      throw new ConflictException({
        message: 'Note has been modified by another user',
        currentVersion: note.version,
        clientVersion: dto.version,
        currentContent: note.title,
        blocks: note.blocks,
        lastEditedBy: note.lastEditedBy,
        lastEditedAt: note.lastEditedAt,
      });
    }


    // (Removed: Save revision before updating)

    // Delete existing blocks if new blocks provided
    if (dto.blocks && dto.blocks.length > 0) {
      await this.prisma.block.deleteMany({
        where: { noteId },
      });

      // Create new blocks
      await Promise.all(
        dto.blocks.map((block, index) =>
          this.prisma.block.create({
            data: {
              noteId,
              type: block.type || 'PARAGRAPH',
              content: block.content || '',
              order: index,
              createdBy: userId,
              lastEditedBy: userId,
            },
          }),
        ),
      );
    }


    // Update note
    const updated = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: dto.title !== undefined ? dto.title : note.title,
        lastEditedBy: userId,
        version: { increment: 1 },
      },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
            lastEditedByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    // Create a revision for the new version (after update)
    // Only create if blocks or title changed
    if ((dto.blocks && dto.blocks.length > 0) || (dto.title !== undefined && dto.title !== note.title)) {
      await this.prisma.revision.create({
        data: {
          noteId,
          blocks: JSON.stringify(updated.blocks),
          version: updated.version,
          createdBy: userId,
        },
      });
    }

    // Log activity
    if (dto.title !== undefined && dto.title !== note.title) {
      await this.activityService.logActivity(workspaceId, userId, {
        actionType: 'RENAME_NOTE',
        noteId,
        metadata: { newTitle: dto.title },
      });
    }

    if (dto.blocks && dto.blocks.length > 0) {
      await this.activityService.logActivity(workspaceId, userId, {
        actionType: 'EDIT_NOTE',
        noteId,
      });
    }

    return updated;
  }

  async deleteNote(noteId: string, userId: string, workspaceId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    const deleted = await this.prisma.note.delete({
      where: { id: noteId },
    });

    // Log activity
    await this.activityService.logActivity(workspaceId, userId, {
      actionType: 'DELETE_NOTE',
      noteId,
      metadata: { title: deleted.title },
    });

    return deleted;
  }

  async getNotes(workspaceId: string) {
    const notes = await this.prisma.note.findMany({
      where: { workspaceId },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
          take: 1, // Only get first block for preview
        },
        createdByUser: {
          select: { id: true, username: true, avatar: true },
        },
        lastEditedByUser: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { lastEditedAt: 'desc' },
    });

    return notes;
  }

  async getNote(noteId: string, workspaceId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
            lastEditedByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        createdByUser: {
          select: { id: true, username: true, avatar: true },
        },
        lastEditedByUser: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    return note;
  }

  async search(workspaceId: string, query: string) {
    const normalizedQuery = query.toLowerCase();

    const notes = await this.prisma.note.findMany({
      where: { workspaceId },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { lastEditedAt: 'desc' },
    });

    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(normalizedQuery);
      const blocksMatch = note.blocks.some((block) =>
        block.content.toLowerCase().includes(normalizedQuery),
      );

      return titleMatch || blocksMatch;
    });
  }

  async getRevisions(noteId: string, workspaceId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    const revisions = await this.prisma.revision.findMany({
      where: { noteId },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return revisions.map((rev) => ({
      ...rev,
      blocks: JSON.parse(rev.blocks),
    }));
  }

  async restoreRevision(
    noteId: string,
    revisionId: string,
    userId: string,
    workspaceId: string,
  ) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { blocks: true },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    const revision = await this.prisma.revision.findUnique({
      where: { id: revisionId },
    });

    if (!revision) throw new NotFoundException('Revision not found');

    // Save current state as revision first
    await this.prisma.revision.create({
      data: {
        noteId,
        blocks: JSON.stringify(note.blocks),
        version: note.version,
        createdBy: userId,
      },
    });

    // Restore blocks from revision
    const restoredBlocks = JSON.parse(revision.blocks);

    // Delete current blocks
    await this.prisma.block.deleteMany({
      where: { noteId },
    });

    // Create new blocks from revision
    await Promise.all(
      restoredBlocks.map((block: any, index: number) =>
        this.prisma.block.create({
          data: {
            noteId,
            type: block.type || 'PARAGRAPH',
            content: block.content || '',
            order: index,
            createdBy: block.createdBy || userId,
            lastEditedBy: userId,
          },
        }),
      ),
    );

    // Update note
    const updated = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        lastEditedBy: userId,
        version: { increment: 1 },
      },
      include: {
        blocks: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Log activity
    await this.activityService.logActivity(workspaceId, userId, {
      actionType: 'RESTORE_VERSION',
      noteId,
      metadata: { restoredFrom: revision.version },
    });

    return updated;
  }

  async createShareLink(noteId: string, workspaceId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) throw new NotFoundException('Note not found');
    if (note.workspaceId !== workspaceId) {
      throw new ForbiddenException('You do not have access to this note');
    }

    const shareToken = crypto.randomBytes(32).toString('hex');

    const updated = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        shareToken,
        isPublic: true,
      },
    });

    return {
      shareToken,
      shareUrl: `/share/${shareToken}`,
    };
  }

  async getSharedNote(shareToken: string) {
    const note = await this.prisma.note.findUnique({
      where: { shareToken },
      include: {
        blocks: {
          include: {
            createdByUser: {
              select: { id: true, username: true, avatar: true },
            },
            lastEditedByUser: {
              select: { id: true, username: true, avatar: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!note || !note.isPublic) {
      throw new NotFoundException('Shared note not found');
    }

    // Check expiration
    if (note.shareExpiredAt && note.shareExpiredAt < new Date()) {
      throw new NotFoundException('Share link has expired');
    }

    return note;
  }
}
