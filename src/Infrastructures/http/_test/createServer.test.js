const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const bcrypt = require("bcrypt");

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /users", () => {
    it("should response 201 and persisted user", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedUser).toBeDefined();
    });
    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        fullname: "Dicoding Indonesia",
        password: "secret",
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
      );
    });
    it("should response 400 when request payload not meet data type specification", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: ["Dicoding Indonesia"],
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena tipe data tidak sesuai",
      );
    });
    it("should response 400 when username more than 50 character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicodingindonesiadicodingindonesiadicodingindonesiadicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena karakter username melebihi batas limit",
      );
    });
    it("should response 400 when username contain restricted character", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding indonesia",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat user baru karena username mengandung karakter terlarang",
      );
    });
    it("should response 400 when username unavailable", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: "dicoding" });
      const requestPayload = {
        username: "dicoding",
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("username tidak tersedia");
    });
    it("should handle server error correctly", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        fullname: "Dicoding Indonesia",
        password: "super_secret",
      };
      const server = await createServer({}); // fake container
      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(500);
      expect(responseJson.status).toEqual("error");
      expect(responseJson.message).toEqual(
        "terjadi kegagalan pada server kami",
      );
    });
  });
  describe("Authentications plugin", () => {
    it("should register authentications routes correctly", async () => {
      // Arrange
      const server = await createServer(container);

      // Act
      const routes = server.table();

      // Assert
      expect(routes.some((route) => route.path === "/refresh-token")).toBe(
        true,
      );
    });
  });
  describe("/login endpoint", () => {
    beforeEach(async () => {
      // Add user with known password
      await UsersTableTestHelper.addUser({
        username: "user",
        password: await bcrypt.hash("secret", 10), // Ensure it matches the input
        fullname: "Dicoding Indonesia",
      });
    });
    it("should respond 201 and return access token and refresh token", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/login",
        payload: {
          username: "user",
          password: "secret",
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it("should respond 401 when username or password is wrong", async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/login",
        payload: {
          username: "wrong_user",
          password: "wrong_password",
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "kredensial yang Anda berikan salah",
      );
    });
  });
  describe("/logout endpoint", () => {
    it("should respond 200 and remove refresh token", async () => {
      // Arrange
      const server = await createServer(container);

      const refreshToken = "refresh_token";
      await pool.query("INSERT INTO authentications (token) VALUES ($1)", [
        refreshToken,
      ]);

      // Action
      const response = await server.inject({
        method: "DELETE",
        url: "/logout",
        payload: { refreshToken },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.message).toEqual("Refresh token berhasil dihapus");
    });
  });
});
