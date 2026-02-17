import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

interface JoinNotePayload {
  noteId: string;
  userId: string;
  username: string;
  avatar: string;
}

interface BlockUpdatePayload {
  noteId: string;
  blockId: string;
  content: string;
  version: number;
}

interface CursorPositionPayload {
  noteId: string;
  blockId: string;
  position: number;
}

interface CommentPayload {
  noteId: string;
  blockId?: string;
  content: string;
}

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notes',
})
export class NotesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private activeUsers: Map<string, Set<string>> = new Map(); // noteId -> Set<userId>
  private userSockets: Map<string, Socket> = new Map(); // userId -> Socket
  private userInfo: Map<string, any> = new Map(); // userId -> {username, avatar}

  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
  ) {}

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);

    // Find and remove user from all rooms
    for (const [noteId, userIds] of this.activeUsers.entries()) {
      for (const userId of userIds) {
        if (this.userSockets.get(userId) === socket) {
          userIds.delete(userId);
          this.userSockets.delete(userId);
          this.userInfo.delete(userId);

          // Broadcast user left
          this.server.to(noteId).emit('user-left', {
            noteId,
            userId,
          });
        }
      }
    }
  }

  @SubscribeMessage('join-note')
  async handleJoinNote(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinNotePayload,
  ) {
    const { noteId, userId, username, avatar } = payload;

    // Join socket.io room
    socket.join(noteId);

    // Track user
    if (!this.activeUsers.has(noteId)) {
      this.activeUsers.set(noteId, new Set());
    }
    this.activeUsers.get(noteId)!.add(userId);
    this.userSockets.set(userId, socket);
    this.userInfo.set(userId, { username, avatar });

    // Save session to database
    const session = await this.prisma.session.create({
      data: {
        userId,
        workspaceId: 'default', // TODO: get from context
        noteId,
        socketId: socket.id,
        connectedAt: new Date(),
      },
    });

    // Broadcast user joined to everyone in room
    const activeUsers = Array.from(this.activeUsers.get(noteId) || []).map((uid) => ({
      id: uid,
      ...this.userInfo.get(uid),
    }));

    this.server.to(noteId).emit('user-joined', {
      noteId,
      user: { id: userId, username, avatar },
      activeUsers,
    });

    console.log(`User ${userId} joined note ${noteId}`);
  }

  @SubscribeMessage('leave-note')
  async handleLeaveNote(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { noteId: string; userId: string },
  ) {
    const { noteId, userId } = payload;

    // Remove from tracking
    const userIds = this.activeUsers.get(noteId);
    if (userIds) {
      userIds.delete(userId);
    }
    this.userSockets.delete(userId);

    // Leave room
    socket.leave(noteId);

    // Update session
    await this.prisma.session.updateMany({
      where: { socketId: socket.id },
      data: { disconnectedAt: new Date() },
    });

    // Broadcast user left
    this.server.to(noteId).emit('user-left', { noteId, userId });

    console.log(`User ${userId} left note ${noteId}`);
  }

  @SubscribeMessage('block-update')
  async handleBlockUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: BlockUpdatePayload,
  ) {
    const { noteId, blockId, content, version } = payload;

    try {
      // Get user from socket
      const userId = Array.from(this.userSockets.entries()).find(
        ([_, s]) => s === socket,
      )?.[0];

      if (!userId) return;

      // Update block in database
      const block = await this.prisma.block.update({
        where: { id: blockId },
        data: {
          content,
          version: version + 1,
          lastEditedBy: userId,
          lastEditedAt: new Date(),
        },
        include: {
          lastEditedByUser: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      // Log activity
      await this.activityService.logActivity('default', userId, {
        actionType: 'EDIT_BLOCK',
        noteId,
        blockId,
      });

      // Broadcast to everyone except sender
      socket.to(noteId).emit('block-updated', {
        noteId,
        blockId,
        content,
        version: block.version,
        lastEditedBy: block.lastEditedByUser,
        lastEditedAt: block.lastEditedAt,
      });

      // Send confirmation to sender
      socket.emit('block-update-confirmed', {
        blockId,
        version: block.version,
      });
    } catch (error) {
      console.error('Error updating block:', error);
      socket.emit('error', { message: 'Failed to update block' });
    }
  }

  @SubscribeMessage('block-add')
  async handleBlockAdd(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: {
      noteId: string;
      type: string;
      position: number;
      content: string;
    },
  ) {
    const { noteId, type, position, content } = payload;

    try {
      const userId = Array.from(this.userSockets.entries()).find(
        ([_, s]) => s === socket,
      )?.[0];

      if (!userId) return;

      // Create block
      const block = await this.prisma.block.create({
        data: {
          noteId,
          type,
          content,
          order: position,
          createdBy: userId,
          lastEditedBy: userId,
        },
        include: {
          createdByUser: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      // Update note version
      await this.prisma.note.update({
        where: { id: noteId },
        data: { version: { increment: 1 } },
      });

      // Log activity
      await this.activityService.logActivity('default', userId, {
        actionType: 'ADD_BLOCK',
        noteId,
        blockId: block.id,
      });

      // Broadcast to everyone
      this.server.to(noteId).emit('block-added', {
        noteId,
        block: {
          id: block.id,
          type: block.type,
          content: block.content,
          order: block.order,
          createdBy: block.createdByUser,
        },
      });

      // Send confirmation to sender
      socket.emit('block-add-confirmed', {
        blockId: block.id,
        order: block.order,
      });
    } catch (error) {
      console.error('Error adding block:', error);
      socket.emit('error', { message: 'Failed to add block' });
    }
  }

  @SubscribeMessage('block-delete')
  async handleBlockDelete(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    payload: { noteId: string; blockId: string; version: number },
  ) {
    const { noteId, blockId, version } = payload;

    try {
      const userId = Array.from(this.userSockets.entries()).find(
        ([_, s]) => s === socket,
      )?.[0];

      if (!userId) return;

      // Delete block
      await this.prisma.block.delete({
        where: { id: blockId },
      });

      // Update note version
      await this.prisma.note.update({
        where: { id: noteId },
        data: { version: { increment: 1 } },
      });

      // Log activity
      await this.activityService.logActivity('default', userId, {
        actionType: 'DELETE_BLOCK',
        noteId,
        blockId,
      });

      // Broadcast to everyone
      this.server.to(noteId).emit('block-deleted', {
        noteId,
        blockId,
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      socket.emit('error', { message: 'Failed to delete block' });
    }
  }

  @SubscribeMessage('cursor-position')
  handleCursorPosition(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CursorPositionPayload,
  ) {
    const { noteId, blockId, position } = payload;

    const userId = Array.from(this.userSockets.entries()).find(
      ([_, s]) => s === socket,
    )?.[0];

    if (!userId) return;

    const userInfo = this.userInfo.get(userId);

    // Broadcast cursor position to everyone except sender
    socket.to(noteId).emit('cursor-moved', {
      noteId,
      userId,
      blockId,
      position,
      user: { id: userId, ...userInfo },
    });
  }

  @SubscribeMessage('comment-add')
  async handleCommentAdd(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: CommentPayload,
  ) {
    const { noteId, blockId, content } = payload;

    try {
      const userId = Array.from(this.userSockets.entries()).find(
        ([_, s]) => s === socket,
      )?.[0];

      if (!userId) return;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, avatar: true },
      });

      // Create comment
      const comment = await this.prisma.comment.create({
        data: {
          noteId,
          blockId: blockId,
          userId,
          workspaceId: 'default',
          content,
        },
      });

      // Log activity
      await this.activityService.logActivity('default', userId, {
        actionType: 'CREATE_COMMENT',
        noteId,
        blockId,
      });

      // Broadcast to everyone
      this.server.to(noteId).emit('comment-added', {
        noteId,
        comment: {
          id: comment.id,
          blockId: comment.blockId,
          content: comment.content,
          author: user,
          createdAt: comment.createdAt,
        },
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      socket.emit('error', { message: 'Failed to add comment' });
    }
  }

  // Helper method to get active users in a note
  getActiveUsers(noteId: string) {
    const userIds = this.activeUsers.get(noteId) || new Set();
    return Array.from(userIds).map((userId) => ({
      id: userId,
      ...this.userInfo.get(userId),
    }));
  }
}
