const RefreshAuthenticationUseCase = require("../RefreshAuthenticationUseCase");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const TokenManager = require("../../security/TokenManager");

describe("RefreshAuthenticationUseCase", () => {
  it("should orchestrate the refresh token action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "refresh_token",
    };

    const expectedAccessToken = "new_access_token";

    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockTokenManager = TokenManager;

    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockResolvedValue();
    jest
      .spyOn(mockTokenManager, "verifyRefreshToken")
      .mockReturnValue({ username: "user", id: "user-123" });
    jest
      .spyOn(mockTokenManager, "generateAccessToken")
      .mockReturnValue(expectedAccessToken);

    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager,
    });

    // Action
    const accessToken =
      await refreshAuthenticationUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(
      useCasePayload.refreshToken,
    );
    expect(mockTokenManager.verifyRefreshToken).toBeCalledWith(
      useCasePayload.refreshToken,
    );
    expect(mockTokenManager.generateAccessToken).toBeCalledWith({
      username: "user",
      id: "user-123",
    });
    expect(accessToken).toEqual(expectedAccessToken);
  });
});
