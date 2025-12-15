const express = require("express");
const router = express.Router();
const { upload } = require("../config/multer");
const {
  uploadTest,
  getTestById,
  submitTest,
} = require("../controllers/testController");
const { getFiles } = require("../controllers/filesController");

router.get("/test", (req, res) => {
  res.json({ message: "Сервер работает! Привет от бэкенда!" });
});

router.get("/files", getFiles);
router.post("/upload", upload.single("excelFile"), uploadTest);
router.get("/test/:testId", getTestById);
router.post("/test/:testId/submit", submitTest);

module.exports = router;
