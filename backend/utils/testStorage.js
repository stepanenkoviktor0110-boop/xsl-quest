const path = require("path");
const fs = require("fs").promises;
const {
  MAX_TESTS_IN_MEMORY,
  TEST_EXPIRATION_TIME,
} = require("../config/constants");

const uploadedTests = new Map();

function generateTestId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function enforceMemoryLimit() {
  if (uploadedTests.size <= MAX_TESTS_IN_MEMORY) return;

  let oldestId = null;
  let oldestTime = Infinity;

  for (const [id, data] of uploadedTests.entries()) {
    const t = new Date(data.createdAt).getTime();
    if (t < oldestTime) {
      oldestTime = t;
      oldestId = id;
    }
  }

  if (oldestId) {
    uploadedTests.delete(oldestId);
    console.log(`🧽 Лимит памяти: удалён самый старый тест ${oldestId}`);
  }
}

function cleanupOldTests() {
  const now = Date.now();
  let deletedCount = 0;

  for (let [testId, testData] of uploadedTests.entries()) {
    const testDate = new Date(testData.createdAt).getTime();
    if (now - testDate > TEST_EXPIRATION_TIME) {
      uploadedTests.delete(testId);
      deletedCount++;
      console.log(`🗑️ Удален старый тест: ${testId}`);
    }
  }

  if (deletedCount > 0) {
    console.log(`🧹 Очищено тестов: ${deletedCount}`);
  }
}

function addTest(testData) {
  uploadedTests.set(testData.id, testData);
  enforceMemoryLimit();
}

function getTest(testId) {
  return uploadedTests.get(testId);
}

function toPublicTest(testData) {
  return {
    success: true,
    testId: testData.id,
    originalname: testData.originalname,
    total: testData.total,
    questions: testData.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o) => ({
        text: o.text,
      })),
    })),
  };
}

async function saveTestResult(testId, score, total, originalname) {
  const logLine =
    JSON.stringify({
      at: new Date().toISOString(),
      testId,
      originalname,
      score,
      total,
    }) + "\n";

  const resultsPath = path.join(__dirname, "../results.jsonl");
  await fs.appendFile(resultsPath, logLine, "utf8");
}

module.exports = {
  generateTestId,
  enforceMemoryLimit,
  cleanupOldTests,
  addTest,
  getTest,
  toPublicTest,
  saveTestResult,
};
