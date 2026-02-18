import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class CollaborationGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('presence')
  handlePresence(@MessageBody() data: any) {
    this.server.emit('presence', data);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: any) {
    this.server.emit('typing', data);
  }
}
