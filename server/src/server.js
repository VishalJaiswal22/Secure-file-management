require("dotenv").config();

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception during server startup.");
  console.error(error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection during server startup.");
  console.error(error && error.message ? error.message : error);
  if (error && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});

const fs = require("fs");
const path = require("path");
const app = require("./app");
const connectDb = require("./config/db");

const port = process.env.PORT || 5001;
const uploadsDir = path.join(__dirname, "..", "uploads");
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "ENCRYPTION_SECRET"];

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error) => {
  console.error("Server startup failed.");
  console.error(error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
