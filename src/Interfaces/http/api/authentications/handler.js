const RefreshAuthenticationUseCase = require("../../../../Applications/use_cases/RefreshAuthenticationUseCase");
const LoginUserUseCase = require("../../../../Applications/use_cases/LoginUserUseCase");
const LogoutUserUseCase = require("../../../../Applications/use_cases/LogoutUserUseCase");

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;
    //console.log("container:", this._container);

    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }
  async postAuthenticationHandler(request, h) {
    try {
      const loginUserUseCase = this._container.getInstance(
        LoginUserUseCase.name,
      );
      const { accessToken, refreshToken } = await loginUserUseCase.execute(
        request.payload,
      );

      return h
        .response({
          status: "success",
          data: {
            accessToken,
            refreshToken,
          },
        })
        .code(201);
    } catch (error) {
      console.error(error); // Log the error for debugging
      throw error; // Rethrow the error to maintain existing behavior
    }
  }
  async putAuthenticationHandler(request, h) {
    const refreshAuthenticationUseCase = this._container.getInstance(
      RefreshAuthenticationUseCase.name,
    );
    const accessToken = await refreshAuthenticationUseCase.execute(
      request.payload,
    );

    return h
      .response({
        status: "success",
        data: {
          accessToken,
        },
      })
      .code(200);
  }
  async deleteAuthenticationHandler(request, h) {
    const logoutUserUseCase = this._container.getInstance(
      LogoutUserUseCase.name,
    );
    await logoutUserUseCase.execute(request.payload);

    return h
      .response({
        status: "success",
        message: "Refresh token berhasil dihapus",
      })
      .code(200);
  }
}

module.exports = AuthenticationsHandler;
