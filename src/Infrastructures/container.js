/* istanbul ignore file */

const { createContainer } = require("instances-container");

// external agency
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const pool = require("./database/postgres/pool");

// service (repository, helper, manager, etc)
const UserRepositoryPostgres = require("./repositories/UserRepositoryPostgres");
const BcryptPasswordHash = require("./security/BcryptPasswordHash");

// use case
const AddUserUseCase = require("../Applications/use_cases/AddUserUseCase");
const LoginUserUseCase = require("../Applications/use_cases/LoginUserUseCase");
const LogoutUserUseCase = require("../Applications/use_cases/LogoutUserUseCase");
const RefreshAuthenticationUseCase = require("../Applications/use_cases/RefreshAuthenticationUseCase");

// Repositories
const UserRepository = require("../Domains/users/UserRepository");
const AuthenticationRepository = require("../Domains/authentications/AuthenticationRepository");
const AuthenticationRepositoryPostgres = require("./repositories/AuthenticationRepositoryPostgres");

//Internal dependencies
const PasswordHash = require("../Applications/security/PasswordHash");
const TokenManager = require("../Applications/security/TokenManager");

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: "AuthenticationRepository",
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: "TokenManager",
    Class: class {
      constructor() {
        return TokenManager;
      }
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "passwordHash",
          internal: PasswordHash.name,
        },
        {
          name: "tokenManager",
          internal: "TokenManager", // Key yang sesuai untuk object literal
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "tokenManager",
          internal: "TokenManager", // Key untuk TokenManager
        },
      ],
    },
  },
]);

module.exports = container;
