// backend/services/excelParser.js
const ExcelJS = require("exceljs");

// Вспомогательная функция: аккуратно превращаем значение ячейки в текст
function cellToText(value) {
  if (value == null) return "";

  // обычные типы
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  // ExcelJS иногда отдаёт объект (формулы, richText и т.п.)
  if (typeof value === "object") {
    // richText
    if (Array.isArray(value.richText)) {
      return value.richText.map((t) => t.text || "").join("");
    }
    // формула: { formula: "...", result: "..." }
    if (Object.prototype.hasOwnProperty.call(value, "result")) {
      return value.result != null ? String(value.result) : "";
    }
    // гиперссылки / текст
    if (Object.prototype.hasOwnProperty.call(value, "text")) {
      return value.text != null ? String(value.text) : "";
    }
  }

  // на крайний случай
  try {
    return String(value);
  } catch {
    return "";
  }
}

async function parseExcelFile(filePath) {
  try {
    console.log("📊 Начинаем парсинг файла:", filePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    console.log("📄 Лист:", worksheet.name);
    console.log(
      "📏 Размеры:",
      worksheet.rowCount,
      "строк,",
      worksheet.columnCount,
      "столбцов"
    );

    const questions = [];

    // Идём по строкам со 2-й
    // Проходим по всем НЕпустым строкам (считаем сколько угодно вопросов)
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // первая строка — заголовки

      const qRaw = row.getCell(1).value;
      const questionText = cellToText(qRaw).trim();
      if (!questionText) return;

      const options = [];

      // Берём все заполненные ячейки начиная со 2-й колонки (сколько угодно вариантов)
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        if (colNumber < 2) return;

        const optionText = cellToText(cell.value).trim();
        if (!optionText) return;

        const isBold =
          !!(cell.font && cell.font.bold) ||
          (cell.value &&
            typeof cell.value === "object" &&
            Array.isArray(cell.value.richText) &&
            cell.value.richText.some((r) => r.font && r.font.bold));

        options.push({ text: optionText, isCorrect: isBold });
      });

      // Добавляем вопрос, если есть хотя бы 1 вариант (не фильтруем по жирному!)
      if (options.length > 0) {
        questions.push({
          id: questions.length + 1,
          text: questionText,
          options,
        });
      }
    });

    console.log(`🎉 Всего вопросов распарсено: ${questions.length}`);
    return questions;
  } catch (error) {
    console.error("❌ Ошибка при парсинге Excel:", error);
    throw new Error(`Не удалось прочитать Excel-файл: ${error.message}`);
  }
}

module.exports = { parseExcelFile };
