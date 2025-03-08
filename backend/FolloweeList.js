const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFollowers = async (user_id) => {
  try {
    const following = await prisma.follower_table.findMany({
        where: { follower_id: user_id },
        select: {
            followed_id: true, // Only return followed_id
        },
    });
    
    const followedIds = following.map((f) =>f.followed_id);
    // Wait for FolloweeList function to resolve and get the following list

    if (!followedIds || followedIds.length === 0) {
      console.warn("No followees found.");
      return [];
    }

    // Return the list of followed IDs
    return followedIds;
  } catch (error) {
    console.error("Error fetching followees:", error);
    return [];
  }
};

const FollowerList =  async (req, res) => {
  const user_id = req;
  try {
    const following = await prisma.follower_table.findMany({
        where: { followed_id: user_id },
        select: {
            follower_id: true, // Only return followed_id
        },
    });
    
    const followerIds = following.map((f) =>f.follower_id,);
    res.status(200).json({
      message: "Following list fetched successfully",
      follower_ids: followerIds,
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Error fetching following list", error });
  }
};

module.exports = ({getFollowers,FollowerList});
