// verifySocketJWT.js
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { refreshAccessToken } = require('./authcontroller'); // Your function to refresh tokens

dotenv.config();

const verifySocketJWT = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  const refreshToken = socket.handshake.auth?.refreshToken;

  if (!token) {
    return next(new Error('Authentication error: No access token provided'));
  }

  try {

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    return next();
  } catch (err) {

    if (err.name === 'TokenExpiredError') {
      if (!refreshToken) {
        return next(new Error('Authentication error: Token expired and no refresh token provided'));
      }
      try {

        const refreshDecoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const newTokens = await refreshAccessToken(refreshToken);
        if (!newTokens.accessToken || !newTokens.refreshToken) {
          return next(new Error('Authentication error: Refresh token invalid or expired'));
        }

        const newAccessToken = jwt.sign(
          { id: refreshDecoded.id, username: refreshDecoded.username },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '1h' }
        );

        socket.user = refreshDecoded;
        socket.newAccessToken = newAccessToken;
        return next();
      } catch (refreshErr) {
        console.error('Refresh token verification failed:', refreshErr);
        return next(new Error('Authentication error: Invalid refresh token'));
      }
    } else {
      console.error('JWT verification error:', err);
      return next(new Error('Authentication error: Invalid token'));
    }
  }
};

module.exports = verifySocketJWT;
