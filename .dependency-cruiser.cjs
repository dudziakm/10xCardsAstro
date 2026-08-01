/* global module */

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      comment: "Source modules must not form an import cycle.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-react-island-to-api-import",
      comment: "React islands call API routes over HTTP; they must not import route handlers directly.",
      severity: "error",
      from: { path: "^src/components/" },
      to: { path: "^src/pages/api/" },
    },
    {
      name: "no-api-route-to-react-island",
      comment: "Server API routes must not import browser React islands.",
      severity: "error",
      from: { path: "^src/pages/api/" },
      to: { path: "^src/components/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
