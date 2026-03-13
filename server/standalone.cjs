const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const tasksRouter = require("./routes/tasks");

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  const isProduction = process.env.NODE_ENV === "production";
  const scriptSrc = isProduction
    ? "script-src 'self'"
    : "script-src 'self' 'unsafe-inline'";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob:",
    isProduction
      ? "connect-src 'self' https: wss:"
      : "connect-src 'self' ws: wss: http: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);

  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
});

app.get("/api", (req, res) => {
  res.json({ message: "Task Manager API" });
});

app.use("/api/tasks", tasksRouter);

const mongoUri = String(
  process.env.MONGO_URI || process.env.MONGO_URL || "",
).trim();
const hasValidMongoScheme = /^mongodb(\+srv)?:\/\//.test(mongoUri);
const hasPlaceholderMongoValue = /<[^>]+>/.test(mongoUri);

const port = Number(process.env.PORT || 4000);

async function start() {
  if (hasPlaceholderMongoValue) {
    console.error(
      "Refusing to start: MONGO_URI contains placeholder values. Update .env with a real MongoDB connection string.",
    );
    process.exit(1);
  }

  if (mongoUri && hasValidMongoScheme) {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } else if (mongoUri) {
    console.warn("MONGO_URI is set but invalid; skipping MongoDB connection");
  } else {
    console.warn("MONGO_URI is not set; skipping MongoDB connection");
  }

  const distPath = path.resolve(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const server = app.listen(port, () => {
    console.log(`Standalone server running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error && error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Run \"npm run stop:dev\" and try again.`,
      );
    } else {
      console.error("Standalone server error:", error.message);
    }
    process.exit(1);
  });
}

start().catch((error) => {
  console.error("Failed to start standalone server:", error.message);
  process.exit(1);
});
