const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
                // Fetch the username from the userid_table related to user_id2
                user_id2_user: {
                    select: {
                        username: true
                    }
                }
            }
        });

        const response = ids.map(chat => ({
            userId: chat.user_id2,
            username: chat.user_id2_user.username
        }));

        return res.status(200).json({ ids: response });
    } catch (error) {
        console.error("Error fetching chat IDs:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const addToChat = async (req, res) => {
    const sender_id = req.user.id;
    const { reciever_id } = req.body;

    try {
        // Validate input
        if (!reciever_id || !sender_id) {
            return res.status(400).json({ error: "Both sender_id and reciever_id are required" });
        }

        await prisma.chats_table.create({
            data: {
                user_id1: sender_id,
                user_id2: reciever_id
            }
        });

        if (sender_id !== reciever_id) {
            await prisma.chats_table.create({
                data: {
                    user_id1: reciever_id,
                    user_id2: sender_id
                }
            });
        }

        return res.status(201).json({ message: "Chat created successfully" });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { addToChat, getChatIds };
