// Переменная, где будут храниться все наши данные из JSON
let database = {};

// 1. Функция для загрузки данных (вызывается один раз при старте)
async function loadData() {
    try {
        const response = await fetch('data.json');
        database = await response.json();
        console.log("База данных загружена:", database);
    } catch (error) {
        console.error("Ошибка загрузки JSON:", error);
        alert("Не удалось загрузить базу данных. Проверьте data.json");
    }
}

// 2. Скрываем все экраны
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
}

// 3. Выбор класса
function selectClass(grade) {
    hideAllScreens();
    document.getElementById('screen-theme').style.display = 'block';
    
    const themesList = document.getElementById('themes-list');
    themesList.innerHTML = ''; // Очищаем старые кнопки

    // Проверяем, есть ли такой класс в базе
    if (database[grade]) {
        // Проходимся по всем темам этого класса
        for (let themeKey in database[grade]) {
            let themeData = database[grade][themeKey];
            
            // Создаем кнопку для каждой темы
            let btn = document.createElement('button');
            btn.innerText = themeData.title;
            // При клике передаем ключ темы (например, 'density')
            btn.onclick = () => selectTheme(grade, themeKey);
            
            themesList.appendChild(btn);
        }
    } else {
        themesList.innerHTML = '<p>Для этого класса пока нет тем.</p>';
    }
}

// 4. Выбор темы (пока просто выводим заголовок)
function selectTheme(grade, themeKey) {
    hideAllScreens();
    document.getElementById('screen-skill').style.display = 'block';
    
    // Запоминаем, какую тему выбрали (чтобы потом знать, откуда брать задачи)
    // (В будущем мы будем использовать эти переменные для практики)
    let themeData = database[grade][themeKey];
    document.getElementById('current-theme-title').innerText = `Тема: ${themeData.title}`;
}

// 5. Кнопка "Назад"
function goBack(screenId) {
    hideAllScreens();
    document.getElementById(screenId).style.display = 'block';
}

// 6. Запускаем загрузку данных при открытии страницы
loadData();
// Глобальные переменные для хранения текущего выбора
let currentGrade = null;
let currentThemeKey = null;
let currentSkill = null;

// Переопределяем функцию выбора темы (добавляем сохранение)
function selectTheme(grade, themeKey) {
    currentGrade = grade;
    currentThemeKey = themeKey;
    
    hideAllScreens();
    document.getElementById('screen-skill').style.display = 'block';
    
    let themeData = database[grade][themeKey];
    document.getElementById('current-theme-title').innerText = `Тема: ${themeData.title}`;
}

// 5. Выбор навыка (Формулы, Обозначения и т.д.)
function selectSkill(skill) {
    currentSkill = skill;
    hideAllScreens();
    document.getElementById('screen-workspace').style.display = 'block';
    
    // Скрываем блок практики, показываем теорию
    document.getElementById('practice-block').style.display = 'none';
    document.getElementById('theory-block').style.display = 'block';
    
    let themeData = database[currentGrade][currentThemeKey];
    document.getElementById('workspace-title').innerText = themeData.title;
    
    // Показываем разную теорию в зависимости от навыка
    if (skill === 'formula') {
        document.getElementById('theory-text').innerText = "Формула плотности: ρ = m / V. Давайте соберем её!";
    } else if (skill === 'unit') {
        document.getElementById('theory-text').innerText = "Единицы измерения плотности: кг/м³.";
    }
    // (Остальные навыки добавим позже)
}

// 6. Кнопка "Приступить к практике"
function startPractice() {
    document.getElementById('theory-block').style.display = 'none';
    document.getElementById('practice-block').style.display = 'block';
    
    if (currentSkill === 'formula') {
        renderFormulaBuilder();
    } else {
        document.getElementById('task-container').innerHTML = "<p>Для этого навыка практика еще в разработке.</p>";
    }
}

// 7. Рисуем конструктор формул
function renderFormulaBuilder() {
    let taskData = database[currentGrade][currentThemeKey].formulaBuilder;
    let container = document.getElementById('task-container');
    
    // 1. Создаем структуру: пустая строка для ответа, кнопка равно, сетка 4х4 и колонка знаков
    container.innerHTML = `
        <p><b>${taskData.question}</b></p>
        
        <!-- Строка ответа -->
        <div id="formula-answer" style="min-height: 50px; border: 2px solid #00000000; padding: 10px; margin: 0 auto 15px auto; font-size: 28px; background: #e5ede6; width: 250px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold;"></div>
        
        <!-- Знак равно (сверху) -->
        <div style="margin-bottom: 15px;">
            <button onclick="addToFormula('=')" style="font-size: 24px; padding: 10px 120px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer;">=</button>
        </div>

        <!-- Основная игровая зона (Сетка 4х4 + Знаки справа) -->
        <div style="display: flex; justify-content: center; gap: 20px;">
            
            <!-- Сетка букв 3х4 -->
            <div id="letters-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
            
            <!-- Колонка с мат. знаками -->
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

    // 2. Формируем буквы (всего 16 штук для сетки 4х4)
    let allLetters = [...taskData.correctBlocks, ...taskData.extraLetters];
    let selectedLetters = allLetters.slice(0, 15); // Берем ровно 16
    selectedLetters.sort(() => Math.random() - 0.5); // Перемешиваем

    // Рисуем зеленые кнопки-буквы
    selectedLetters.forEach(letter => {
        let btn = document.createElement('button');
        btn.innerText = letter;
        // Зеленый стиль
        btn.style.cssText = "font-size: 20px; padding: 15px; background-color: #4CAF50; color: white; border: none; border-radius: 8px; cursor: pointer; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;";
        btn.onclick = () => addToFormula(letter);
        lettersGrid.appendChild(btn);
    });

    // 3. Формируем математические знаки (кроме равно, его мы уже сделали отдельно)
    // Берем из базы все знаки, кроме "="
    let signs = taskData.mathSigns.filter(sign => sign !== "="); 
    
    // Рисуем синие кнопки-знаки
    signs.forEach(sign => {
        let btn = document.createElement('button');
        btn.innerText = sign;
        // Синий стиль
        btn.style.cssText = "font-size: 20px; padding: 15px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;";
        btn.onclick = () => addToFormula(sign);
        mathColumn.appendChild(btn);
    });
}

let currentFormula = "";

function addToFormula(text) {
    currentFormula += text;
    document.getElementById('formula-answer').innerText = currentFormula;
}

function clearFormula() {
    currentFormula = "";
    let answerBox = document.getElementById('formula-answer');
    
    answerBox.innerText = "";
    // Возвращаем исходный БЕЛЫЙ цвет и зеленую рамку
    answerBox.style.backgroundColor = "#ffffff"; 
    answerBox.style.borderColor = "#000000";
    
    document.getElementById('formula-result').innerText = "";
}

function deleteLastSymbol() {
    // Если строка не пустая, отрезаем последний символ
    if (currentFormula.length > 0) {
        currentFormula = currentFormula.slice(0, -1);
        document.getElementById('formula-answer').innerText = currentFormula;
    }
}

function checkFormula() {
    let correct = database[currentGrade][currentThemeKey].formulaBuilder.correctAnswer;
    let resultEl = document.getElementById('formula-result');
    let answerBox = document.getElementById('formula-answer'); // Наше окошко с формулой
    
    // Убираем пробелы для надежности
    if (currentFormula.replace(/\s/g, '') === correct.replace(/\s/g, '')) {
        // ПРАВИЛЬНО
        resultEl.innerText = "Верно! Отличная работа! 🎉";
        resultEl.style.color = "green";
        
        // Красим окошко в светло-зеленый
        answerBox.style.backgroundColor = "#97d499"; 
        answerBox.style.borderColor = "#4CAF50";
    } else {
        // НЕПРАВИЛЬНО
        resultEl.innerText = "Ошибка. Попробуй еще раз. ❌";
        resultEl.style.color = "red";
        
        // Красим окошко в светло-красный
        answerBox.style.backgroundColor = "#ffcdd2"; 
        answerBox.style.borderColor = "#f44336";
    }
}