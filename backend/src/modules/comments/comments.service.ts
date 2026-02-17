import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  async createComment(
    noteId: string,
    workspaceId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.prisma.comment.create({
      data: {
        noteId,
        blockId: createCommentDto.blockId,
        userId,
        workspaceId,
        content: createCommentDto.content,
      },
      include: {
        author: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    // Log activity
    await this.activityService.logActivity(workspaceId, userId, {
      actionType: 'CREATE_COMMENT',
      noteId,
      blockId: createCommentDto.blockId,
      metadata: { commentId: comment.id },
    });

    return comment;
  }

  async getComments(noteId: string) {
    return this.prisma.comment.findMany({
      where: { noteId },
      include: {
        author: {
          select: { id: true, username: true, email: true, avatar: true },
        },
        resolver: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    // Log activity
    await this.activityService.logActivity(comment.workspaceId, userId, {
      actionType: 'RESOLVE_COMMENT',
      noteId: comment.noteId,
      metadata: { commentId },
    });

    return comment;
  }

  async unresolveComment(commentId: string) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: {
        resolved: false,
        resolvedBy: null,
        resolvedAt: null,
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
      throw new ForbiddenException('Cannot delete this comment');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  }
}
