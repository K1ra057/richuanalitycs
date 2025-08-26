export let salesData = [];

export function loadSalesData() {
    // В реальном приложении здесь был бы fetch к API
    // Для демонстрации создадим фиктивные данные
    salesData = [
        { id: 1, date: '2025-02-01', manager: 'Іван Петренко', product: 'Ноутбук', amount: 25000 },
        { id: 2, date: '2025-02-02', manager: 'Марія Коваленко', product: 'Монітор', amount: 5000 },
        { id: 3, date: '2025-02-03', manager: 'Олексій Сидоренко', product: 'Мишка', amount: 500 },
        { id: 4, date: '2025-02-04', manager: 'Іван Петренко', product: 'Клавіатура', amount: 800 },
        { id: 5, date: '2025-02-05', manager: 'Марія Коваленко', product: 'Ноутбук', amount: 28000 },
        { id: 6, date: '2025-02-06', manager: 'Олексій Сидоренко', product: 'Навушники', amount: 1200 },
        { id: 7, date: '2025-02-07', manager: 'Іван Петренко', product: 'Веб-камера', amount: 900 },
        { id: 8, date: '2025-02-08', manager: 'Марія Коваленко', product: 'Монітор', amount: 5500 },
        { id: 9, date: '2025-02-09', manager: 'Олексій Сидоренко', product: 'Ноутбук', amount: 26000 },
        { id: 10, date: '2025-02-10', manager: 'Іван Петренко', product: 'Планшет', amount: 15000 }
    ];
    
    renderSalesTable();
    renderManagersTable();
    renderProductsTable();
}

function renderSalesTable() {
    const container = document.getElementById('sales-table-container');
    if (!container) return;

    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sales-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Дата</th>
            <th>Менеджер</th>
            <th>Продукт</th>
            <th>Сума</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    salesData.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.manager}</td>
            <td>${sale.product}</td>
            <td>${sale.amount} грн</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

function renderManagersTable() {
    const container = document.getElementById('managers-table-container');
    if (!container) return;

    // Группируем продажи по менеджерам
    const managers = {};
    salesData.forEach(sale => {
        if (!managers[sale.manager]) {
            managers[sale.manager] = 0;
        }
        managers[sale.manager] += sale.amount;
    });

    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sales-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Менеджер</th>
            <th>Загальний дохід</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    Object.entries(managers).forEach(([manager, amount]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${manager}</td>
            <td>${amount} грн</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

function renderProductsTable() {
    const container = document.getElementById('products-table-container');
    if (!container) return;

    // Группируем продажи по продуктам
    const products = {};
    salesData.forEach(sale => {
        if (!products[sale.product]) {
            products[sale.product] = 0;
        }
        products[sale.product] += sale.amount;
    });

    container.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'sales-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Продукт</th>
            <th>Загальний дохід</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    Object.entries(products).forEach(([product, amount]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product}</td>
            <td>${amount} грн</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

// Додаємо відсутній експорт, щоб не падали імпорти з інших файлів
let _charts = {};

export function initCharts() {
    const ChartGlobal = typeof window !== 'undefined' ? window.Chart : null;
    if (!ChartGlobal) return;

    // Проста агрегація по менеджерах для прикладу
    const byManager = {};
    salesData.forEach(s => {
        byManager[s.manager] = (byManager[s.manager] || 0) + s.amount;
    });

    const managers = Object.keys(byManager);
    const amounts = Object.values(byManager);

    const chartsMap = [
        ['sales-chart', managers, amounts],
        ['leads-chart', ['Ліди'], [salesData.length]],
        ['repeat-customers-chart', ['Повторні покупки'], [Math.round(salesData.length * 0.3)]],
        ['revenue-chart', ['Дохід'], [amounts.reduce((a, b) => a + b, 0)]],
        ['managers-chart', managers, amounts],
    ];

    chartsMap.forEach(([id, labels, values]) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        if (_charts[id]) _charts[id].destroy();

        _charts[id] = new ChartGlobal(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Дані',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}