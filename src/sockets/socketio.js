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
    io.set(
      'origins',
      'http://localhost:3000 https://retrospectacle.io:* https://www.retrospectacle.io:*',
    );
    io.on('connection', (socket) => {
      debug('Client connected');
      socket.on('join', (room) => {
        debug(`Client Joining ${room}`);
        socket.join(room);
      });
      socket.on('leave', (room) => {
        debug(`Client Leaving ${room}`);
        socket.leave(room);
      });
    });
  },
  // Return the shared io object
  io: () => {
    return io;
  },
};
