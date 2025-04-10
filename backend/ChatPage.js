const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// const { redisClient } = require('./redisClient');

const { createClient } = require("redis");

// Redis Client
const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

const getChatIds = async (req, res) => {
    const user_id = req.user.id;
    try {
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const ids = await prisma.chats_table.findMany({
            where: {
              user_id1: user_id
            },
            select: {
              user_id2: true,
              user2: {
                select: {
                  username: true
                }
              }
            }
          });
          

          const response = ids.map(chat => ({
            userId: chat.user_id2,
            username: chat.user2.username
          }));

        return res.status(200).json({ ids: response });
    } catch (error) {
        console.error("Error fetching chat IDs:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const openChat = async (req,res) =>{

    const sender_id = req.user.id;
    const { reciever_username } = req.params;

    try {
        // Validate input
        if (!reciever_username || !sender_id) {
            return res.status(400).json({ error: "Both sender_id and reciever_id are required" });
        }

        let reciever_body = await prisma.userid_table.findUnique({
            where:{
                username:reciever_username
            },
            select:{
                user_id : true
            }
        });
        if(!reciever_body){
            return res.status(400).json({ error: "Reciever Invalid" });
        }
        let reciever_id = reciever_body.user_id;
        let u1,u2;
        if(sender_id<reciever_id){
            u1 = sender_id;
            u2 = reciever_id;
        }
        else{
            u1 = reciever_id;
            u2 = sender_id;
        }
        const redisKey = `chat-${u1}-${u2}`;
        const messages = await redisClient.lRange(redisKey, 0, -1);
        const parsedMessages = messages.map(msg => JSON.parse(msg));
        return res.status(200).json({
            message: "Chat retrieved successfully",
            data: parsedMessages,
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }

}


const addToChat = async (req, res) => {
    const sender_id = req.user.id;
    const { reciever_username } = req.params;

    try {
        // Validate input
        if (!reciever_username || !sender_id) {
            return res.status(400).json({ error: "Both sender_id and reciever_id are required" });
        }
        let reciever_body = await prisma.userid_table.findUnique({
            where:{
                username:reciever_username
            },
            select:{
                user_id : true
            }
        });
        if(!reciever_body){
            return res.status(400).json({ error: "Reciever Invalid" });
        }
        let reciever_id = reciever_body.user_id;
        if (sender_id !== reciever_id) {
            await prisma.chats_table.create({
                data: {
                    user_id1: reciever_id,
                    user_id2: sender_id
                }
            });
            await prisma.chats_table.create({
                data: {
                    user_id1: sender_id,
                    user_id2: reciever_id
                }
            });
        }

        return res.status(201).json({ message: "Chat created successfully" });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { addToChat, getChatIds,openChat };
