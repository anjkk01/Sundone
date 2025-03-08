require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CreateCommentAction = async (req, res) => {
    let { post_id, comment } = req.body;
    post_id = parseInt(post_id);
    const user_id = parseInt(req.user.id);
    try {
        // Validate request parameters
        if (!post_id) {
            return res.status(400).json({ error: "Post ID is required" });
        }
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        if(!comment){
            return res.status(400).json({ error: "No Comment Text" });
        }
        const newComment = await prisma.comments_table.create({
            data: {
                user_id: user_id,
                post_id: post_id,
                text: comment,
            }
        });
        return res.status(200).json({ message: "Post Commented successfully",
            id:newComment.id,
            username:req.user.username
        });
        
    } catch (error) {
        console.error("Error in likeAction:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { CreateCommentAction };
