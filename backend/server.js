const express = require("express");
const cors = require("cors");
const path = require("path");
const { printServerInfo } = require("./utils/network");
const { cleanupOldTests } = require("./utils/testStorage");
const { CLEANUP_INTERVAL } = require("./config/constants");
const apiRoutes = require("./routes/api");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

const PORT = process.env.PORT || 5000;

const app = express();

// Trust proxy для корректной работы за Render proxy
app.set('trust proxy', true);

app.use(requestLogger);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.get("/test/:testId", (req, res) => {
  console.log(`📄 Запрос страницы теста: ${req.params.testId}`);
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

setInterval(cleanupOldTests, CLEANUP_INTERVAL);

const server = app.listen(PORT, "0.0.0.0", () => {
  printServerInfo(PORT);
});

module.exports = server;
