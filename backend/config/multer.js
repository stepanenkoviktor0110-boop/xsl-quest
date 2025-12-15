const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { MAX_FILE_SIZE } = require("./constants");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${id}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExt = [".xlsx", ".xls"];

    if (allowedTypes.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Только Excel файлы (.xlsx/.xls) разрешены!"), false);
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = { upload, uploadsDir };
