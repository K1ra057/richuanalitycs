// Глобальные переменные для хранения данных и графиков
let salesData = [];
let charts = {};

// Основная функция инициализации аналитики
export function initAnalytics() {
    console.log('Initializing analytics...');
    loadSalesData();
}

// Загрузка данных из JSON файла
function loadSalesData() {
    // Показываем индикатор загрузки
    showLoadingState();
    
    fetch('./data/sales_february_2025.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Предполагаем, что данные находятся в свойстве "sales"
            salesData = data.sales || [];
            renderAllCharts();
            renderAllTables();
            hideLoadingState();
        })
        .catch(error => {
            console.error('Error loading sales data:', error);
            hideLoadingState();
            // В случае ошибки можно показать сообщение пользователю
            showErrorState();
        });
}

// Функции для отрисовки графиков
function renderAllCharts() {
    renderSalesByDayChart();
    renderLeadsByDayChart();
    renderRepeatCustomersChart();
    renderRevenueByMonthChart();
    renderSalesByManagerChart();
}

// 1. Продажи по дням (линейный график)
function renderSalesByDayChart() {
    const ctx = document.getElementById('sales-by-day-chart');
    if (!ctx) return;
    
    // Группируем по дням и суммируем amount
    const salesByDay = {};
    salesData.forEach(sale => {
        if (!salesByDay[sale.date]) {
            salesByDay[sale.date] = 0;
        }
        salesByDay[sale.date] += sale.amount;
    });
    
    // Сортируем по дате
    const sortedDates = Object.keys(salesByDay).sort();
    const amounts = sortedDates.map(date => salesByDay[date]);
    
    // Уничтожаем предыдущий график, если он существует
    if (charts.salesByDay) {
        charts.salesByDay.destroy();
    }
    
    // Создаем новый график
    charts.salesByDay = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Продажі по днях',
                data: amounts,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Сума продажів'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    }
                }
            }
        }
    });
}

// 2. Лиды по дням (столбчатая диаграмма)
function renderLeadsByDayChart() {
    const ctx = document.getElementById('leads-by-day-chart');
    if (!ctx) return;
    
    // Считаем лиды по дням
    const leadsByDay = {};
    salesData.forEach(sale => {
        if (sale.isLead) {
            if (!leadsByDay[sale.date]) {
                leadsByDay[sale.date] = 0;
            }
            leadsByDay[sale.date]++;
        }
    });
    
    // Сортируем по дате
    const sortedDates = Object.keys(leadsByDay).sort();
    const leadCounts = sortedDates.map(date => leadsByDay[date]);
    
    if (charts.leadsByDay) {
        charts.leadsByDay.destroy();
    }
    
    charts.leadsByDay = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Ліди по днях',
                data: leadCounts,
                backgroundColor: 'rgba(46, 204, 113, 0.7)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Кількість лідів'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    }
                }
            }
        }
    });
}

// 3. Повторные покупки (круговая диаграмма)
function renderRepeatCustomersChart() {
    const ctx = document.getElementById('repeat-customers-chart');
    if (!ctx) return;
    
    // Группируем по customerId и считаем количество покупок
    const purchasesByCustomer = {};
    salesData.forEach(sale => {
        if (!purchasesByCustomer[sale.customerId]) {
            purchasesByCustomer[sale.customerId] = 0;
        }
        purchasesByCustomer[sale.customerId]++;
    });
    
    // Считаем распределение
    const distribution = {
        '1 покупка': 0,
        '2 покупки': 0,
        '3+ покупки': 0
    };
    
    Object.values(purchasesByCustomer).forEach(count => {
        if (count === 1) {
            distribution['1 покупка']++;
        } else if (count === 2) {
            distribution['2 покупки']++;
        } else {
            distribution['3+ покупки']++;
        }
    });
    
    if (charts.repeatCustomers) {
        charts.repeatCustomers.destroy();
    }
    
    charts.repeatCustomers = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                data: Object.values(distribution),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(155, 89, 182, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 4. Оборот по месяцам (линейный график)
function renderRevenueByMonthChart() {
    const ctx = document.getElementById('revenue-by-month-chart');
    if (!ctx) return;
    
    // Группируем по месяцам
    const monthlyRevenue = {};
    salesData.forEach(sale => {
        // Извлекаем месяц из даты (формат "2025-02")
        const month = sale.date.substring(0, 7);
        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += sale.amount;
    });
    
    // Сортируем месяцы
    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const revenues = sortedMonths.map(month => monthlyRevenue[month]);
    
    if (charts.revenueByMonth) {
        charts.revenueByMonth.destroy();
    }
    
    charts.revenueByMonth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Оборот по місяцях',
                data: revenues,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Оборот (грн)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Місяць'
                    }
                }
            }
        }
    });
}

// 5. Продажи по менеджерам (радарная диаграмма)
function renderSalesByManagerChart() {
    const ctx = document.getElementById('sales-by-manager-chart');
    if (!ctx) return;
    
    // Группируем по менеджерам и суммируем amount
    const salesByManager = {};
    salesData.forEach(sale => {
        if (!salesByManager[sale.manager]) {
            salesByManager[sale.manager] = 0;
        }
        salesByManager[sale.manager] += sale.amount;
    });
    
    if (charts.salesByManager) {
        charts.salesByManager.destroy();
    }
    
    charts.salesByManager = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(salesByManager),
            datasets: [{
                label: 'Продажі по менеджерах',
                data: Object.values(salesByManager),
                backgroundColor: 'rgba(241, 196, 15, 0.2)',
                borderColor: 'rgba(241, 196, 15, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(241, 196, 15, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Функции для отрисовки таблиц
function renderAllTables() {
    renderManagersTable();
    renderProductsTable();
}

// 1. Таблица: Доход по менеджерам
function renderManagersTable() {
    const table = document.getElementById('managers-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Группируем по менеджерам
    const managersData = {};
    salesData.forEach(sale => {
        if (!managersData[sale.manager]) {
            managersData[sale.manager] = {
                orders: 0,
                revenue: 0
            };
        }
        managersData[sale.manager].orders++;
        managersData[sale.manager].revenue += sale.amount;
    });
    
    // Создаем строки таблицы
    Object.entries(managersData).forEach(([manager, data]) => {
        const avgCheck = data.revenue / data.orders;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${manager}</td>
            <td>${data.orders}</td>
            <td>${data.revenue.toLocaleString('uk-UA')} грн</td>
            <td>${avgCheck.toFixed(2)} грн</td>
        `;
        tbody.appendChild(row);
    });
}

// 2. Таблица: Товары с низким оборотом
function renderProductsTable() {
    const table = document.getElementById('products-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Группируем по товарам
    const productsData = {};
    salesData.forEach(sale => {
        if (!productsData[sale.product]) {
            productsData[sale.product] = {
                units: 0,
                revenue: 0
            };
        }
        productsData[sale.product].units++;
        productsData[sale.product].revenue += sale.amount;
    });
    
    // Преобразуем в массив и сортируем по revenue (от меньшего к большему)
    const sortedProducts = Object.entries(productsData)
        .map(([product, data]) => ({
            product,
            units: data.units,
            revenue: data.revenue,
            turnover: data.revenue / data.units
        }))
        .sort((a, b) => a.revenue - b.revenue);
    
    // Создаем строки таблицы (первые 10 товаров с наименьшим оборотом)
    sortedProducts.slice(0, 10).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.product}</td>
            <td>${item.units}</td>
            <td>${item.revenue.toLocaleString('uk-UA')} грн</td>
            <td>${item.turnover.toFixed(2)} грн</td>
        `;
        tbody.appendChild(row);
    });
}

// Вспомогательные функции
function showLoadingState() {
    const chartContainers = document.querySelectorAll('.chart-card, .table-card');
    chartContainers.forEach(container => {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
        container.appendChild(loadingDiv);
    });
}

function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.remove());
}

function showErrorState() {
    const containers = document.querySelectorAll('.chart-card, .table-card');
    containers.forEach(container => {
        container.innerHTML = '<div class="error-state">Помилка завантаження даних</div>';
    });
}