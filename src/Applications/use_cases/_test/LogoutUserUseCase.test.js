const LogoutUserUseCase = require("../LogoutUserUseCase");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");

describe("LogoutUserUseCase", () => {
  it("should orchestrate the logout action correctly", async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: "refresh_token",
    };

    const mockAuthenticationRepository = new AuthenticationRepository();
    mockAuthenticationRepository.deleteAuthentication = jest
      .fn()
      .mockResolvedValue();

    const logoutUserUseCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthenticationRepository,
    });

    // Action
    await logoutUserUseCase.execute(useCasePayload);

    // Assert
    expect(
      mockAuthenticationRepository.deleteAuthentication,
    ).toHaveBeenCalledWith(useCasePayload.refreshToken);
  });
});
