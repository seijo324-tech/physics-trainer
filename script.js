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