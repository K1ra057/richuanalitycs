import { setShowPageFunction } from './auth.js';
import { loadTodos } from './todomanager.js';
import { loadSalesData, initCharts } from './analytics.js';
import { loadPeopleData } from './people.js';

export function showPage(pageId) {
    console.log('Showing page: ', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
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

            // Завантаження даних для відповідної сторінки
            if (pageId === 'todo-page') {
                loadTodos();
            } else if (pageId === 'analytics-page') {
                loadSalesData();
                initCharts();
            } else if (pageId === 'people-page') {
                loadPeopleData();
            }
        });
    });
}