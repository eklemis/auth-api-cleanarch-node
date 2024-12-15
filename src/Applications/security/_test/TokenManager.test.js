const Jwt = require("@hapi/jwt");
const TokenManager = require("../TokenManager");
const InvariantError = require("../../../Commons/excetions/InvariantError");
const config = require("../../../Commons/config");

jest.mock("@hapi/jwt");

describe("TokenManager", () => {
  describe("generateAccessToken function", () => {
    it("should generate access token correctly", () => {
      // Arrange
      const payload = { username: "user", id: "user-123" };
      Jwt.token.generate.mockReturnValue("access_token");

      // Action
      const accessToken = TokenManager.generateAccessToken(payload);

      // Assert
      expect(accessToken).toEqual("access_token");
      expect(Jwt.token.generate).toHaveBeenCalledWith(
        payload,
        config.token.accessTokenKey,
      );
    });
  });

  describe("generateRefreshToken function", () => {
    it("should generate refresh token correctly", () => {
      // Arrange
      const payload = { username: "user", id: "user-123" };
      Jwt.token.generate.mockReturnValue("refresh_token");

      // Action
      const refreshToken = TokenManager.generateRefreshToken(payload);

      // Assert
      expect(refreshToken).toEqual("refresh_token");
      expect(Jwt.token.generate).toHaveBeenCalledWith(
        payload,
        config.token.refreshTokenKey,
      );
    });
  });

  describe("verifyRefreshToken function", () => {
    it("should verify refresh token correctly", () => {
      // Arrange
      const refreshToken = "valid_refresh_token";
      const decodedPayload = { username: "user", id: "user-123" };

      Jwt.token.decode.mockReturnValue({
        decoded: { payload: decodedPayload },
      });
      Jwt.token.verifySignature.mockReturnValue(true);

      // Action
      const payload = TokenManager.verifyRefreshToken(refreshToken);

      // Assert
      expect(payload).toEqual(decodedPayload);
      expect(Jwt.token.decode).toHaveBeenCalledWith(refreshToken);
      expect(Jwt.token.verifySignature).toHaveBeenCalledWith(
        { decoded: { payload: decodedPayload } },
        config.token.refreshTokenKey,
      );
    });

    it("should throw InvariantError when token is invalid", () => {
      // Arrange
      const refreshToken = "invalid_refresh_token";

      Jwt.token.decode.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      // Action and Assert
      expect(() => TokenManager.verifyRefreshToken(refreshToken)).toThrow(
        InvariantError,
      );
    });
  });
});
