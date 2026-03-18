module.exports = {
  apps: [
    {
      name: "version-echo-app",
      script: "app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 1121,
        VERSION: "v1",
      },
    },
  ],
};
