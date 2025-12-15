function errorHandler(err, req, res, next) {
  console.error("❌ Ошибка:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Файл слишком большой. Максимальный размер: 10MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Ошибка загрузки: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("Excel")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Внутренняя ошибка сервера",
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: "Маршрут не найден",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
