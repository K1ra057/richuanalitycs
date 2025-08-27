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
            showErrorState();
        });
}

// Функции для отрисовки графиков
function renderAllCharts() {
    renderSalesByDayChart();
    renderLeadsByDayChart();
    renderRepeatCustomersChart();
    renderRevenueByDayChart(); // Изменено на по дням
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
                fill: true,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Сума продажів (грн)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
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
                borderWidth: 1,
                borderRadius: 5,
                hoverBackgroundColor: 'rgba(46, 204, 113, 0.9)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Кількість лідів'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 3. Повторные покупки (круговая диаграмма) - УЛУЧШЕННАЯ ВЕРСИЯ
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
        '3 покупки': 0,
        '4+ покупки': 0
    };
    
    Object.values(purchasesByCustomer).forEach(count => {
        if (count === 1) {
            distribution['1 покупка']++;
        } else if (count === 2) {
            distribution['2 покупки']++;
        } else if (count === 3) {
            distribution['3 покупки']++;
        } else {
            distribution['4+ покупки']++;
        }
    });
    
    if (charts.repeatCustomers) {
        charts.repeatCustomers.destroy();
    }
    
    // Используем pie chart вместо doughnut для лучшей читаемости
    charts.repeatCustomers = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                data: Object.values(distribution),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(241, 196, 15, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(46, 204, 113, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)'
                ],
                borderWidth: 1,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20
                }
            }
        }
    });
}

// 4. Оборот по дням (линейный график) - ИСПРАВЛЕННЫЙ
function renderRevenueByDayChart() {
    const ctx = document.getElementById('revenue-by-day-chart');
    if (!ctx) return;
    
    // Группируем по дням и суммируем amount
    const revenueByDay = {};
    salesData.forEach(sale => {
        if (!revenueByDay[sale.date]) {
            revenueByDay[sale.date] = 0;
        }
        revenueByDay[sale.date] += sale.amount;
    });
    
    // Сортируем по дате
    const sortedDates = Object.keys(revenueByDay).sort();
    const revenues = sortedDates.map(date => revenueByDay[date]);
    
    if (charts.revenueByDay) {
        charts.revenueByDay.destroy();
    }
    
    charts.revenueByDay = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
                label: 'Оборот по днях',
                data: revenues,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#9b59b6',
                pointBorderColor: '#fff',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Оборот: ${context.raw.toLocaleString('uk-UA')} грн`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Оборот (грн)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Дата'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
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
                pointBackgroundColor: 'rgba(241, 196, 15, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(241, 196, 15, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: Math.max(...Object.values(salesByManager)) / 5
                    }
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