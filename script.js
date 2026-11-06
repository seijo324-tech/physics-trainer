// 1. Функция для скрытия всех экранов
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
}

// 2. Функция выбора класса
function selectClass(grade) {
    console.log("Выбран класс:", grade); // Проверим в консоли, что клик работает
    
    // Скрываем экран выбора класса
    hideAllScreens();
    
    // Показываем экран выбора темы
    document.getElementById('screen-theme').style.display = 'block';
    
    // Пока временно просто пропишем текст (потом мы заменим это на загрузку из JSON)
    document.getElementById('themes-list').innerHTML = `
        <p>Темы для ${grade} класса скоро появятся здесь!</p>
        <button>Плотность (в разработке)</button>
    `;
}

// 3. Функция для кнопки "Назад"
function goBack(screenId) {
    hideAllScreens();
    document.getElementById(screenId).style.display = 'block';
}