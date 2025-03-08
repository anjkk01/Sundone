const express = require("express");
const { FolloweeList } = require("./FolloweeList");
const { PrismaClient } = require('@prisma/client');
const {getUserFeed} = require('./CacheFeed');
const prisma = new PrismaClient();

const getFeed = async (req, res) => {
  try {
    const acuser = req.user;
    if (!acuser) {
      return res.status(500).json({ redirect: "/signin", message: "Error generating feed" });
    }

    let userId = req.user.id;
    userId=parseInt(userId);
    const posts = await getUserFeed(userId);
    const result = await Promise.all(posts.map(async (post) => {
      const liked = await prisma.like_table.findFirst({
        where: {
          user_id: userId,
          post_id: post.id,
        },
      });
      const likeCount = await prisma.posts_table.findUnique({
        where: {
          id:post.id,
        }
      });
      return {
        postId: post.id,
        postUsername: post.userid_table.username,  // The username of the post creator
        likeCount:likeCount.like_count,  // Number of likes on the post
        liked: liked ? true : false,  // Whether the current user liked the post
        createdAt: post.created_at,
        link: post.link,  // Link to the post content (image, video, etc.)
      };
    }));
    console.log(result);
    res.status(200).json({ feed: result });

  } catch (error) {
    console.error("Error generating feed:", error);
    res.status(500).json({ message: "Error generating feed", error });
  }
};

module.exports = { getFeed };
