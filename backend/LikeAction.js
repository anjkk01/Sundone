require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LikeAction = async (req, res) => {
    let {post_id} = req.params;
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

        // Check if the like already exists
        const alreadyLiked = await prisma.like_table.findFirst({
            where: {
                post_id: post_id,
                user_id: user_id,
            }
        });

        // Start a transaction to ensure atomicity
        const transaction = await prisma.$transaction(async (tx) => {
            const post = await tx.posts_table.findUnique({
                where: { id: post_id },
                select: { like_count: true },
            });

            if (!post) {
                throw new Error("Post not found");
            }

            let newLikeCount = post.like_count || 0;

            if (!alreadyLiked) {
                // Add like and update like_count
                await tx.like_table.create({
                    data: {user_id: user_id,post_id: post_id,},
                });
                newLikeCount++;
            } else {
                // Remove like and update like_count
                await tx.like_table.delete({
                    where: { user_id_post_id: {
                        user_id: user_id,
                        post_id: post_id,
                      } },
                }); // Prevent negative like count
                newLikeCount--;
            }
            // Update the like_count on the post
            await tx.posts_table.update({
                where: { id: post_id },
                data: { like_count: newLikeCount },
            });

            return newLikeCount;
        });

        // Return success message
        res.status(200).json({
            message: alreadyLiked ? "Like removed successfully" : "Post liked successfully",
            like_count: transaction,  // Return the updated like count
        });

    } catch (error) {
        console.error("Error in likeAction:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { LikeAction };
