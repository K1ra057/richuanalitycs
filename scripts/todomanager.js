export function initTodoManager() {
    // DOM Elements
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskCategorySelect = document.getElementById("task-category");
    const taskLists = document.querySelectorAll(".task-list");
    const filterButtons = document.querySelectorAll(".filter-btn");

    // State
    const tasks = JSON.parse(localStorage.getItem("tasks")) || {
        design: [],
        personal: [],
        house: [],
    };

    let draggedItem = null;
    let touchTimer = null;
    let isDragging = false;
    let currentFilter = "all";

    // --- Core Functions ---

    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskLists.forEach(list => {
            list.innerHTML = "";
            const category = list.id;
            if (tasks[category]) {
                let filteredTasks = tasks[category];
                
                // Фільтрація задач
                if (currentFilter === "active") {
                    filteredTasks = tasks[category].filter(task => !task.done);
                } else if (currentFilter === "completed") {
                    filteredTasks = tasks[category].filter(task => task.done);
                }
                
                filteredTasks.forEach((task) => {
                    const taskElement = createTaskElement(task, category);
                    list.appendChild(taskElement);
                });
            }
        });
    };

    const createTaskElement = (task, category) => {
        const li = document.createElement("li");
        li.dataset.id = task.id;
        li.dataset.category = category;
        li.draggable = true;
        if (task.done) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.id = `task-${task.id}`;
        checkbox.addEventListener("change", () => {
            toggleTaskCompletion(task.id, category);
        });

        const label = document.createElement("label");
        label.textContent = task.text;
        label.htmlFor = `task-${task.id}`;
        
        // Додаємо подвійний клік для редагування
        label.addEventListener("dblclick", () => {
            editTask(task.id, category);
        });

        const editBtn = document.createElement("button");
        editBtn.innerHTML = "✏️";
        editBtn.className = "edit-btn";
        editBtn.setAttribute("aria-label", `Edit task: ${task.text}`);
        editBtn.addEventListener("click", () => {
            editTask(task.id, category);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
        deleteBtn.addEventListener("click", () => {
            deleteTask(task.id, category);
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "task-actions";
        buttonContainer.append(editBtn, deleteBtn);

        li.append(checkbox, label, buttonContainer);

        // Touch Listeners for Drag & Drop
        li.addEventListener("touchstart", handleTouchStart, { passive: false });
        li.addEventListener("touchend", handleTouchEnd);
        li.addEventListener("touchcancel", handleTouchEnd);

        // Mouse Listeners for Drag & Drop
        li.addEventListener("dragstart", handleDragStart);
        li.addEventListener("dragend", handleDragEnd);

        return li;
    };

    // Додаємо обробники для списків
    taskLists.forEach(list => {
        list.addEventListener("dragover", handleDragOver);
        list.addEventListener("drop", handleDrop);
        list.addEventListener("dragenter", handleDragEnter);
        list.addEventListener("dragleave", handleDragLeave);
    });

    // --- CRUD Operations ---

    const addTask = (text, category) => {
        if (!text.trim()) return;
        
        const newTask = { 
            id: Date.now(), 
            text: text.trim(), 
            done: false,
            createdAt: new Date().toISOString()
        };
        
        if (!tasks[category]) tasks[category] = [];
        tasks[category].push(newTask);
        saveTasks();
        renderTasks();
    };

    const editTask = (taskId, category) => {
        const task = tasks[category].find(t => t.id === taskId);
        if (!task) return;
        
        const newText = prompt("Редагувати задачу:", task.text);
        if (newText !== null && newText.trim() !== "") {
            task.text = newText.trim();
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        }
    };

    const deleteTask = (taskId, category) => {
        if (confirm("Видалити цю задачу?")) {
            tasks[category] = tasks[category].filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    };

    const toggleTaskCompletion = (taskId, category) => {
        const task = tasks[category].find(t => t.id === taskId);
        if (task) {
            task.done = !task.done;
            task.updatedAt = new Date().toISOString();
            saveTasks();
            renderTasks();
        }
    };

    // --- Фільтрація ---
    
    const setFilter = (filter) => {
        currentFilter = filter;
        
        // Оновлюємо активну кнопку
        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.filter === filter);
        });
        
        renderTasks();
    };

    // --- Event Handlers ---

    const handleTaskFormSubmit = (e) => {
        e.preventDefault();
        const text = taskInput.value;
        const category = taskCategorySelect.value;
        addTask(text, category);
        taskInput.value = "";
        taskInput.focus();
    };

    const handleFilterClick = (e) => {
        const filter = e.target.dataset.filter;
        if (filter) {
            setFilter(filter);
        }
    };

    // --- Touch Handlers for Drag & Drop ---

    function handleTouchStart(e) {
        const li = e.currentTarget;
        if (li.classList.contains('completed')) return;

        touchTimer = setTimeout(() => {
            e.preventDefault();
            draggedItem = li;
            draggedItem.classList.add("dragging");
            document.addEventListener("touchmove", handleTouchMove, { passive: false });
        }, 350);
    }

    function handleTouchMove(e) {
        clearTimeout(touchTimer);
        if (!draggedItem) return;
        e.preventDefault();

        const touch = e.touches[0];
        const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!elementUnder) return;

        const targetList = elementUnder.closest('.task-list');
        if (targetList) {
            const afterElement = getDragAfterElement(targetList, touch.clientY);
            targetList.insertBefore(draggedItem, afterElement);
        }
    }

    function handleTouchEnd() {
        clearTimeout(touchTimer);
        document.removeEventListener("touchmove", handleTouchMove);
        if (!draggedItem) return;

        const targetList = draggedItem.closest('.task-list');
        if (targetList) {
            updateTaskOrder(draggedItem, targetList);
        }
        draggedItem.classList.remove("dragging");
        draggedItem = null;
    }

    // --- Mouse Handlers for Drag & Drop ---

    function handleDragStart(e) {
        draggedItem = this;
        isDragging = true;
        setTimeout(() => this.classList.add("dragging"), 0);
        e.dataTransfer.setData("text/plain", this.dataset.id);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragEnd(e) {
        isDragging = false;
        this.classList.remove("dragging");
        taskLists.forEach(list => {
            list.classList.remove("drag-over");
        });
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (!isDragging) return;
        
        const targetList = this;
        const afterElement = getDragAfterElement(targetList, e.clientY);
        
        if (draggedItem && draggedItem.parentNode !== targetList) {
            if (afterElement) {
                targetList.insertBefore(draggedItem, afterElement);
            } else {
                targetList.appendChild(draggedItem);
            }
        }
        
        return false;
    }

    function handleDrop(e) {
        e.preventDefault();
        if (!isDragging) return;
        
        const targetList = this;
        targetList.classList.remove("drag-over");
        updateTaskOrder(draggedItem, targetList);
        return false;
    }

    function handleDragEnter(e) {
        e.preventDefault();
        if (!isDragging) return;
        this.classList.add("drag-over");
    }

    function handleDragLeave(e) {
        e.preventDefault();
        if (!isDragging) return;
        
        const rect = this.getBoundingClientRect();
        if (
            e.clientX < rect.left || 
            e.clientX >= rect.right || 
            e.clientY < rect.top || 
            e.clientY >= rect.bottom
        ) {
            this.classList.remove("drag-over");
        }
    }

    // --- Utility Functions ---

    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    const updateTaskOrder = (item, targetList) => {
        const sourceCategory = item.dataset.category;
        const targetCategory = targetList.id;
        const taskId = Number(item.dataset.id);

        const taskIndex = tasks[sourceCategory].findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        const [task] = tasks[sourceCategory].splice(taskIndex, 1);

        const newLiElements = [...targetList.querySelectorAll('li')];
        const newIndex = newLiElements.indexOf(item);
        
        if (!tasks[targetCategory]) tasks[targetCategory] = [];
        tasks[targetCategory].splice(newIndex, 0, task);

        item.dataset.category = targetCategory;
        task.category = targetCategory;

        saveTasks();
    };

    // --- Initialization ---
    taskForm.addEventListener("submit", handleTaskFormSubmit);
    filterButtons.forEach(btn => {
        btn.addEventListener("click", handleFilterClick);
    });
    renderTasks();
}