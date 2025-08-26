// Функція для перемикання сторінок
function showPage(pageId) {
    console.log('Showing page: ', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

export function checkAuthStatus() {
    console.log('checkAuthStatus called');
    
    const user = localStorage.getItem('user');
    const topbar = document.querySelector('.topbar');
    
    if (user) {
        console.log('User is authenticated, redirecting to home page');
        showPage('home-page');
        
        if (topbar) topbar.classList.remove('hidden');
    } else {
        console.log('User is not authenticated, showing login page');
        showPage('login-page');
        
        if (topbar) topbar.classList.add('hidden');
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