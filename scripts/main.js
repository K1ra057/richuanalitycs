import { checkAuthStatus, handleLogin, handleLogout } from './auth.js';
import { initTodoManager } from './todomanager.js';
import { initAnalytics } from './analytics.js';
import { loadPeopleData } from './people.js';
import { setupNavigation, setupRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Спершу реєструємо showPage в auth.js
    setupRouter();

    // Навігація між сторінками
    setupNavigation();

    // Перевіряємо авторизацію
    checkAuthStatus();

    // Логін
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(e);
            return false;
        });
    }

    // Логаут
    const topbarLogoutBtn = document.getElementById('topbar-logout-btn');
    if (topbarLogoutBtn) {
        topbarLogoutBtn.addEventListener('click', handleLogout);
    }

    // Бокова панель
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // ToDo
    const todoForm = document.getElementById('todo-form');
    if (todoForm) {
        todoForm.addEventListener('submit', addNewTodo);
    }

    setupTodoFilters();
});