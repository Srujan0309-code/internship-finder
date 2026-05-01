const jwt = require('jsonwebtoken');

/**
 * Signs a short-lived access token (default 15m)
 */
const signAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

/**
 * Signs a long-lived refresh token (default 7d)
 */
const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

/**
 * Verifies a refresh token and returns decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Generates access + refresh token pair
 */
const generateTokenPair = (userId, role) => ({
  accessToken: signAccessToken(userId, role),
  refreshToken: signRefreshToken(userId),
});

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, generateTokenPair };
