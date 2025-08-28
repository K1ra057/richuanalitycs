import { showPage } from './router.js';

export function setShowPageFunction(func) {
    // Функция теперь импортируется из router.js
}

export function checkAuthStatus() {
    console.log('checkAuthStatus called');
    
    const user = localStorage.getItem('user');
    const topbar = document.querySelector('.topbar');
    const sidebar = document.querySelector('.sidebar');
    const burgerMenu = document.querySelector('.burger-menu');
    
    // Применить сохраненную тему перед проверкой авторизации
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (user) {
        console.log('User is authenticated, redirecting to home page');
        showPage('home-page');
        
        if (topbar) topbar.classList.remove('hidden');
        if (sidebar) sidebar.classList.remove('active');
        if (burgerMenu) burgerMenu.classList.remove('active');
    } else {
        console.log('User is not authenticated, showing login page');
        showPage('login-page');
        
        if (topbar) topbar.classList.add('hidden');
        if (sidebar) sidebar.classList.remove('active');
        if (burgerMenu) burgerMenu.classList.remove('active');
    }
}

export function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    let isValid = true;

    // Валідація email
    if (!validateEmail(email)) {
        document.getElementById('email-error').textContent = 'Введіть коректний email';
        isValid = false;
    } else {
        document.getElementById('email-error').textContent = '';
    }

    // Валідація пароля
    if (password.length < 6) {
        document.getElementById('password-error').textContent = 'Пароль повинен містити щонайменше 6 символів';
        isValid = false;
    } else {
        document.getElementById('password-error').textContent = '';
    }

    if (isValid) {
        console.log('Login form is valid');
        // Збереження користувача в localStorage
        const user = { email };
        localStorage.setItem('user', JSON.stringify(user));
        
        // Перенаправлення на головну сторінку
        checkAuthStatus();
        
        // Очищаємо форму
        document.getElementById('login-form').reset();
    }
    
    return false;
}

export function handleLogout() {
    console.log('Logout called');
    // Очищення localStorage і повернення на сторінку входу
    localStorage.removeItem('user');
    checkAuthStatus();
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}