class LogoutUserUseCase {
  constructor({ authenticationRepository }) {
    this._authenticationRepository = authenticationRepository;
  }

  async execute({ refreshToken }) {
    await this._authenticationRepository.deleteAuthentication(refreshToken);
  }
}

module.exports = LogoutUserUseCase;
