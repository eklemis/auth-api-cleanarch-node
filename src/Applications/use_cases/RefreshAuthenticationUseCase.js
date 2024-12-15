class RefreshAuthenticationUseCase {
  constructor({ authenticationRepository, tokenManager }) {
    this._authenticationRepository = authenticationRepository;
    this._tokenManager = tokenManager;
  }

  async execute({ refreshToken }) {
    // Verifikasi refresh token
    await this._authenticationRepository.checkAvailabilityToken(refreshToken);
    const { username, id } =
      this._tokenManager.verifyRefreshToken(refreshToken);

    // Buat access token baru
    const accessToken = this._tokenManager.generateAccessToken({
      username,
      id,
    });

    return accessToken;
  }
}

module.exports = RefreshAuthenticationUseCase;
