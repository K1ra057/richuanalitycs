import { checkAuthStatus, handleLogin, handleLogout } from './auth.js';
import { initTodoManager } from './todomanager.js';
import { setupNavigation } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
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

    // Инициализация ToDo менеджера при загрузке страницы
    initTodoManager();
});