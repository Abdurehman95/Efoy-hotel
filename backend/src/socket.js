import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin or any localhost/127.0.0.1 port
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        callback(null, true);
      },
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Client connected to Real-Time Gateway: ${socket.id}`);

    // Join station channels (e.g. 'reception', 'kitchen', 'housekeeping', 'admin', 'guest')
    socket.on('join_terminal', (terminalRole) => {
      socket.join(terminalRole);
      console.log(`📡 Socket ${socket.id} joined terminal channel: ${terminalRole}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected from Real-Time Gateway: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitPmsEvent = (event, payload, targetRole = null) => {
  if (!ioInstance) return;
  if (targetRole) {
    ioInstance.to(targetRole).emit(event, payload);
  } else {
    ioInstance.emit(event, payload);
  }
};

export default {
  initSocket,
  getIO,
  emitPmsEvent,
};
