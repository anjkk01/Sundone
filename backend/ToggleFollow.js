const express = require("express");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { feedCache} = require("./CacheFeed");
const ToggleFollow = async (req, res) => {
    const userId = req.user.id;
    const { Followerusername } = req.body;
    try {
        // Validate inputs
        if (!userId || !Followerusername) return res.status(400).json({ message: "Invalid User" });
        let Follower = await prisma.userid_table.findUnique({
            where:{username:Followerusername}
        });
        Follower=Follower.user_id;
        if (userId === Follower) return res.status(400).json({ message: "You cannot follow yourself" });

        // Check if already following
        const isFollowing = await prisma.follower_table.findFirst({
            where: {
                follower_id: userId,
                followed_id: Follower,
            }
        });
        console.log(isFollowing);
        feedCache.delete(userId);
        if (isFollowing) {
            // Unfollow user
            await prisma.follower_table.deleteMany({
                where: {
                    follower_id: userId,
                    followed_id: Follower,
                }
            });

            // Decrement follow counts
            await prisma.$transaction([
                prisma.userid_table.update({
                    where: {
                        user_id: userId
                    },
                    data: {
                        followed_by: {
                            decrement: 1,
                        },
                    }
                }),
                prisma.userid_table.update({
                    where: {
                        user_id: Follower
                    },
                    data: {
                        followers: {
                            decrement: 1,
                        },
                    }
                })
            ]);

            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            // Follow user
            await prisma.follower_table.create({
                data: {
                    follower_id: userId,
                    followed_id: Follower,
                }
            });

            // Increment follow counts
            await prisma.$transaction([
                prisma.userid_table.update({
                    where: {
                        user_id: userId
                    },
                    data: {
                        followed_by: {
                            increment: 1,
                        },
                    }
                }),
                prisma.userid_table.update({
                    where: {
                        user_id: Follower
                    },
                    data: {
                        followers: {
                            increment: 1,
                        },
                    }
                })
            ]);

            return res.status(200).json({ message: "Followed successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error, message: "Server Error" });
    }
}

module.exports = { ToggleFollow };
