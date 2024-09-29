import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // URL del servidor
  }

  joinRoom(roomId: string) {
    this.socket.emit('join', roomId);
  }

  onGraphUpdate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('updateGraph', (graphData: any) => {
        observer.next(graphData);
      });
    });
  }

  sendGraphChange(roomId: string, graph: any) {
    this.socket.emit('graphChanged', { roomId, graph });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
