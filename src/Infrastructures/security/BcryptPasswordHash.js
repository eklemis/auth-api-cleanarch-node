const PasswordHash = require("../../Applications/security/PasswordHash");

class BcryptPasswordHash extends PasswordHash {
  constructor(bcrypt, saltRound = 10) {
    super();
    this._bcrypt = bcrypt;
    this._saltRound = saltRound;
  }

  async hash(password) {
    return this._bcrypt.hash(password, this._saltRound);
  }
  async compare(password, hashedPassword) {
    const isMatch = await this._bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new Error("Password does not match");
    }
    return true;
  }
}

module.exports = BcryptPasswordHash;
