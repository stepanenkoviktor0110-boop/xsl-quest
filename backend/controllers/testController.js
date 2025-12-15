const fs = require("fs").promises;
const { parseExcelFile } = require("../services/excelParser");
const { getServerIPs } = require("../utils/network");
const { fixFilename, normalize, sameArray } = require("../utils/helpers");
const {
  generateTestId,
  addTest,
  getTest,
  toPublicTest,
  saveTestResult,
  cleanupOldTests,
} = require("../utils/testStorage");

const PORT = process.env.PORT || 5000;
const serverIPs = getServerIPs();

async function uploadTest(req, res) {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Файл не был загружен" });
  }

  const uploadedPath = req.file.path;

  try {
    const questions = await parseExcelFile(uploadedPath);

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "В файле не найдено ни одного вопроса. Проверьте формат файла.",
      });
    }

    const testId = generateTestId();
    const originalnameFixed = fixFilename(req.file.originalname);

    const testData = {
      id: testId,
      originalname: originalnameFixed,
      questions,
      total: questions.length,
      createdAt: new Date().toISOString(),
    };

    addTest(testData);
    cleanupOldTests();

    const testLinks = serverIPs.map(
      (ip) => `http://${ip}:${PORT}/test/${testId}`
    );
    const localLink = `http://localhost:${PORT}/test/${testId}`;
    const networkLinks = testLinks.filter(
      (link) => !link.includes("localhost")
    );

    return res.json({
      success: true,
      message: "Файл успешно обработан",
      testId,
      testLinks,
      localLink,
      networkLinks,
      originalname: originalnameFixed,
      total: questions.length,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Ошибка при обработке файла: " + error.message,
    });
  } finally {
    await fs.unlink(uploadedPath).catch(() => {});
  }
}

function getTestById(req, res) {
  const testId = req.params.testId;
  console.log(`📥 Запрос теста по ID: ${testId}`);

  const testData = getTest(testId);

  if (!testData) {
    console.log(`❌ Тест ${testId} не найден`);
    return res.status(404).json({
      success: false,
      message: "Тест не найден. Возможно, ссылка устарела или неверна.",
    });
  }

  console.log(`✅ Тест ${testId} найден, отправляем данные`);
  return res.json(toPublicTest(testData));
}

async function submitTest(req, res) {
  const testId = req.params.testId;
  console.log("✅ SUBMIT пришёл для testId:", testId);

  const testData = getTest(testId);

  if (!testData) {
    return res.status(404).json({ success: false, message: "Тест не найден" });
  }

  const answers = req.body && req.body.answers;
  if (!Array.isArray(answers)) {
    return res
      .status(400)
      .json({ success: false, message: "Неверный формат answers" });
  }

  let score = 0;

  testData.questions.forEach((q, qi) => {
    const correct = q.options
      .map((o, idx) => (o.isCorrect ? idx : null))
      .filter((v) => v !== null);

    const selected = normalize(answers[qi]);
    const correctSorted = normalize(correct);

    if (sameArray(selected, correctSorted)) score++;
  });

  await saveTestResult(testId, score, testData.total, testData.originalname);

  return res.json({
    success: true,
    score,
    total: testData.total,
  });
}

module.exports = {
  uploadTest,
  getTestById,
  submitTest,
};
