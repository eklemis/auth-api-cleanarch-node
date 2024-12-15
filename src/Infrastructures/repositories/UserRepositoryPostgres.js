const InvariantError = require("../../Commons/excetions/InvariantError");
const NotFoundError = require("../../Commons/excetions/NotFoundError");
const RegisteredUser = require("../../Domains/users/entities/RegisteredUser");
const UserRepository = require("../../Domains/users/UserRepository");

class UserRepositoryPostgres extends UserRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyAvailableUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      throw new InvariantError("username tidak tersedia");
    }
  }

  async addUser(registerUser) {
    const { username, password, fullname } = registerUser;
    const id = `user-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname",
      values: [id, username, password, fullname],
    };

    const result = await this._pool.query(query);

    return new RegisteredUser({ ...result.rows[0] });
  }
  async getPasswordByUsername(username) {
    const query = {
      text: "SELECT password FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return null;
    }

    return result.rows[0].password;
  }
  async getUserByUsername(username) {
    const query = {
      text: "SELECT id, username, fullname FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("User dengan username tidak ditemukan");
    }

    return result.rows[0];
  }
}

module.exports = UserRepositoryPostgres;
