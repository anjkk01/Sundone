const dotenv = require('dotenv'); // Import your DB functions
const {refreshAccessToken} = require("./authcontroller");
const jwt = require('jsonwebtoken');
dotenv.config();
const cookieParser = require("cookie-parser");
// Middleware to verify JWT token
const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken; // Extract from cookies or Bearer token
    const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies or header
    let istoken = true;
    if(!token)istoken=false;
    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'No access token provided.',
        redirectTo: '/signup' // Redirect to signup if no token
      });
    }
    try {
      // Step 1: Verify access token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded; // Attach user data to request
      return next(); // Proceed if access token is valid
    } catch (err) {
      if (err.name === 'TokenExpiredError' || istoken===false) {
        // Step 2: Access token expired, check refresh token
        if (!refreshToken) {
          return res.status(401).json({
            message: 'Access token expired and no refresh token available. Please log in again.',
            redirectTo: '/login'
          });
        }
        // Step 3: Verify refresh token
        const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        // Step 4: Validate refresh token from database
        const newCookies = await refreshAccessToken(refreshToken);
        const newaccesstoken = newCookies.accessToken;
        const newrefreshToken = newCookies.refreshToken;
        if (!newaccesstoken || !newrefreshToken) {
          return res.status(401).json({
            message: 'Refresh token invalid or expired. Please log in again.',
            redirectTo: '/login'
          });
        }

        // Step 7: Set cookies securely
        const isProduction = true;
        const cookieOptions = {
          httpOnly: true,
          secure: true, // Only secure in production
          sameSite: isProduction ? 'Strict' : 'Lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        res.cookie('refreshToken', newrefreshToken, cookieOptions);
        res.cookie('accessToken', newaccesstoken, cookieOptions); 
        req.user = { id: refreshDecoded.id, username: refreshDecoded.username };
         // Attach user data to request
        return next(); // Proceed to the next middleware
      }
      // If token is invalid (wrong signature, etc.)
      return res.status(401).json({
        message: 'Invalid access token. Please log in again.',
        redirectTo: '/login'
      });
    }
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = verifyJWT;
