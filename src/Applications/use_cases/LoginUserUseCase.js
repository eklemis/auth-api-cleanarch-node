class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    passwordHash,
    tokenManager,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._passwordHash = passwordHash;
    console.log("password hash:", this._passwordHash);
    this._tokenManager = tokenManager;
  }

  async execute({ username, password }) {
    await this._userRepository.verifyAvailableUsername(username);
    const user = await this._userRepository.getUserByUsername(username);
    console.log("user:", user);
    await this._passwordHash.compare(password, user.password);

    const accessToken = this._tokenManager.generateAccessToken({
      username,
      id: user.id,
    });
    const refreshToken = this._tokenManager.generateRefreshToken({
      username,
      id: user.id,
    });

    await this._authenticationRepository.addAuthentication(refreshToken);

    return { accessToken, refreshToken };
  }
}

module.exports = LoginUserUseCase;
