const express = require("express");
const client = require("prom-client");

const app = express();
const port = process.env.PORT || 8080;

// Create a Registry and a Counter metric
const register = new client.Registry();
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests received",
});
register.registerMetric(httpRequestCounter);

// Middleware to count every request
app.use((req, res, next) => {
  httpRequestCounter.inc();
  next();
});

// Basic routes
app.get("/", (req, res) => {
  res.send("Hello from the DevOps Sample App 👋 — running on Node.js!");
});

app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date() });
});

app.get("/error", (req, res) => {
  res.status(500).send("Simulated error route!");
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
