const fs = require("fs");
const path = require("path");
const app = require("./app");
const connectDb = require("./config/db");

const port = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
