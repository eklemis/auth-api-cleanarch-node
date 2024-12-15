class AuthenticationRepository {
  async addAuthentication(token) {
    throw new Error("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async checkAvailabilityToken(token) {
    throw new Error("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteAuthentication(token) {
    throw new Error("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = AuthenticationRepository;
