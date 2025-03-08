require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { transformArguments } = require('@redis/client/dist/lib/commands/ACL_CAT');
const prisma = new PrismaClient();

const profile = async (req, res) => {
    const { username } = req.params; // Assuming the username is in the request body
    const CurrentUser  = req.user.id;
    try {
        if (!username) {
            return res.status(400).json({ error: "This Link Doesn't Exist" });
        }

        // Fetch user from the database
        const User = await prisma.userid_table.findUnique({
            where: {
                username: username,  // Ensure you are using the correct field for lookup
            },
            select:{
                user_id:true,
                username: true,
                followed_by: true,
                followers: true,
                last_seen:true,
                description:true,
            }
        });

        if (!User) {
            return res.status(404).json({ error: "User not found" }); // 404 for user not found
        }
        const posts = await prisma.posts_table.findMany({
            where:{
                user_id:User.user_id,
            },
            select:{
                id:true,
                link:true,
                created_at:true,
                like_count:true,
            },
            orderBy: {
                created_at: 'desc',  // Ordering by 'created_at' in descending order
            },
        });
        const isFriend = await prisma.follower_table.findFirst({
            where:{
                follower_id:CurrentUser,
                followed_id:User.user_id,
            }
        });
        let IsFriend=true;
        if(!isFriend){IsFriend=false;}
        const response = {
            username:username,
            followed_by:User.followed_by,
            followers:User.followers,
            last_seen:User.last_seen,
            posts:posts,
            description:User.description,
            IsFriend
        };
        return res.status(200).json(response);
        // Return user JSON
    } catch (error) {
        console.error("Error Finding User", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const editDescription = async (req, res) => {
    const user_id = req.user?.id; // Ensure user_id exists
    const { description } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "Not a valid user" });
    }

    try {
        await prisma.userid_table.update({
            where: { user_id: user_id },
            data: { description: description }
        });

        return res.status(200).json({ message: "Task done successfully" });
    } catch (error) {
        console.error("Error updating description:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



module.exports = { profile,editDescription};
