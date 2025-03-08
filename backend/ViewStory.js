const express = require("express");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {getFollowers} = require("./FolloweeList");
const Stories = async (req , res) =>{
    const user_id = req.user.id;
    try{
        if(!user_id){return res.status(400).json({ error: "User ID not provided" });}
        const following=await getFollowers(user_id);

        const stories = [];

        for(let i=0;i<following.length;i++){
          const hisStories = await prisma.stories.findMany({
            where:{user_id:following[i]},
            select: {
                story_id:true,
                user_id:true,
                url:true,
                timestamp:true,
                userid_table: {
                    select: {
                      username: true,  // Fetch username from userid_table
                    },
                },
            },
            orderBy:{timestamp:'asc'}
          });
          if(hisStories.length===0){}
          else{
            stories.push(hisStories);
          }
        }

        stories.sort((a, b) =>
          new Date(b[b.length-1].timestamp).getTime() - new Date(a[a.length-1].timestamp).getTime()
        );
        

        const postioner = [];
        const newStories = [];

        for(let i=0;i<stories.length;i++){
          const ifViewed = await prisma.story_viewed.findFirst({
            where:{story_id:stories[i][0].story_id,viewer_id:user_id}
          })
          let actViewed = true;
          if(!ifViewed)actViewed=false;
          postioner[i]=actViewed;
          if(!postioner[i])newStories.push(stories[i]);
        }
        for(let i=0;i<stories.length;i++)if(postioner[i])newStories.push(stories[i]);
        res.status(200).json(newStories);
  }catch(error){
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const ViewStoryAction = async (req, res) => {
  const user_id = req.user.id;
  const { story_id } = req.body;
  
  try {
    if (!user_id) {
      return res.status(400).json({ error: "User ID not provided" });
    }
    if (!story_id) {
      return res.status(400).json({ error: "Story ID not provided" });
    }

    const storyExists = await prisma.stories.findUnique({
      where: {story_id: story_id}
    });

    if (!storyExists) {
      return res.status(404).json({ error: "Story not found" });
    }

    const alreadyViewed = await prisma.story_viewed.findFirst({
      where: {
        viewer_id: user_id,
        story_id: story_id
      }
    });

    if (alreadyViewed) {
      return res.status(200).json({ message: "Story already viewed" });
    }

    await prisma.story_viewed.create({
      data: {
        viewer_id: user_id,
        story_id: story_id
      }
    });

    res.status(200).json({ message: "Story Viewed Successfully" });

  } catch (error) {
    console.error("Error watching story:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {Stories,ViewStoryAction};