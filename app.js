const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 1121;
const VERSION = process.env.VERSION || "v1";

// Prometheus setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path"],
  registers: [register],
});

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  httpRequestCounter.inc({ method: req.method, path: req.path });
  next();
});

app.get("/", (req, res) => {
  res.send(`Hello from ${VERSION}`);
});

app.get("/version", (req, res) => {
  res.json({ version: VERSION });
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] Server started - version: ${VERSION}, port: ${PORT}`,
  );
});
