// Import the socket.io server
const socketio = require('socket.io');
// For debugging
const debug = require('debug')('app:sockets');

// By having this here I can access from throughout the application
let io;

module.exports = {
  // Attach to the provided http server
  connectServer: (server) => {
    io = socketio(server);
    io.on('connection', (socket) => {
      debug('Client connected');
      socket.on('join', (room) => {
        debug(`Client joined room - ${room}`);
        socket.join(room);
      });
    });
  },
  // Return the shared io object
  io: () => {
    return io;
  },
};
