// frontend/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Проверка подключения к серверу
    checkServerStatus();
    
    // Инициализация переменных
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let selectedFile = null;
    
    // Элементы DOM
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const uploadBtn = document.getElementById('uploadBtn');
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const testSection = document.getElementById('testSection');
    const questionText = document.getElementById('questionText');
    const answersContainer = document.getElementById('answersContainer');
    const currentQuestionElement = document.getElementById('currentQuestion');
    const totalQuestionsElement = document.getElementById('totalQuestions');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const resultsSection = document.getElementById('resultsSection');
    const scorePercent = document.getElementById('scorePercent');
    const correctAnswersElement = document.getElementById('correctAnswers');
    const totalAnswersElement = document.getElementById('totalAnswers');
    const progressCircle = document.getElementById('progressCircle');
    const restartBtn = document.getElementById('restartBtn');
    const serverStatus = document.getElementById('serverStatus');
    
    // Обработчики событий для загрузки файла
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--pantone-secondary)';
        uploadArea.style.backgroundColor = 'rgba(212, 180, 131, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--pantone-primary)';
        uploadArea.style.backgroundColor = 'rgba(138, 155, 179, 0.05)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--pantone-primary)';
        uploadArea.style.backgroundColor = 'rgba(138, 155, 179, 0.05)';
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    uploadBtn.addEventListener('click', uploadFile);
    
    // Обработчики для навигации по вопросам
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    submitBtn.addEventListener('click', submitTest);
    restartBtn.addEventListener('click', restartTest);
    
    // Функция выбора файла
    function handleFileSelect(file) {
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Пожалуйста, выберите Excel-файл (.xlsx или .xls)');
            return;
        }
        
        selectedFile = file;
        fileName.textContent = file.name;
        fileInfo.style.display = 'block';
    }
    
    // Функция загрузки файла на сервер
    async function uploadFile() {
        if (!selectedFile) {
            alert('Сначала выберите файл');
            return;
        }
        
        const formData = new FormData();
        formData.append('excelFile', selectedFile);
        
        // Показываем прогресс-бар
        progress.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        
        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Ошибка загрузки файла');
            }
            
            // Имитация прогресса загрузки
            for (let i = 0; i <= 100; i += 10) {
                setTimeout(() => {
                    progressBar.style.width = i + '%';
                    progressText.textContent = i + '%';
                }, i * 20);
            }
            
            setTimeout(async () => {
                const data = await response.json();
                
                if (data.success && data.questions && data.questions.length > 0) {
                    questions = data.questions;
                    userAnswers = new Array(questions.length).fill([]);
                    
                    // Показываем секцию с тестом
                    testSection.style.display = 'block';
                    uploadArea.style.display = 'none';
                    fileInfo.style.display = 'none';
                    progress.style.display = 'none';
                    
                    // Инициализируем тест
                    initializeTest();
                } else {
                    alert('Не удалось загрузить вопросы. Проверьте формат файла.');
                }
            }, 2200);
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при загрузке файла. Убедитесь, что сервер запущен.');
            progress.style.display = 'none';
        }
    }
    
    // Функция инициализации теста
    function initializeTest() {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill([]);
        
        updateQuestionCounter();
        showQuestion();
        updateNavigationButtons();
    }
    
    // Функция отображения вопроса
    function showQuestion() {
        if (questions.length === 0) return;
        
        const question = questions[currentQuestionIndex];
        questionText.textContent = question.text;
        
        // Очищаем контейнер с ответами
        answersContainer.innerHTML = '';
        
        // Создаем варианты ответов
        question.options.forEach((option, index) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            
            const checkboxId = `answer${index}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = 'answer';
            checkbox.value = index;
            
            // Проверяем, был ли уже выбран этот вариант
            if (userAnswers[currentQuestionIndex].includes(index)) {
                checkbox.checked = true;
            }
            
            checkbox.addEventListener('change', () => {
                handleAnswerSelection(index, checkbox.checked);
            });
            
            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.textContent = option.text;
            
            // Если вариант правильный, помечаем его (в реальном приложении это будет скрыто)
            if (option.isCorrect) {
                label.style.fontWeight = 'bold';
                label.style.color = 'var(--pantone-success)';
            }
            
            answerOption.appendChild(checkbox);
            answerOption.appendChild(label);
            answersContainer.appendChild(answerOption);
        });
        
        updateNavigationButtons();
    }
    
    // Функция обработки выбора ответа
    function handleAnswerSelection(answerIndex, isChecked) {
        if (isChecked) {
            // Добавляем ответ, если его еще нет
            if (!userAnswers[currentQuestionIndex].includes(answerIndex)) {
                userAnswers[currentQuestionIndex] = [...userAnswers[currentQuestionIndex], answerIndex];
            }
        } else {
            // Удаляем ответ
            userAnswers[currentQuestionIndex] = userAnswers[currentQuestionIndex].filter(
                index => index !== answerIndex
            );
        }
    }
    
    // Функция обновления счетчика вопросов
    function updateQuestionCounter() {
        currentQuestionElement.textContent = currentQuestionIndex + 1;
        totalQuestionsElement.textContent = questions.length;
    }
    
    // Функция обновления кнопок навигации
    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }
    
    // Функция перехода к предыдущему вопросу
    function showPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestionCounter();
            showQuestion();
        }
    }
    
    // Функция перехода к следующему вопросу
    function showNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            updateQuestionCounter();
            showQuestion();
        }
    }
    
    // Функция завершения теста
    async function submitTest() {
        // В реальном приложении здесь будет отправка на сервер для проверки
        // Для примера сгенерируем случайные результаты
        
        // Скрываем секцию теста и показываем результаты
        testSection.style.display = 'none';
        resultsSection.style.display = 'block';
        
        // Расчет результатов (заглушка)
        let correctCount = 0;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const correctOptions = question.options
                .map((opt, idx) => opt.isCorrect ? idx : -1)
                .filter(idx => idx !== -1)
                .sort();
            
            const userSelected = [...userAnswers[i]].sort();
            
            if (JSON.stringify(correctOptions) === JSON.stringify(userSelected)) {
                correctCount++;
            }
        }
        
        const scorePercentage = Math.round((correctCount / questions.length) * 100);
        
        // Обновляем UI с результатами
        scorePercent.textContent = `${scorePercentage}%`;
        correctAnswersElement.textContent = correctCount;
        totalAnswersElement.textContent = questions.length;
        
        // Анимация кругового прогресса
        const circleCircumference = 339.292; // 2 * π * 54
        const offset = circleCircumference - (scorePercentage / 100) * circleCircumference;
        
        setTimeout(() => {
            progressCircle.style.strokeDashoffset = offset;
        }, 100);
    }
    
    // Функция перезапуска теста
    function restartTest() {
        // Сбрасываем все данные
        questions = [];
        currentQuestionIndex = 0;
        userAnswers = [];
        selectedFile = null;
        
        // Показываем секцию загрузки, скрываем остальные
        resultsSection.style.display = 'none';
        testSection.style.display = 'none';
        uploadArea.style.display = 'flex';
        fileInfo.style.display = 'none';
        progress.style.display = 'none';
        
        // Сбрасываем инпут файла
        fileInput.value = '';
    }
    
    // Функция проверки статуса сервера
    async function checkServerStatus() {
        try {
            const response = await fetch('http://localhost:5000/api/test');
            if (response.ok) {
                serverStatus.textContent = 'Сервер работает';
                serverStatus.style.color = 'var(--pantone-success)';
            } else {
                serverStatus.textContent = 'Сервер не отвечает';
                serverStatus.style.color = 'var(--pantone-error)';
            }
        } catch (error) {
            serverStatus.textContent = 'Сервер не запущен';
            serverStatus.style.color = 'var(--pantone-error)';
            console.warn('Сервер не запущен. Запустите сервер для полной функциональности.');
        }
    }
});