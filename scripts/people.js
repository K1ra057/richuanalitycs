export function loadPeopleData() {
    // В реальном приложении здесь был бы fetch к API
    // Для демонстрации создадим фиктивные данные
    const people = [
        {
            id: 1,
            name: 'Іван Петренко',
            email: 'ivan.petrenko@example.com',
            phone: '+380501234567',
            position: 'Менеджер з продажу',
            department: 'Відділ продажів'
        },
        {
            id: 2,
            name: 'Марія Коваленко',
            email: 'maria.kovalenko@example.com',
            phone: '+380671234568',
            position: 'Старший менеджер',
            department: 'Відділ продажів'
        },
        {
            id: 3,
            name: 'Олексій Сидоренко',
            email: 'oleksiy.sydorenko@example.com',
            phone: '+380631234569',
            position: 'Аналітик',
            department: 'Відділ аналітики'
        },
        {
            id: 4,
            name: 'Наталія Шевченко',
            email: 'natalia.shevchenko@example.com',
            phone: '+380501234570',
            position: 'Маркетолог',
            department: 'Відділ маркетингу'
        },
        {
            id: 5,
            name: 'Андрій Іваненко',
            email: 'andriy.ivanenko@example.com',
            phone: '+380671234571',
            position: 'Розробник',
            department: 'IT відділ'
        },
        {
            id: 6,
            name: 'Тетяна Бойко',
            email: 'tetiana.boyko@example.com',
            phone: '+380631234572',
            position: 'Дизайнер',
            department: 'Відділ дизайну'
        }
    ];
    
    renderPeople(people);
}

function renderPeople(people) {
    const peopleGrid = document.getElementById('people-grid');
    if (!peopleGrid) return;
    
    peopleGrid.innerHTML = '';

    people.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.innerHTML = `
            <h3>${person.name}</h3>
            <p><strong>Посада:</strong> ${person.position}</p>
            <p><strong>Відділ:</strong> ${person.department}</p>
            <p><strong>Email:</strong> ${person.email}</p>
            <p><strong>Телефон:</strong> ${person.phone}</p>
        `;
        peopleGrid.appendChild(card);
    });
}