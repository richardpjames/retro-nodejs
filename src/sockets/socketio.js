// Import the socket.io server
const socketio = require('socket.io');
// For debugging
const debug = require('debug')('app:sockets');

// By having this here I can access from throughout the application
let io;

module.exports = {
  // Attach to the provided http server
  connectServer: (server) => {
    io = socketio(server, { cookie: false });
    io.on('connection', (socket) => {
      debug('Client connected');
      socket.on('join', (room) => {
        socket.join(room);
      });
      socket.on('leave', (room) => {
        socket.leave(room);
      });
    });
  },
  // Return the shared io object
  io: () => {
    return io;
  },
};
