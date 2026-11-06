// Переменная, где будут храниться все наши данные
let database = {};
let currentGrade = null;
let currentThemeKey = null;

// Переменные для тестов
let currentQuizIndex = 0;
let currentQuizType = "";
let currentCorrectAnswer = 0;

// Счетчики
let formulaStreak = 0;
let tableStreak = 0;

// Очереди
let selectedThemesQueue = [];
let currentThemeQueueIndex = 0;
let selectedSkillsQueue = [];
let currentSkillQueueIndex = 0;

// 1. Загрузка данных
async function loadData() {
    try {
        const [responseData, responseExtra] = await Promise.all([
            fetch('data.json'),
            fetch('extra_data.json')
        ]);
        
        database = await responseData.json();
        let extraData = await responseExtra.json();
        
        for (let grade in database) {
            for (let themeKey in database[grade]) {
                if (extraData[themeKey]) {
                    database[grade][themeKey].tableData = extraData[themeKey].tableData || null;
                    database[grade][themeKey].tasks = extraData[themeKey].tasks || [];
                }
            }
        }
        console.log("База данных загружена");
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        alert("Не удалось загрузить базу данных. Убедитесь, что Live Server включен.");
    }
}

// 2. Скрытие экранов
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    let backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.style.display = 'none';
}

// 3. Выбор класса
function selectClass(grade) {
    currentGrade = grade;
    hideAllScreens();
    document.getElementById('screen-theme').style.display = 'block';
    
    let backBtn = document.getElementById('back-btn');
    backBtn.style.display = 'block';
    backBtn.onclick = () => goBack('screen-class');

    const themesList = document.getElementById('themes-list');
    
    // 8 класс - 4 колонки, остальные - 3
    let gridStyle = (grade === 8) ? "grid-template-columns: repeat(4, 1fr);" : "";
    
    let html = `<h3 style="text-align: center; margin-bottom: 20px;">Выберите темы для тренировки:</h3>
    <div class="themes-grid" style="${gridStyle}">`;

    if (database[grade]) {
        for (let themeKey in database[grade]) {
            let themeData = database[grade][themeKey];
            html += `
            <label class="theme-card">
                <input type="checkbox" class="theme-checkbox" value="${themeKey}">
                <span class="theme-title">${themeData.title}</span>
            </label>`;
        }
    } else {
        html += `<p style="grid-column: 1 / -1; text-align: center;">Темы для этого класса пока в разработке.</p>`;
    }
    
    html += `</div>
    <div style="text-align: center; margin-top: 30px;">
        <button onclick="startComplexPractice()" style="font-size: 18px; padding: 12px 30px;">🚀 Перейти к выбору навыков</button>
    </div>`;
    
    themesList.innerHTML = html;
}

// 4. Сбор выбранных тем
function startComplexPractice() {
    let checkboxes = document.querySelectorAll('.theme-checkbox:checked');
    selectedThemesQueue = [];
    
    checkboxes.forEach(cb => selectedThemesQueue.push(cb.value));

    if (selectedThemesQueue.length === 0) {
        alert("Выберите хотя бы одну тему!");
        return;
    }

    currentThemeQueueIndex = 0;
    currentThemeKey = selectedThemesQueue[currentThemeQueueIndex];
    showSkillSelection();
}

// 5. Экран выбора навыков
function showSkillSelection() {
    hideAllScreens();
    document.getElementById('screen-workspace').style.display = 'block';
    
    let backBtn = document.getElementById('back-btn');
    backBtn.style.display = 'block';
    backBtn.onclick = () => goBack('screen-theme');

    let themeData = database[currentGrade][currentThemeKey];
    document.getElementById('workspace-title').innerText = `Тема: ${themeData.title}`;
    
    document.getElementById('theory-def').innerText = themeData.theoryDefinition || "";
    document.getElementById('theory-formula').innerText = themeData.theoryFormula || "";
    document.getElementById('theory-units').innerHTML = themeData.theoryUnits || "";
    
    document.getElementById('theory-block').style.display = 'block';
    let practiceContainer = document.getElementById('practice-container');
    
    practiceContainer.innerHTML = `
        <h3>Что будем отрабатывать?</h3>
        <div style="text-align: left; display: inline-block; margin-bottom: 15px; font-size: 18px;">
            <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                <input type="checkbox" id="chk_formula" value="formula" style="transform: scale(1.5); margin-right: 10px;"> 📘 Формулы
            </label>
            <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                <input type="checkbox" id="chk_table" value="table" style="transform: scale(1.5); margin-right: 10px;"> 📊 Обозначения
            </label>
            <label style="display: block; margin-bottom: 10px; cursor: pointer;">
                <input type="checkbox" id="chk_task" value="task" style="transform: scale(1.5); margin-right: 10px;"> 🧮 Задачи
            </label>
        </div>
        <br>
        <button onclick="startSkillsPractice()" style="font-size: 18px; padding: 12px 30px;">🚀 Начать тренировку</button>
    `;
    practiceContainer.style.display = 'block';
    document.getElementById('practice-block').style.display = 'none';
}

// 6. Запуск навыков
function startSkillsPractice() {
    let selectedSkills = [];
    if (document.getElementById('chk_formula').checked) selectedSkills.push('formula');
    if (document.getElementById('chk_table').checked) selectedSkills.push('table');
    if (document.getElementById('chk_task').checked) selectedSkills.push('task');

    if (selectedSkills.length === 0) {
        alert("Выберите хотя бы один навык!");
        return;
    }

    selectedSkillsQueue = selectedSkills;
    currentSkillQueueIndex = 0;
    formulaStreak = 0;
    tableStreak = 0;

    document.getElementById('theory-block').style.display = 'none';
    document.getElementById('practice-container').style.display = 'none';
    document.getElementById('practice-block').style.display = 'block';
    
    loadNextSkill();
}

// 7. Загрузка следующего навыка
function loadNextSkill() {
    if (currentSkillQueueIndex >= selectedSkillsQueue.length) {
        nextTheme();
        return;
    }

    let skill = selectedSkillsQueue[currentSkillQueueIndex];
    
    if (skill === 'formula') {
        formulaStreak = 0; 
        renderFormulaBuilder();
    } else if (skill === 'table') {
        tableStreak = 0; 
        renderTableQuiz();
    } else if (skill === 'task') {
        renderTextQuiz('tasks');
    }
}

// 8. Переход к следующей теме
function nextTheme() {
    currentThemeQueueIndex++;
    
    if (currentThemeQueueIndex >= selectedThemesQueue.length) {
        document.getElementById('task-container').innerHTML = `
            <h3 style="color: green; text-align: center;">Поздравляем! Вы выполнили комплексную тренировку по всем выбранным темам! 🏆</h3>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="stopPractice()" style="font-size: 18px; padding: 12px 30px;">Вернуться на главную</button>
            </div>
        `;
        return;
    }

    currentThemeKey = selectedThemesQueue[currentThemeQueueIndex];
    showSkillSelection();
}

function nextSkill() {
    currentSkillQueueIndex++;
    loadNextSkill();
}

function stopPractice() {
    document.getElementById('practice-block').style.display = 'none';
    document.getElementById('theory-block').style.display = 'block';
    document.getElementById('practice-container').style.display = 'block';
    currentQuizIndex = 0;
    currentFormula = "";
    selectedThemesQueue = [];
    currentThemeQueueIndex = 0;
    selectedSkillsQueue = [];
    currentSkillQueueIndex = 0;
    goBack('screen-class');
}

function goBack(screenId) {
    hideAllScreens();
    document.getElementById('screen-' + screenId.split('-')[1]).style.display = 'block';
    let backBtn = document.getElementById('back-btn');
    if (screenId === 'screen-theme') {
        backBtn.style.display = 'block';
        backBtn.onclick = () => goBack('screen-class');
    } else if (screenId === 'screen-class') {
        backBtn.style.display = 'none';
    }
}

// ==========================================
// КОНСТРУКТОР ФОРМУЛ
// ==========================================
let currentFormula = "";

function renderFormulaBuilder() {
    let taskData = database[currentGrade][currentThemeKey].formulaBuilder;
    let container = document.getElementById('task-container');
    
    let attemptText = formulaStreak === 0 ? "Соберите формулу (1-я попытка)" : 
                      formulaStreak === 1 ? "Соберите формулу еще раз (2-я попытка)" : 
                      "И последний раз! (3-я попытка)";

    container.innerHTML = `
        <h3>${attemptText}</h3>
        <div id="formula-answer" style="min-height: 50px; border: 2px solid #4CAF50; padding: 10px; margin: 0 auto 15px auto; font-size: 28px; background: #ffffff; width: 250px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold;"></div>
        
        <div style="margin-bottom: 15px;">
            <button onclick="addToFormula('=')" style="font-size: 24px; width: 220px; height: 50px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin: 0 auto;">=</button>
        </div>

        <div style="display: flex; justify-content: center; gap: 20px;">
            <div id="letters-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
            <div id="math-signs-column" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>

        <br>
        <button onclick="clearFormula()" style="background-color: #f44336;">Очистить</button>
        <button onclick="deleteLastSymbol()" style="background-color: #ff9800;">⌫ Стереть</button>
        <button onclick="checkFormula()">Проверить</button>
        
        <p id="formula-result" style="font-weight: bold; margin-top: 15px; font-size: 18px;"></p>
    `;

    let lettersGrid = document.getElementById('letters-grid');
    let mathColumn = document.getElementById('math-signs-column');

    let allLetters = [...taskData.correctBlocks, ...taskData.extraLetters];
    let selectedLetters = allLetters.slice(0, 12); 
    selectedLetters.sort(() => Math.random() - 0.5);

    selectedLetters.forEach(letter => {
        let btn = document.createElement('button');
        btn.innerText = letter;
        btn.style.cssText = "font-size: 20px; padding: 15px; background-color: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;";
        btn.onclick = () => addToFormula(letter);
        lettersGrid.appendChild(btn);
    });

    let signs = taskData.mathSigns.filter(sign => sign !== "="); 
    signs.sort(() => Math.random() - 0.5);
    signs.forEach(sign => {
        let btn = document.createElement('button');
        btn.innerText = sign;
        btn.style.cssText = "font-size: 20px; padding: 15px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;";
        btn.onclick = () => addToFormula(sign);
        mathColumn.appendChild(btn);
    });
    
    currentFormula = ""; 
}

function addToFormula(text) {
    currentFormula += text;
    document.getElementById('formula-answer').innerText = currentFormula;
}

function deleteLastSymbol() {
    if (currentFormula.length > 0) {
        currentFormula = currentFormula.slice(0, -1);
        document.getElementById('formula-answer').innerText = currentFormula;
    }
}

function clearFormula() {
    currentFormula = "";
    let answerBox = document.getElementById('formula-answer');
    if(answerBox) {
        answerBox.innerText = "";
        answerBox.style.backgroundColor = "#ffffff"; 
        answerBox.style.borderColor = "#4CAF50";
    }
    document.getElementById('formula-result').innerText = "";
}

function checkFormula() {
    let correct = database[currentGrade][currentThemeKey].formulaBuilder.correctAnswer;
    let resultEl = document.getElementById('formula-result');
    let answerBox = document.getElementById('formula-answer');
    
    if (currentFormula.replace(/\s/g, '') === correct.replace(/\s/g, '')) {
        answerBox.style.backgroundColor = "#c8e6c9"; 
        answerBox.style.borderColor = "#4CAF50";
        
        formulaStreak++; 
        
        if (formulaStreak >= 3) {
            resultEl.innerText = "Формула собрана 3 раза! Переходим к следующему заданию... 🏆";
            resultEl.style.color = "green";
            setTimeout(() => { nextSkill(); }, 1500);
        } else {
            resultEl.innerText = `Верно! Осталось повторить еще ${3 - formulaStreak} раз(а). Кубики перемешаны!`;
            resultEl.style.color = "green";
            setTimeout(() => { renderFormulaBuilder(); }, 1500);
        }
    } else {
        resultEl.innerText = "Ошибка. Попробуй еще раз. ❌";
        resultEl.style.color = "red";
        answerBox.style.backgroundColor = "#ffcdd2"; 
        answerBox.style.borderColor = "#f44336";
    }
}

// ==========================================
// ТАБЛИЦА
// ==========================================

function renderTableQuiz() {
    let tableData = database[currentGrade][currentThemeKey].tableData;
    let container = document.getElementById('task-container');
    
    if (!tableData) {
        container.innerHTML = "<p>Таблица для этой темы пока не создана.</p>";
        setTimeout(() => { nextSkill(); }, 1500);
        return;
    }

    let attemptText = tableStreak === 0 ? "Заполните таблицу (1-я попытка)" : 
                      tableStreak === 1 ? "Заполните таблицу еще раз (2-я попытка)" : 
                      "И последний раз! (3-я попытка)";

    let html = `<h3>${attemptText}</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; background: white;">
        <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 10px;">${tableData.headers[0]}</th>
            <th style="border: 1px solid #ddd; padding: 10px;">${tableData.headers[1]}</th>
            <th style="border: 1px solid #ddd; padding: 10px;">${tableData.headers[2]}</th>
        </tr>`;

    tableData.rows.forEach((row, rowIndex) => {
        let variant = Math.floor(Math.random() * 3);
        let nameCell, symbolCell, unitCell;

        if (variant === 0) {
            nameCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="name_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
            symbolCell = `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">${row.symbol}</td>`;
            unitCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="unit_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
        } else if (variant === 1) {
            nameCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="name_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
            symbolCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="symbol_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
            unitCell = `<td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">${row.unit}</td>`;
        } else {
            nameCell = `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${row.name}</td>`;
            symbolCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="symbol_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
            unitCell = `<td style="border: 1px solid #ddd; padding: 10px;"><input type="text" id="unit_${rowIndex}" style="width: 90%; padding: 5px;" placeholder="?"></td>`;
        }

        html += `<tr>${nameCell}${symbolCell}${unitCell}</tr>`;
    });

    html += `</table><br><button onclick="checkTable()">Проверить таблицу</button>
    <p id="table-result" style="font-weight: bold; margin-top: 15px; font-size: 18px;"></p>`;

    container.innerHTML = html;
}

function checkTable() {
    let tableData = database[currentGrade][currentThemeKey].tableData;
    let isAllCorrect = true;
    
    tableData.rows.forEach((row, rowIndex) => {
        let nameInput = document.getElementById(`name_${rowIndex}`);
        if (nameInput) {
            if (nameInput.value.trim().toLowerCase() === row.name.toLowerCase()) {
                nameInput.style.backgroundColor = "#c8e6c9"; nameInput.style.border = "2px solid #4CAF50";
            } else {
                nameInput.style.backgroundColor = "#ffcdd2"; nameInput.style.border = "2px solid #f44336";
                nameInput.value = row.name; isAllCorrect = false;
            }
        }

        let symbolInput = document.getElementById(`symbol_${rowIndex}`);
        if (symbolInput) {
            if (symbolInput.value.trim().toLowerCase() === row.symbol.toLowerCase()) {
                symbolInput.style.backgroundColor = "#c8e6c9"; symbolInput.style.border = "2px solid #4CAF50";
            } else {
                symbolInput.style.backgroundColor = "#ffcdd2"; symbolInput.style.border = "2px solid #f44336";
                symbolInput.value = row.symbol; isAllCorrect = false;
            }
        }
        
        let unitInput = document.getElementById(`unit_${rowIndex}`);
        if (unitInput) {
            let userUnit = unitInput.value.trim().toLowerCase().replace(/[³3\^]/g, '3');
            let correctUnit = row.unit.toLowerCase().replace(/[³3\^]/g, '3');
            if (userUnit === correctUnit) {
                unitInput.style.backgroundColor = "#c8e6c9"; unitInput.style.border = "2px solid #4CAF50";
            } else {
                unitInput.style.backgroundColor = "#ffcdd2"; unitInput.style.border = "2px solid #f44336";
                unitInput.value = row.unit; isAllCorrect = false;
            }
        }
    });
    
    let resultEl = document.getElementById('table-result');
    if (isAllCorrect) {
        tableStreak++; 
        if (tableStreak >= 3) {
            resultEl.innerText = "Таблица заполнена 3 раза! Переходим... 🏆";
            resultEl.style.color = "green";
            setTimeout(() => { nextSkill(); }, 1500);
        } else {
            resultEl.innerText = `Верно! Осталось заполнить еще ${3 - tableStreak} раз(а).`;
            resultEl.style.color = "green";
            setTimeout(() => { renderTableQuiz(); }, 1500);
        }
    } else {
        resultEl.innerText = "Есть ошибки. Красные ячейки показывают правильный ответ. ❌";
        resultEl.style.color = "red";
    }
}

// ==========================================
// ЗАДАЧИ
// ==========================================
function renderTextQuiz(type) {
    currentQuizIndex = 0;
    currentQuizType = type;
    showQuizQuestion();
}

function showQuizQuestion() {
    let tasks = database[currentGrade][currentThemeKey][currentQuizType];
    
    if (!tasks || currentQuizIndex >= tasks.length) {
        document.getElementById('task-container').innerHTML = `<h3 style="color: green;">Задачи решены! Переходим... 🏆</h3>`;
        setTimeout(() => { nextSkill(); }, 1500);
        return;
    }

    let taskTemplate = tasks[currentQuizIndex];
    let generatedVars = {};
    let questionText = taskTemplate.question;
    
    for (let varName in taskTemplate.vars) {
        let min = taskTemplate.vars[varName][0];
        let max = taskTemplate.vars[varName][1];
        let step = taskTemplate.vars[varName][2];
        let randomNum = Math.floor(Math.random() * ((max - min) / step + 1)) * step + min;
        randomNum = Math.round(randomNum * 100) / 100;
        generatedVars[varName] = randomNum;
        questionText = questionText.replace(new RegExp(`{${varName}}`, 'g'), randomNum);
    }

    let formula = taskTemplate.formula;
    for (let varName in generatedVars) {
        formula = formula.replace(new RegExp(`\\b${varName}\\b`, 'g'), generatedVars[varName]);
    }
    
    currentCorrectAnswer = Math.round(eval(formula) * 100) / 100;

    document.getElementById('task-container').innerHTML = `
        <h3>Задание ${currentQuizIndex + 1} из ${tasks.length}</h3>
        <p style="font-size: 18px; line-height: 1.5;">${questionText}</p>
        <input type="text" id="quiz-input" style="font-size: 18px; padding: 8px; width: 200px;" placeholder="Ответ...">
        <br><br>
        <button onclick="checkTextAnswer()">Проверить</button>
        <p id="quiz-result" style="font-weight: bold; margin-top: 15px;"></p>
    `;
    document.getElementById('quiz-input').focus();
}

function checkTextAnswer() {
    let userAnswer = document.getElementById('quiz-input').value.trim().toLowerCase();
    let resultEl = document.getElementById('quiz-result');
    let normalizedUser = userAnswer.replace(',', '.').replace(/\s/g, '');
    
    if (parseFloat(normalizedUser) === currentCorrectAnswer) {
        resultEl.innerText = "Верно! 🎉";
        resultEl.style.color = "green";
        setTimeout(() => { currentQuizIndex++; showQuizQuestion(); }, 1000);
    } else {
        resultEl.innerText = "Неправильно. Попробуй еще раз. ❌";
        resultEl.style.color = "red";
    }
}

// Создание кнопки Назад и запуск
let backBtn = document.createElement('button');
backBtn.id = 'back-btn';
backBtn.innerText = '← Назад';
document.body.appendChild(backBtn);

loadData();