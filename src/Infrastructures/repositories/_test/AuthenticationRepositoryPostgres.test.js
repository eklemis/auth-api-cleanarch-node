const pool = require("../../database/postgres/pool");
const AuthenticationRepositoryPostgres = require("../AuthenticationRepositoryPostgres");
const InvariantError = require("../../../Commons/excetions/InvariantError");

describe("AuthenticationRepositoryPostgres", () => {
  afterEach(async () => {
    await pool.query("DELETE FROM authentications WHERE 1=1");
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addAuthentication function", () => {
    it("should persist authentication token", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool,
      );
      const token = "refresh_token";

      // Action
      await authenticationRepository.addAuthentication(token);

      // Assert
      const result = await pool.query(
        "SELECT token FROM authentications WHERE token = $1",
        [token],
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].token).toEqual(token);
    });
  });

  describe("checkAvailabilityToken function", () => {
    it("should not throw error if token exists", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool,
      );
      const token = "refresh_token";
      await pool.query("INSERT INTO authentications (token) VALUES ($1)", [
        token,
      ]);

      // Action & Assert
      await expect(
        authenticationRepository.checkAvailabilityToken(token),
      ).resolves.not.toThrowError(InvariantError);
    });

    it("should throw InvariantError if token does not exist", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool,
      );
      const token = "invalid_token";

      // Action & Assert
      await expect(
        authenticationRepository.checkAvailabilityToken(token),
      ).rejects.toThrowError(InvariantError);
    });
  });

  describe("deleteAuthentication function", () => {
    it("should delete authentication token", async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(
        pool,
      );
      const token = "refresh_token";
      await pool.query("INSERT INTO authentications (token) VALUES ($1)", [
        token,
      ]);

      // Action
      await authenticationRepository.deleteAuthentication(token);

      // Assert
      const result = await pool.query(
        "SELECT token FROM authentications WHERE token = $1",
        [token],
      );
      expect(result.rows).toHaveLength(0);
    });
  });
});
