import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Post()
  async createWorkspace(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(
      'default-user',
      createWorkspaceDto,
    );
  }

  @Get()
  async getWorkspaces() {
    return this.workspaceService.getWorkspaces('default-user');
  }

  @Get(':id')
  async getWorkspace(@Param('id') workspaceId: string) {
    return this.workspaceService.getWorkspace(workspaceId, 'default-user');
  }

  @Post(':id/members/:memberId')
  async addMember(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceService.addMember(
      workspaceId,
      'default-user',
      memberId,
    );
  }

  @Post(':id/members/:memberId/remove')
  async removeMember(
    @Param('id') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceService.removeMember(
      workspaceId,
      'default-user',
      memberId,
    );
  }
}
