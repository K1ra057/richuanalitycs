let todos = [];

export function loadTodos() {
    // Загрузка задач из localStorage
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    }
    renderTodos();
}

export function setupTodoFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            renderTodos(filter);
        });
    });
}

export function renderTodos(filter = 'all') {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;
    
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (filter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <button class="btn btn-danger" data-id="${todo.id}">Видалити</button>
        `;
        todoList.appendChild(li);
    });

    // Добавляем обработчики событий
    document.querySelectorAll('#todo-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTodo);
    });

    document.querySelectorAll('#todo-list .btn-danger').forEach(button => {
        button.addEventListener('click', deleteTodo);
    });
}

export function addNewTodo(e) {
    e.preventDefault();
    const todoInput = document.getElementById('todo-input');
    const text = todoInput.value.trim();
    
    if (text) {
        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };
        
        todos.push(newTodo);
        saveTodos();
        renderTodos();
        todoInput.value = '';
    }
}

function toggleTodo(e) {
    const id = parseInt(e.target.dataset.id);
    const todo = todos.find(todo => todo.id === id);
    
    if (todo) {
        todo.completed = e.target.checked;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(e) {
    const id = parseInt(e.target.dataset.id);
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}