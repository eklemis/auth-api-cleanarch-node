const routes = (handler) => [
  {
    method: "POST",
    path: "/login",
    handler: handler.postAuthenticationHandler,
  },
  {
    method: "DELETE",
    path: "/logout",
    handler: handler.deleteAuthenticationHandler,
  },
  {
    method: "PUT",
    path: "/refresh-token",
    handler: handler.putAuthenticationHandler,
  },
];

module.exports = routes;
