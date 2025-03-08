const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const comments = async (rawComments) => {
  return Promise.all(
    rawComments.map(async (comment) => {
      const ussr = await prisma.userid_table.findUnique({
        where: { user_id: comment.user_id }
      });

      return {
        id: comment.id,
        text: comment.text,
        user_id: comment.user_id,
        post_id: comment.post_id,
        created_at: comment.created_at,
        user: ussr?.username || "Unknown User" // Safe access with a fallback
      };
    })
  );
};
const postpage =  async (req, res) => {
  const {post_id} = req.params;
  const user_id = req.user.id;
  try {
    const post = await prisma.posts_table.findUnique({
        where: { id: parseInt(post_id) },
    });
    let is_Liked = false;
    if(user_id){
      const action = await prisma.like_table.findFirst({
        where: { post_id: parseInt(post_id) , user_id: parseInt(user_id)},
      });
      if(action)is_Liked=true;
    }
    const rawUsername = await prisma.userid_table.findUnique({
      where:{
        user_id:parseInt(post.user_id),
      },
      select:{
        username:true,
      }
    });
    const username=rawUsername.username;
    const rawComments = await prisma.comments_table.findMany({
      where: {post_id:parseInt(post_id)},
      orderBy:{
        created_at:'desc',
      }
    });
    const rlc = await comments(rawComments);
    res.status(200).json({
      post,
      is_Liked,
      rawComments:rlc,
      username,
    });
  } catch (error) {
    console.error("Error fetching following list:", error);
    res.status(500).json({ message: "Error fetching following list", error });
  }
};

module.exports = {postpage};
