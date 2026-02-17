import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import type { RootState } from '../app/store';
import {
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  setComments,
  addComment,
  setCursorPosition,
  clearCursorPosition,
  addActivity,
} from '../features/collaboration/collaborationSlice';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000/notes';

interface JoinNotePayload {
  noteId: string;
  userId: string;
  username: string;
  avatar: string;
}

export const useWebSocketConnection = (noteId: string) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  // allow anonymous user when auth removed
  const user = useSelector((state: RootState) =>
    // @ts-ignore
    state.auth?.user || { id: 'anonymous', username: 'Anonymous', avatar: '' },
  );
  const { currentWorkspaceId } = useSelector(
    (state: RootState) => state.workspace,
  );

  useEffect(() => {
    if (!noteId) return;

    // Connect to WebSocket (no auth)
    const socket = io(WS_URL);

    socketRef.current = socket;

    // Join note room
    const joinPayload: JoinNotePayload = {
      noteId,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
    };

    socket.emit('join-note', joinPayload);

    // Handle user joined
    const onUserJoined = (data: any) => {
      dispatch(setActiveUsers(data.activeUsers));
      dispatch(
        addActivity({
          id: Date.now().toString(),
          actionType: 'USER_JOINED',
          user: data.user,
          metadata: { noteId },
          createdAt: new Date().toISOString(),
        }),
      );
    };
    socket.on('user-joined', onUserJoined);

    // Handle user left
    const onUserLeft = (data: any) => {
      dispatch(removeActiveUser(data.userId));
      dispatch(clearCursorPosition(data.userId));
    };
    socket.on('user-left', onUserLeft);

    // Handle block updated
    const onBlockUpdated = (data: any) => {
      dispatch(
        addActivity({
          id: Date.now().toString(),
          actionType: 'BLOCK_EDITED',
          user: data.lastEditedBy,
          metadata: { noteId, blockId: data.blockId },
          createdAt: new Date().toISOString(),
        }),
      );
    };
    socket.on('block-updated', onBlockUpdated);

    // Handle block added
    const onBlockAdded = (data: any) => {
      dispatch(
        addActivity({
          id: Date.now().toString(),
          actionType: 'BLOCK_ADDED',
          user: data.block.createdBy,
          metadata: { noteId, blockId: data.block.id },
          createdAt: new Date().toISOString(),
        }),
      );
    };
    socket.on('block-added', onBlockAdded);

    // Handle block deleted
    const onBlockDeleted = (data: any) => {
      dispatch(
        addActivity({
          id: Date.now().toString(),
          actionType: 'BLOCK_DELETED',
          user: { id: 'unknown', username: 'Unknown', avatar: '' },
          metadata: { noteId, blockId: data.blockId },
          createdAt: new Date().toISOString(),
        }),
      );
    };
    socket.on('block-deleted', onBlockDeleted);

    // Handle cursor position
    const onCursorMoved = (data: any) => {
      dispatch(
        setCursorPosition({
          userId: data.userId,
          blockId: data.blockId,
          position: data.position,
          user: data.user,
        }),
      );
    };
    socket.on('cursor-moved', onCursorMoved);

    // Handle comment added
    const onCommentAdded = (data: any) => {
      dispatch(
        addComment({
          id: data.comment.id,
          blockId: data.comment.blockId || '',
          content: data.comment.content,
          author: data.comment.author,
          resolved: false,
          createdAt: data.comment.createdAt,
        }),
      );
    };
    socket.on('comment-added', onCommentAdded);

    // Handle errors
    const onError = (data: any) => {
      console.error('WebSocket error:', data?.message ?? data);
    };
    socket.on('error', onError);

    // Cleanup on unmount
    return () => {
      // remove listeners to avoid duplicated handlers on reconnect
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('block-updated', onBlockUpdated);
      socket.off('block-added', onBlockAdded);
      socket.off('block-deleted', onBlockDeleted);
      socket.off('cursor-moved', onCursorMoved);
      socket.off('comment-added', onCommentAdded);
      socket.off('error', onError);

      socket.emit('leave-note', { noteId, userId: user.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [noteId, user, dispatch, currentWorkspaceId]);

  const sendBlockUpdate = (blockId: string, content: string, version: number) => {
    if (!socketRef.current || !noteId) return;
    socketRef.current.emit('block-update', {
      noteId,
      blockId,
      content,
      version,
    });
  };

  const sendBlockAdd = (type: string, position: number, content: string) => {
    if (!socketRef.current || !noteId) return;
    socketRef.current.emit('block-add', {
      noteId,
      type,
      position,
      content,
    });
  };

  const sendBlockDelete = (blockId: string, version: number) => {
    if (!socketRef.current || !noteId) return;
    socketRef.current.emit('block-delete', {
      noteId,
      blockId,
      version,
    });
  };

  const sendCursorPosition = (blockId: string, position: number) => {
    if (!socketRef.current || !noteId) return;
    socketRef.current.emit('cursor-position', {
      noteId,
      blockId,
      position,
    });
  };

  const sendComment = (content: string, blockId?: string) => {
    if (!socketRef.current || !noteId) return;
    socketRef.current.emit('comment-add', {
      noteId,
      blockId,
      content,
    });
  };

  const getSocket = () => socketRef.current;

  return {
    socket: getSocket(),
    sendBlockUpdate,
    sendBlockAdd,
    sendBlockDelete,
    sendCursorPosition,
    sendComment,
  };
};
