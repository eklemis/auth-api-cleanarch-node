const Jwt = require("@hapi/jwt");
const InvariantError = require("../../Commons/excetions/InvariantError");
const config = require("../../Commons/config");

const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, config.token.accessTokenKey),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, config.token.refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.token.refreshTokenKey);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError("Refresh token tidak valid");
    }
  },
};

module.exports = TokenManager;
