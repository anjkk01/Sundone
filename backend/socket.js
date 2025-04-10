// socket.js
const socketIo = require('socket.io');
const verifySocketJWT = require('./verifySocketJWT'); // You'll implement this
const { redisClient } = require('./redisClient');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = function setupSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // JWT authentication middleware
  io.use(verifySocketJWT);

  io.on('connection', async (socket) => {
    const uss = socket.user;
    if (!uss) {
      console.log(`Missing username in socket`);
      return socket.disconnect(true);
    }
    const username = socket.user.username;

    try {
      const userId = socket.user.id;
      if (!userId) throw new Error('User ID not found');

      // Save and join user's personal room

      socket.user.id = userId;
      const personalRoom = `user-${userId}`;
      socket.join(personalRoom);

      // console.log(`Socket ${socket.id} connected as ${username} (User ID: ${userId})`);

      if (socket.newAccessToken) {
        socket.emit('tokenRefreshed', {
          accessToken: socket.newAccessToken,
        });
      }

      // Listen for messages to send to another user
      
      socket.on("send-message-to-user", async ({ toUserUsername, message }) => {
        if (!toUserUsername || !message) return;
        const toUserIdBody = await prisma.userid_table.findFirst({
          where:{
            username: toUserUsername
          },
          select:{
            user_id:true
          }
        });
        const toUserId = toUserIdBody.user_id;
        const payload = {
          from: userId,
          to: toUserId,
          message,
          timestamp: new Date().toISOString(),
        };

        //DB store as in redis store
        let u1,u2;
        if(userId<toUserId){
          u1 = userId;u2 = toUserId;
        }
        else{
          u1 = toUserId;u2 = userId;
        }
        const redisKey = `chat-${id1}-${id2}`;
        await redisClient.rPush(redisKey, JSON.stringify(payload));


        // Emit to the recipient's personal room

        io.to(`user-${toUserId}`).emit("receive-message", payload);
      });
      socket.on("ping", () => {
        socket.emit("pong");
      });

    } catch (err) {
      console.error("Error on connection:", err.message);
      socket.disconnect(true);
    }
  });

  return io;
};
