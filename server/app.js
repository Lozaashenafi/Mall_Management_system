import dotenv from "dotenv";
dotenv.config();
import express from "express";
import config from "./src/config/index.js";
import middleware from "./src/middleware/index.js";
import routes from "./src/route/index.js";

const app = express();

// Middleware
app.use(middleware);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api", routes);

app.get("/", (req, res) => {
  return res.send("Running...");
});

// Start the server on the specified port
const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} Server is running`);
});
