import { setShowPageFunction } from './auth.js';
import { initTodoManager } from './todomanager.js';
import { initAnalytics } from './analytics.js';

export function showPage(pageId) {
    console.log('Showing page: ', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Ініціалізація ToDo менеджера при переході на сторінку
    if (pageId === 'todo-page') {
        setTimeout(() => {
            initTodoManager();
        }, 50);
    }
    
    // Ініціалізація Analytics при переході на сторінку
    if (pageId === 'analytics-page') {
        setTimeout(() => {п
            initAnalytics();
        }, 50);
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