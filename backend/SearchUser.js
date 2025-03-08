require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchuser = async(req,res)=>{
    const {SearchUser} = req.body;
    try{
        if (!SearchUser) {
            return res.status(400).json({ error: "Search term is required" });
        }
        const rawUsernames = await prisma.userid_table.findMany({
            where: {
                username: {
                    contains: SearchUser,  // Substring match (case-sensitive)
                    mode: 'insensitive'    // Makes it case-insensitive
                }
            },
            select: {
                username: true,
            }
        });
        const usernames = rawUsernames.map(users => users.username);
        return res.status(200).json({ usernames });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = {searchuser};