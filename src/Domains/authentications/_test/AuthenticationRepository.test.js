const AuthenticationRepository = require("../AuthenticationRepository");

describe("AuthenticationRepository", () => {
  it("should throw error when invoke unimplemented method", async () => {
    // Arrange
    const authenticationRepository = new AuthenticationRepository();

    // Action & Assert
    await expect(
      authenticationRepository.addAuthentication("token"),
    ).rejects.toThrowError("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      authenticationRepository.checkAvailabilityToken("token"),
    ).rejects.toThrowError("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(
      authenticationRepository.deleteAuthentication("token"),
    ).rejects.toThrowError("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  });
});
