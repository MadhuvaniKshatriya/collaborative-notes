import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(
    userId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ) {
    // Ensure user exists; create default user if it doesn't
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@local.dev`,
          username: userId,
          passwordHash: '', // No password for default user
        },
      });
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description || '',
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, email: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    return workspace;
  }

  async getWorkspaces(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: {
              select: { id: true, email: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => m.workspace);
  }

  async getWorkspace(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: { id: true, email: true, username: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true, username: true, avatar: true },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is a member
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return workspace;
  }

  async addMember(workspaceId: string, userId: string, memberId: string) {
    // Check if requester is owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owner can add members');
    }

    // Add member
    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: memberId,
        role: 'EDITOR',
      },
      include: {
        user: {
          select: { id: true, email: true, username: true, avatar: true },
        },
      },
    });

    return member;
  }

  async removeMember(workspaceId: string, userId: string, memberId: string) {
    // Check if requester is owner
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== userId) {
      throw new ForbiddenException('Only workspace owner can remove members');
    }

    // Remove member
    await this.prisma.workspaceMember.deleteMany({
      where: { workspaceId, userId: memberId },
    });

    return { success: true };
  }
}
