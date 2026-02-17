import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('notes/:noteId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  async getComments(@Param('noteId') noteId: string) {
    return this.commentsService.getComments(noteId);
  }

  @Post()
  async createComment(
    @Param('noteId') noteId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    // TODO: Verify user has access to note and workspace
    return this.commentsService.createComment(
      noteId,
      'default-workspace',
      'default-user',
      createCommentDto,
    );
  }

  @Post(':commentId/resolve')
  async resolveComment(
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.resolveComment(commentId, 'default-user');
  }

  @Post(':commentId/unresolve')
  async unresolveComment(@Param('commentId') commentId: string) {
    return this.commentsService.unresolveComment(commentId);
  }

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.deleteComment(commentId, 'default-user');
  }
}
