export function initTodoManager() {
    // DOM Elements
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskCategorySelect = document.getElementById("task-category");
    const taskLists = document.querySelectorAll(".task-list");

    // State
    const tasks = JSON.parse(localStorage.getItem("tasks")) || {
        design: [],
        personal: [],
        house: [],
    };

    let draggedItem = null;
    let touchTimer = null;
    let isDragging = false;

    // --- Core Functions ---

    const saveTasks = () => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskLists.forEach(list => {
            list.innerHTML = "";
            const category = list.id;
            if (tasks[category]) {
                tasks[category].forEach((task) => {
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
        li.draggable = true; // Включаем drag and drop для ПК
        if (task.done) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.id = `task-${task.id}`;
        checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            li.classList.toggle("completed", task.done);
            saveTasks();
        });

        const label = document.createElement("label");
        label.textContent = task.text;
        label.htmlFor = `task-${task.id}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
        deleteBtn.addEventListener("click", () => {
            tasks[category] = tasks[category].filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.append(checkbox, label, deleteBtn);

        // Touch Listeners for Drag & Drop (мобильные устройства)
        li.addEventListener("touchstart", handleTouchStart, { passive: false });
        li.addEventListener("touchend", handleTouchEnd);
        li.addEventListener("touchcancel", handleTouchEnd);

        // Mouse Listeners for Drag & Drop (ПК)
        li.addEventListener("dragstart", handleDragStart);
        li.addEventListener("dragend", handleDragEnd);

        return li;
    };

    // Добавляем обработчики для списков (принимают перетаскиваемые элементы)
    taskLists.forEach(list => {
        list.addEventListener("dragover", handleDragOver);
        list.addEventListener("drop", handleDrop);
        list.addEventListener("dragenter", handleDragEnter);
        list.addEventListener("dragleave", handleDragLeave);
    });

    // --- Event Handlers ---

    const handleTaskFormSubmit = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const category = taskCategorySelect.value;
        if (text) {
            const newTask = { id: Date.now(), text, done: false };
            if (!tasks[category]) tasks[category] = [];
            tasks[category].push(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = "";
        }
    };

    // --- Touch Handlers for Drag & Drop (мобильные устройства) ---

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

    // --- Mouse Handlers for Drag & Drop (ПК) ---

    function handleDragStart(e) {
        draggedItem = this;
        isDragging = true;
        setTimeout(() => this.classList.add("dragging"), 0);
        
        // Устанавливаем данные для drag and drop
        e.dataTransfer.setData("text/plain", this.dataset.id);
        e.dataTransfer.effectAllowed = "move";
    }

    function handleDragEnd(e) {
        isDragging = false;
        this.classList.remove("dragging");
        
        // Убираем подсветку со всех списков
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
            // Если перетаскиваем между списками
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
        
        // Обновляем порядок задач
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
        
        // Проверяем, действительно ли мы покидаем список, а не просто переходим на дочерний элемент
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

        // Обновляем категорию задачи
        item.dataset.category = targetCategory;
        task.category = targetCategory;

        saveTasks();
    };

    // --- Initialization ---
    taskForm.addEventListener("submit", handleTaskFormSubmit);
    renderTasks();
}