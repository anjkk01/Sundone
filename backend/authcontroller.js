const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

const generateTokens = async (user_id, username) => {
  const accessToken = jwt.sign(
    { id: user_id, username: username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user_id, username: username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};


const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify the token using the secret
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Fetch the user from the database
    const user = await prisma.userid_table.findUnique({
      where: { user_id: decoded.id },
    });
    if (!user || user.refresh_token !== refreshToken) {
      return { success: false, message: "Invalid or expired refresh token" };
    }
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.user_id, user.username);

    // Update refresh token in DB
    await prisma.userid_table.update({
      where: { user_id: user.user_id },
      data: { refresh_token: newRefreshToken },
    });

    return { success: true, accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Invalid Token:", error);
    return { success: false, message: error.message };
  }
};

const logoutUser = async(req,res) => {
  const {user_id}=req.body;
  await prisma.userid_table.update({
    where: { id: user_id },
    data: { refresh_token: "" },
  });
  // we cant set something to "undefined" from update fn directly
  const options = {
      httpOnly: true,
      secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)    // Clear the access token cookie
  .clearCookie("refreshToken", options)   // Clear the refresh token cookie
  .json({
    status: 200,
    message: "Logged out successfully"
  });
};
module.exports = {refreshAccessToken,logoutUser,generateTokens};