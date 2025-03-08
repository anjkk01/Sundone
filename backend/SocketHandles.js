const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redisClient = require("./redisClient");
module.exports = function(socket, io) {

  socket.on('login', async (data) => {
    const { userId } = socket.user.id;
    if (!userId) {
      socket.emit('error', { message: 'User ID is required for login.' });
      return;
    }
    socket.join(`user-${userId}`);

    try {
      // Mark user as online
      await prisma.userid_table.update({
        where: { user_id: userId },
        data: {
          isonline: true,
          last_seen: new Date(),
        },
      });

      socket.emit('loginSuccess', { message: 'Logged in successfully', userId, chatHistory });
      io.emit('userOnline', { userId, status: 'online' });
    } catch (error) {
      console.error('Login error:', error);
      socket.emit('error', { message: 'Login failed due to a server error.' });
    }
  });

  socket.on('chatMessage', async (data) => {
    const { senderId, recipientId, message } = data;
    if (!senderId || !recipientId || !message) {
      socket.emit('error', { message: 'Missing sender, recipient, or message.' });
      return;
    }
    try {
      let id1=Math.min(senderId,recipientId),id2=Math.max(senderId,recipientId);

      const chatKey = `chat-${id1}-${id2}`;

      const messageData = JSON.stringify({ message, senderId });

      await redisClient.rPush(chatKey, messageData); 
      
      io.to(`user-${recipientId}`).emit('chatMessage', message);

    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('error', { message: 'Failed to send message due to a server error.' });
    }
  });

  // LOGOUT event
  socket.on('logout', async () => {
    const userId = socket.userId;
    if (!userId) return;
    try {
      // Mark the user as offline
      await prisma.userid_table.update({
        where: { user_id: userId },
        data: {
          isonline: false,
          last_seen: new Date(),
        },
      });

      io.to(`user-${userId}`).emit('userOffline', { userId, status: 'offline' });
      socket.emit('logoutSuccess', { message: 'Logged out successfully', userId, status: 'offline' });
    } catch (error) {
      console.error('Logout error:', error);
      socket.emit('error', { message: 'Logout failed due to a server error.' });
    }
    socket.disconnect(true);
  });

  // DISCONNECT event (for unexpected disconnects)
  socket.on('disconnect', async (reason) => {
    const userId = socket.userId;
    if (!userId) return;
    try {
      await prisma.userid_table.update({
        where: { user_id: userId },
        data: {
          isonline: false,
          last_seen: new Date(),
        },
      });

      io.to(`user-${userId}`).emit('userOffline', { userId, status: 'offline' });
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  });
};
