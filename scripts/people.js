export function loadPeopleData() {
    const peopleGrid = document.getElementById('people-grid');
    if (!peopleGrid) return;
    
    // Показуємо стан завантаження
    peopleGrid.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    // Завантажуємо дані з JSONPlaceholder API
    fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(users => {
            renderPeople(users);
        })
        .catch(error => {
            console.error('Error fetching people data:', error);
            peopleGrid.innerHTML = '<div class="error-state">Помилка завантаження даних</div>';
        });
}

function renderPeople(users) {
    const peopleGrid = document.getElementById('people-grid');
    if (!peopleGrid) return;
    
    peopleGrid.innerHTML = '';
    
    if (users.length === 0) {
        peopleGrid.innerHTML = '<div class="no-data">No people data available</div>';
        return;
    }
    
    users.forEach(user => {
        const personCard = document.createElement('div');
        personCard.className = 'person-card';
        personCard.innerHTML = `
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Company:</strong> ${user.company.name}</p>
            <p><strong>Website:</strong> ${user.website}</p>
            <p><strong>Address:</strong> ${user.address.street}, ${user.address.city}</p>
        `;
        peopleGrid.appendChild(personCard);
    });
}