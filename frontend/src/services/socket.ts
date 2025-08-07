import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:5000', {
  autoConnect: false, // chỉ connect khi cần
});

export default socket;
