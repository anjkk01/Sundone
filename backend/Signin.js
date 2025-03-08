const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const signin = async (req,res) =>{
    const {username , password} = req.body;
    try{
        const existingUser = await prisma.userid_table.findUnique({
            where: { username: username },
        });

        if (!existingUser) {
            return res.status(400).json({ message: "Username doesn't exist"});
        }
        const isPasswordValid = await bcrypt.compare(password, existingUser.password_hash);

        if (!isPasswordValid) {
          return res.status(400).json({ message: "Incorrect Username or Password" });
        }
        const accessToken = jwt.sign(
          { id: existingUser.user_id, username: existingUser.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" } // Short expiry for access tokens
        );
    
        const refreshToken = jwt.sign(
          { id: existingUser.user_id, username: existingUser.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "7d" } // Longer expiry for refresh tokens
        );
        await prisma.userid_table.update({
          where:{
            username:username,
          },
          data:{
            refresh_token:refreshToken,
          }
        });
        const options = {
          httpOnly: true,
          secure: true
        }
        return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: 15 * 60 * 1000 }) // 15 minutes
        .cookie("refreshToken", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
        .json({
          status: 200,
          message: "Login successful",
          loggedInUser: { id: existingUser.id, username: existingUser.username }, // Send user data
        });
    } catch (error) {
      console.error("Error during SignIn:", error);
      res.status(500).json({ message: "Error during SignIn", error });
    }
};
module.exports = { signin };