const fs = require("fs");
const path = require("path");
const { uploadsDir } = require("../config/multer");

function getFiles(req, res) {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка чтения папки" });
    }

    const fileList = files.map((file) => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        uploaded: stats.mtime,
      };
    });

    res.json({ files: fileList });
  });
}

module.exports = {
  getFiles,
};
