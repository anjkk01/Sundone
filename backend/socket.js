// socket.js
const socketIo = require('socket.io');
const SocketHandles = require('./SocketHandles');
const verifySocketJWT = require('./verifySocketJWT');

module.exports = function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(verifySocketJWT);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user?.username}`);

    if (socket.newAccessToken) {
      socket.emit('tokenRefreshed', { accessToken: socket.newAccessToken });
    }

    SocketHandles(socket, io);
  });

  return io;
};
