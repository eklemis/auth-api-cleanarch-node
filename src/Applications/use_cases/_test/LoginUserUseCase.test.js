const LoginUserUseCase = require("../LoginUserUseCase");
const UserRepository = require("../../../Domains/users/UserRepository");
const AuthenticationRepository = require("../../../Domains/authentications/AuthenticationRepository");
const PasswordHash = require("../../security/PasswordHash");
const TokenManager = require("../../security/TokenManager");

describe("LoginUserUseCase", () => {
  it("should orchestrate the login action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
    };

    const expectedAccessToken = "access_token";
    const expectedRefreshToken = "refresh_token";

    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockPasswordHash = new PasswordHash();
    const mockTokenManager = TokenManager;

    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockResolvedValue({ id: "user-123", password: "hashed_password" });
    mockPasswordHash.comparePassword = jest.fn().mockResolvedValue();
    mockTokenManager.generateAccessToken = jest
      .fn()
      .mockReturnValue(expectedAccessToken);
    mockTokenManager.generateRefreshToken = jest
      .fn()
      .mockReturnValue(expectedRefreshToken);
    mockAuthenticationRepository.addAuthentication = jest
      .fn()
      .mockResolvedValue();

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      passwordHash: mockPasswordHash,
      tokenManager: mockTokenManager,
    });

    // Action
    const { accessToken, refreshToken } =
      await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith(
      useCasePayload.username,
    );
    expect(mockPasswordHash.comparePassword).toBeCalledWith(
      useCasePayload.password,
      "hashed_password",
    );
    expect(mockTokenManager.generateAccessToken).toBeCalledWith({
      username: "dicoding",
      id: "user-123",
    });
    expect(mockTokenManager.generateRefreshToken).toBeCalledWith({
      username: "dicoding",
      id: "user-123",
    });
    expect(mockAuthenticationRepository.addAuthentication).toBeCalledWith(
      expectedRefreshToken,
    );
    expect(accessToken).toEqual(expectedAccessToken);
    expect(refreshToken).toEqual(expectedRefreshToken);
  });
});
