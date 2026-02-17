import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(
    workspaceId: string,
    userId: string,
    activity: {
      actionType: string;
      noteId?: string;
      blockId?: string;
      metadata?: any;
    },
  ) {
    return this.prisma.activity.create({
      data: {
        workspaceId,
        userId,
        noteId: activity.noteId,
        blockId: activity.blockId,
        actionType: activity.actionType,
        metadata: JSON.stringify(activity.metadata || {}),
      },
    });
  }

  async getActivities(
    workspaceId: string,
    limit = 50,
    offset = 0,
  ) {
    const activities = await this.prisma.activity.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return activities.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata),
    }));
  }

  async getNoteActivities(
    noteId: string,
    limit = 50,
    offset = 0,
  ) {
    const activities = await this.prisma.activity.findMany({
      where: { noteId },
      include: {
        user: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return activities.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata),
    }));
  }
}
