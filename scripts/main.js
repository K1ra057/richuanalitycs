import { checkAuthStatus, handleLogin, handleLogout } from './auth.js';
import { initTodoManager } from './todomanager.js';
import { initAnalytics } from './analytics.js';
import { loadPeopleData } from './people.js';
import { setupNavigation, setupRouter } from './router.js';

// Navigation Manager for responsive menu
class NavigationManager {
    constructor() {
        this.burgerMenu = document.getElementById('burger-menu');
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('overlay');
        this.sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
        this.topbarLogoutBtn = document.getElementById('topbar-logout-btn');
        this.closeSidebarBtn = document.getElementById('close-sidebar');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.handleResize(); // Initial check
    }
    
    setupEventListeners() {
        // Burger menu click
        this.burgerMenu?.addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Close sidebar button click
        this.closeSidebarBtn?.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // Overlay click
        this.overlay?.addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // Sidebar links click
        this.sidebar?.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                this.closeSidebar();
            }
        });
        
        // Sync logout buttons
        this.sidebarLogoutBtn?.addEventListener('click', () => {
            this.topbarLogoutBtn?.click();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    toggleSidebar() {
        this.burgerMenu.classList.toggle('active');
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    }
    
    closeSidebar() {
        this.burgerMenu.classList.remove('active');
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleResize() {
        // Auto-close sidebar on resize to desktop
        if (window.innerWidth > 1024) {
            this.closeSidebar();
        }
    }
}

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

    // Инициализация навигации (сайдбар и бургер-меню)
    new NavigationManager();

    // Инициализация менеджера задач
    if (typeof initTodoManager === 'function') {
        initTodoManager();
    }
});