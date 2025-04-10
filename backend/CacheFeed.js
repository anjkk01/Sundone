const express = require("express");
const { FolloweeList } = require("./FolloweeList"); // Import the followerlist logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const LRU = require('lru-cache');
const {getFollowers} = require("./FolloweeList");
const feedCache = new LRU.LRUCache({
    max: 500, // 500 items at max
    ttl: 1000 * 60 * 500 // 500 minutes
});


async function fetchFeedFromDatabase(userId){

  const user_id = userId;

    const following = await getFollowers(user_id);  // Use await to get the result

    const posts = await prisma.posts_table.findMany({
      where: {
        user_id: {
          in: following,  // Use the array of followed IDs
        },
      },
      select: {
        id:true,
        user_id: true,
        link: true,
        created_at: true,
        userid_table: {
          select: {
            username: true,  // Fetch username from userid_table
          },
        },
      },
      orderBy: {
        created_at: "desc",  // Sort posts by creation date (latest first)
      },
      take :20,
    });
    return posts;
}

// Function to get user feed (first checks LRU cache)
async function getUserFeed(userId) {
    if (feedCache.has(userId)) {
        return feedCache.get(userId);
    }

    console.log(`Cache miss for user ${userId}, fetching from DB...`);
    const feedData = await fetchFeedFromDatabase(userId); // Replace with DB call
    // Store in cache before returning
    feedCache.set(userId, feedData);
    return feedData;
}

module.exports = {getUserFeed,feedCache};