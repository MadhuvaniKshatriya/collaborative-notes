import { Controller, Patch, Param, Get } from '@nestjs/common';
import { RevisionsService } from './revisions.service';

@Controller('revisions')
export class RevisionsController {
  constructor(private readonly revisionsService: RevisionsService) {}

  @Patch(':revisionId/restore')
  restore(
    @Param('revisionId') revisionId: string,
  ) {
    // Extract noteId from the revision itself
    return this.revisionsService.restoreByRevisionId(revisionId);
  }
}
