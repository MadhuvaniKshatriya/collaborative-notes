import { Module } from '@nestjs/common';
import { NotesGateway } from './notes.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, ActivityModule],
  providers: [NotesGateway],
  exports: [NotesGateway],
})
export class GatewayModule {}
