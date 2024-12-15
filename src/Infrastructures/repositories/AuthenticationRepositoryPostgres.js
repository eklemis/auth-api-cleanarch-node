const InvariantError = require("../../Commons/excetions/InvariantError");

class AuthenticationRepositoryPostgres {
  constructor(pool) {
    this._pool = pool;
  }

  async addAuthentication(token) {
    const query = {
      text: "INSERT INTO authentications (token) VALUES ($1)",
      values: [token],
    };

    await this._pool.query(query);
  }

  async checkAvailabilityToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError("Refresh token tidak ditemukan di database");
    }
  }

  async deleteAuthentication(token) {
    const query = {
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationRepositoryPostgres;
