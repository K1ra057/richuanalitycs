import { setShowPageFunction } from './auth.js';
import { initTodoManager } from './todomanager.js';

export function showPage(pageId) {
    console.log('Showing page: ', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Инициализация ToDo менеджера при переходе на страницу
    if (pageId === 'todo-page') {
        initTodoManager();
    }

    // Прокрутка к верху страницы
    window.scrollTo(0, 0);
}

// Експортуємо функцію для налаштування showPage в auth.js
export function setupRouter() {
    setShowPageFunction(showPage);
}

export function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            showPage(pageId);
        });
    });
}