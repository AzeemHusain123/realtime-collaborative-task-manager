// Application State
const state = {
    currentUser: null,
    tasks: [],
    users: [],
    teamMembers: [],
    currentView: 'kanban',
    currentSort: 'priority',
    filters: {
        priority: 'all',
        assignee: 'all',
        dueDate: 'all'
    },
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// DOM Elements
const elements = {
    app: document.getElementById('app'),
    authModal: null,
    taskModal: null,
    taskDetailModal: null,
    actionToast: null,
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    taskForm: document.getElementById('taskForm'),
    currentUserName: document.getElementById('currentUserName'),
    totalTasks: document.getElementById('totalTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    todoCount: document.getElementById('todoCount'),
    inProgressCount: document.getElementById('inProgressCount'),
    doneCount: document.getElementById('doneCount'),
    teamMembersList: document.getElementById('teamMembersList'),
    todoList: document.getElementById('todoList'),
    inProgressList: document.getElementById('inProgressList'),
    doneList: document.getElementById('doneList'),
    listTableBody: document.getElementById('listTableBody'),
    calendar: document.getElementById('calendar'),
    searchInput: document.getElementById('searchInput'),
    priorityFilter: document.getElementById('priorityFilter'),
    assigneeFilter: document.getElementById('assigneeFilter'),
    dueDateFilter: document.getElementById('dueDateFilter'),
    clearFilters: document.getElementById('clearFilters'),
    saveTask: document.getElementById('saveTask'),
    editTaskBtn: document.getElementById('editTaskBtn'),
    taskAssignee: document.getElementById('taskAssignee'),
    toastMessage: document.getElementById('toastMessage'),
    prevMonth: document.getElementById('prevMonth'),
    nextMonth: document.getElementById('nextMonth'),
    taskDetailContent: document.getElementById('taskDetailContent'),
    overdueTasks: document.getElementById('overdueTasks'),
    deleteTaskBtn: document.getElementById('deleteTaskBtn')
};

// Initialize the application
function init() {
    // Initialize Bootstrap components
    try {
        if (document.getElementById('authModal')) {
            elements.authModal = new bootstrap.Modal(document.getElementById('authModal'), { backdrop: 'static' });
        }
        if (document.getElementById('taskModal')) {
            elements.taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
        }
        if (document.getElementById('taskDetailModal')) {
            elements.taskDetailModal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
        }
        if (document.getElementById('actionToast')) {
            elements.actionToast = new bootstrap.Toast(document.getElementById('actionToast'), { delay: 3000 });
        }
    } catch (error) {
        console.error('Error initializing Bootstrap components:', error);
        showToast('Failed to initialize UI components', 'error');
    }

    // Load theme
    loadTheme();

    // Check if on dashboard and not logged in
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = getFromStorage('currentUser');
        if (!currentUser) {
            console.log('No user logged in, redirecting to index.html');
            window.location.href = 'index.html';
            return;
        }
        state.currentUser = currentUser;
        showApp();
    } else {
        // On index.html, show auth modal if no user is logged in
        const currentUser = getFromStorage('currentUser');
        if (currentUser) {
            state.currentUser = currentUser;
            window.location.href = 'dashboard.html';
        } else {
            showAuthModal();
        }
    }

    // Load data from localStorage
    loadData();

    // Set up event listeners
    setupEventListeners();

    // Check overdue tasks
    checkOverdueTasks();

    // Simulate real-time updates
    setInterval(simulateRealTimeUpdates, 10000);
}

// Load theme from storage
function loadTheme() {
    try {
        const theme = getFromStorage('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

// Toggle theme
function toggleTheme() {
    try {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        saveToStorage('theme', theme);
    } catch (error) {
        console.error('Error toggling theme:', error);
        showToast('Failed to toggle theme', 'error');
    }
}

// Show authentication modal
function showAuthModal() {
    if (elements.authModal) {
        elements.authModal.show();
    } else {
        console.error('Auth modal not found');
        showToast('Authentication UI not available', 'error');
    }
}

// Show main application
function showApp() {
    if (elements.app && elements.currentUserName) {
        elements.app.classList.remove('d-none');
        elements.currentUserName.textContent = state.currentUser.name || 'User';
        renderAll();
    } else {
        console.error('App container or user name element not found');
        showToast('Failed to load dashboard', 'error');
    }
}

// Load data from localStorage
function loadData() {
    try {
        state.users = getFromStorage('users') || [];
        state.tasks = getFromStorage('tasks') || [];
        state.teamMembers = getFromStorage('teamMembers') || [];

        // If no users exist, create sample users
        if (state.users.length === 0) {
            createSampleUsers();
        }

        // If no team members, derive from users
        if (state.teamMembers.length === 0) {
            state.teamMembers = state.users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.name.split(' ').map(n => n[0]).join('')
            }));
            saveToStorage('teamMembers', state.teamMembers);
        }

        // If no tasks exist, create sample data
        if (state.tasks.length === 0) {
            createSampleData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Failed to load data', 'error');
    }
}

// Create sample users
function createSampleUsers() {
    state.users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', password: 'password123' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', password: 'password123' }
    ];
    saveToStorage('users', state.users);

    state.teamMembers = state.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.name.split(' ').map(n => n[0]).join('')
    }));
    saveToStorage('teamMembers', state.teamMembers);
}

// Create sample data for demonstration
function createSampleData() {
    const sampleTasks = [
        {
            id: 1,
            title: 'Design Homepage',
            description: 'Create wireframes and mockups for the new homepage design',
            category: 'work',
            priority: 'high',
            assignee: 1,
            dueDate: '2025-10-10',
            status: 'todo',
            createdAt: new Date().toISOString(),
            createdBy: 1,
            comments: [
                { id: 1, userId: 2, text: 'Looking forward to seeing the designs!', timestamp: new Date().toISOString() }
            ],
            attachments: []
        },
        {
            id: 2,
            title: 'Write Project Proposal',
            description: 'Draft the initial proposal for the Q3 marketing campaign',
            category: 'work',
            priority: 'medium',
            assignee: 2,
            dueDate: '2025-10-20',
            status: 'inProgress',
            createdAt: new Date().toISOString(),
            createdBy: 1,
            comments: [],
            attachments: []
        },
        {
            id: 3,
            title: 'Review Codebase',
            description: 'Perform a code review for the new feature implementation',
            category: 'work',
            priority: 'low',
            assignee: 3,
            dueDate: '2025-10-15',
            status: 'done',
            createdAt: new Date().toISOString(),
            createdBy: 1,
            comments: [],
            attachments: []
        }
    ];
    state.tasks = sampleTasks;
    saveToStorage('tasks', state.tasks);
}

// Set up event listeners
function setupEventListeners() {
    try {
        // Login form submission
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', handleLogin);
        }

        // Register form submission
        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', handleRegister);
        }

        // Task form submission
        if (elements.taskForm) {
            elements.taskForm.addEventListener('submit', handleTaskSubmit);
        }

        // Save task button
        if (elements.saveTask) {
            elements.saveTask.addEventListener('click', handleTaskSubmit);
        }

        // Edit task button
        if (elements.editTaskBtn) {
            elements.editTaskBtn.addEventListener('click', handleEditTask);
        }

        // Delete task button
        if (elements.deleteTaskBtn) {
            elements.deleteTaskBtn.addEventListener('click', handleDeleteTask);
        }

        // View change listeners
        document.querySelectorAll('.nav-link[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                state.currentView = view;
                renderAll();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Sort change listeners
        document.querySelectorAll('.btn-group button[data-sort]').forEach(button => {
            button.addEventListener('click', (e) => {
                state.currentSort = e.target.dataset.sort;
                document.querySelectorAll('.btn-group button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderAll();
            });
        });

        // Filter listeners
        if (elements.priorityFilter) {
            elements.priorityFilter.addEventListener('change', (e) => {
                state.filters.priority = e.target.value;
                renderAll();
            });
        }

        if (elements.assigneeFilter) {
            elements.assigneeFilter.addEventListener('change', (e) => {
                state.filters.assignee = e.target.value;
                renderAll();
            });
        }

        if (elements.dueDateFilter) {
            elements.dueDateFilter.addEventListener('change', (e) => {
                state.filters.dueDate = e.target.value;
                renderAll();
            });
        }

        if (elements.clearFilters) {
            elements.clearFilters.addEventListener('click', () => {
                state.filters = { priority: 'all', assignee: 'all', dueDate: 'all' };
                elements.priorityFilter.value = 'all';
                elements.assigneeFilter.value = 'all';
                elements.dueDateFilter.value = 'all';
                renderAll();
            });
        }

        // Search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', () => {
                renderAll();
            });
        }

        // Theme toggle
        document.getElementById('toggleTheme')?.addEventListener('click', toggleTheme);

        // Logout
        document.getElementById('logoutLink')?.addEventListener('click', () => {
            removeFromStorage('currentUser');
            window.location.href = 'index.html';
        });

        // Month navigation
        if (elements.prevMonth) {
            elements.prevMonth.addEventListener('click', () => {
                state.currentMonth--;
                if (state.currentMonth < 0) {
                    state.currentMonth = 11;
                    state.currentYear--;
                }
                renderCalendar();
            });
        }

        if (elements.nextMonth) {
            elements.nextMonth.addEventListener('click', () => {
                state.currentMonth++;
                if (state.currentMonth > 11) {
                    state.currentMonth = 0;
                    state.currentYear++;
                }
                renderCalendar();
            });
        }

        // Drag and drop event listeners for Kanban columns
        [elements.todoList, elements.inProgressList, elements.doneList].forEach(list => {
            if (list) {
                list.addEventListener('dragstart', handleDragStart);
                list.addEventListener('dragover', handleDragOver);
                list.addEventListener('drop', handleDrop);
                list.addEventListener('dragend', handleDragEnd);
                list.addEventListener('dragenter', handleDragEnter);
                list.addEventListener('dragleave', handleDragLeave);
            }
        });
    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showToast('Failed to set up event listeners', 'error');
    }
}

// Drag and Drop Handlers
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    e.target.classList.add('task-dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = e.currentTarget.dataset.status;
    updateTaskStatus(parseInt(taskId), newStatus);
    e.currentTarget.classList.remove('drop-zone-active');
}

function handleDragEnd(e) {
    e.target.classList.remove('task-dragging');
}

function handleDragEnter(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drop-zone-active');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drop-zone-active');
}

// Handle login submission
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
        state.currentUser = user;
        saveToStorage('currentUser', user);
        showToast('Login successful!', 'success');
        // Fixed Login Functionality Bug: Added delay to allow toast to display before redirect, preventing perceived "failed" state. Ensures storage persists and redirect happens seamlessly without manual refresh.
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000); // Delay for toast visibility
    } else {
        showToast('Login failed. Invalid credentials.', 'error');
    }
}

// Handle register submission
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    if (state.users.find(u => u.email === email)) {
        showToast('Email already registered.', 'error');
        return;
    }

    const newUser = {
        id: state.users.length + 1,
        name,
        email,
        password
    };

    state.users.push(newUser);
    saveToStorage('users', state.users);

    state.teamMembers.push({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.name.split(' ').map(n => n[0]).join('')
    });
    saveToStorage('teamMembers', state.teamMembers);

    showToast('Registration successful! Please login.', 'success');

    // Switch to login tab
    const loginTab = document.getElementById('login-tab');
    if (loginTab) loginTab.click();
}

// Handle task submission (create or update)
function handleTaskSubmit(e) {
    if (e) e.preventDefault();
    try {
        const taskId = parseInt(document.getElementById('taskId').value) || null;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const assignee = parseInt(document.getElementById('taskAssignee').value);
        const dueDate = document.getElementById('taskDueDate').value;
        const status = document.getElementById('taskStatus').value;

        if (!title) {
            showToast('Task title is required.', 'error');
            return;
        }

        let task;
        if (taskId) {
            // Update existing task
            task = state.tasks.find(t => t.id === taskId);
            if (task) {
                task.title = title;
                task.description = description;
                task.category = category;
                task.priority = priority;
                task.assignee = assignee;
                task.dueDate = dueDate;
                task.status = status;
                showToast('Task updated successfully!', 'success');
                notifyTaskAction(task, 'updated');
            }
        } else {
            // Create new task
            task = {
                id: state.tasks.length + 1,
                title,
                description,
                category,
                priority,
                assignee,
                dueDate,
                status,
                createdAt: new Date().toISOString(),
                createdBy: state.currentUser.id,
                comments: [],
                attachments: []
            };
            state.tasks.push(task);
            showToast('Task created successfully!', 'success');
            notifyTaskAction(task, 'created');
        }

        saveToStorage('tasks', state.tasks);
        elements.taskModal.hide();
        document.getElementById('taskForm').reset();
        renderAll();
    } catch (error) {
        console.error('Error handling task submit:', error);
        showToast('Failed to save task', 'error');
    }
}

// Update task status (for drag and drop)
function updateTaskStatus(taskId, newStatus) {
    try {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            saveToStorage('tasks', state.tasks);
            showToast(`Task moved to ${newStatus}`, 'success');
            notifyTaskAction(task, 'status updated');
            renderAll();
        }
    } catch (error) {
        console.error('Error updating task status:', error);
        showToast('Failed to update task status', 'error');
    }
}

// Render all views
function renderAll() {
    try {
        populateAssigneeFilter();
        const filteredTasks = filterTasks(state.tasks);
        const sortedTasks = sortTasks(filteredTasks);

        renderStats();
        renderTeamMembers();
        renderOverdueTasks();

        switch (state.currentView) {
            case 'kanban':
                renderKanban(sortedTasks);
                break;
            case 'list':
                renderList(sortedTasks);
                break;
            case 'calendar':
                renderCalendar();
                break;
        }
    } catch (error) {
        console.error('Error rendering all:', error);
        showToast('Failed to render views', 'error');
    }
}

// Render stats
function renderStats() {
    try {
        if (elements.totalTasks) elements.totalTasks.textContent = state.tasks.length;
        if (elements.pendingTasks) elements.pendingTasks.textContent = state.tasks.filter(t => t.status !== 'done').length;
    } catch (error) {
        console.error('Error rendering stats:', error);
    }
}

// Render team members
function renderTeamMembers() {
    try {
        if (elements.teamMembersList) {
            elements.teamMembersList.innerHTML = state.teamMembers.map(member => `
                <div class="team-member d-flex align-items-center">
                    <div class="user-avatar me-2">${member.avatar}</div>
                    <div>
                        <div class="fw-semibold">${member.name}</div>
                        <small class="text-muted">${member.email}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error rendering team members:', error);
    }
}

// Render overdue tasks
function renderOverdueTasks() {
    try {
        if (elements.overdueTasks) {
            const overdue = state.tasks.filter(t => isTaskOverdue(t));
            elements.overdueTasks.innerHTML = overdue.map(task => `
                <div class="alert alert-danger d-flex align-items-center mb-2 p-2 rounded-pill">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    <small>${task.title}</small>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error rendering overdue tasks:', error);
    }
}

// Render Kanban view
function renderKanban(tasks) {
    try {
        const todoTasks = tasks.filter(t => t.status === 'todo');
        const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
        const doneTasks = tasks.filter(t => t.status === 'done');

        if (elements.todoList) elements.todoList.innerHTML = todoTasks.map(renderTaskCard).join('');
        if (elements.inProgressList) elements.inProgressList.innerHTML = inProgressTasks.map(renderTaskCard).join('');
        if (elements.doneList) elements.doneList.innerHTML = doneTasks.map(renderTaskCard).join('');

        if (elements.todoCount) elements.todoCount.textContent = todoTasks.length;
        if (elements.inProgressCount) elements.inProgressCount.textContent = inProgressTasks.length;
        if (elements.doneCount) elements.doneCount.textContent = doneTasks.length;

        document.getElementById('kanbanView').classList.remove('d-none');
        document.getElementById('listView')?.classList.add('d-none');
        document.getElementById('calendarView')?.classList.add('d-none');
    } catch (error) {
        console.error('Error rendering Kanban:', error);
    }
}

// Render List view
function renderList(tasks) {
    try {
        if (elements.listTableBody) {
            elements.listTableBody.innerHTML = tasks.map(task => {
                const assignee = state.teamMembers.find(m => m.id === task.assignee);
                return `
                    <tr>
                        <td>${task.title}</td>
                        <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
                        <td>${assignee ? assignee.name : 'Unassigned'}</td>
                        <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</td>
                        <td><span class="badge ${getStatusClass(task.status)}">${task.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="viewTaskDetails(${task.id})"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="editTask(${task.id})"><i class="bi bi-pencil"></i></button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        document.getElementById('listView').classList.remove('d-none');
        document.getElementById('kanbanView')?.classList.add('d-none');
        document.getElementById('calendarView')?.classList.add('d-none');
    } catch (error) {
        console.error('Error rendering list:', error);
    }
}

// Render Calendar view
function renderCalendar() {
    try {
        if (elements.calendar) {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const calendarHeader = document.createElement('div');
            calendarHeader.className = 'calendar-header mb-3';
            calendarHeader.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
            elements.calendar.innerHTML = '';
            elements.calendar.appendChild(calendarHeader);

            const calendarGrid = document.createElement('div');
            calendarGrid.className = 'calendar-grid';

            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysOfWeek.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.className = 'text-center fw-bold p-2 bg-light';
                dayHeader.textContent = day;
                calendarGrid.appendChild(dayHeader);
            });

            const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
            const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-cell other-month';
                dayCell.innerHTML = `<div class="calendar-date">${daysInPrevMonth - firstDay + i + 1}</div>`;
                calendarGrid.appendChild(dayCell);
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'calendar-cell';
                const currentDate = new Date(state.currentYear, state.currentMonth, day);
                const isToday = currentDate.toDateString() === new Date().toDateString();
                if (isToday) dayCell.classList.add('today');

                dayCell.innerHTML = `<div class="calendar-date">${day}</div>`;

                const dayTasks = state.tasks.filter(task => task.dueDate === currentDate.toISOString().split('T')[0]);
                dayTasks.forEach(task => {
                    const taskElem = document.createElement('div');
                    taskElem.className = `calendar-task task-priority-${task.priority} ${isTaskOverdue(task) ? 'overdue' : ''}`;
                    taskElem.textContent = task.title;
                    taskElem.onclick = () => viewTaskDetails(task.id);
                    dayCell.appendChild(taskElem);
                });

                if (dayTasks.length > 2) {
                    const moreElem = document.createElement('div');
                    moreElem.className = 'calendar-task more-tasks';
                    moreElem.textContent = `+${dayTasks.length - 2} more`;
                    dayCell.appendChild(moreElem);
                }

                calendarGrid.appendChild(dayCell);
            }

            elements.calendar.appendChild(calendarGrid);

            document.getElementById('calendarView').classList.remove('d-none');
            document.getElementById('kanbanView')?.classList.add('d-none');
            document.getElementById('listView')?.classList.add('d-none');
        }
    } catch (error) {
        console.error('Error rendering calendar:', error);
    }
}

// Render task card
function renderTaskCard(task) {
    const assignee = state.teamMembers.find(member => member.id === task.assignee);
    const isOverdue = isTaskOverdue(task);
    return `
        <div class="task-card p-3 ${getPriorityClass(task.priority)} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}" draggable="true">
            <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-2">${task.title}</h6>
                <div class="task-actions">
                    <button class="btn btn-sm btn-link p-0 me-2" onclick="viewTaskDetails(${task.id})"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-link p-0" onclick="editTask(${task.id})"><i class="bi bi-pencil"></i></button>
                </div>
            </div>
            <p class="small text-muted mb-2">${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div class="user-avatar small">${assignee ? assignee.avatar : '?'}</div>
                <small class="text-muted">${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</small>
            </div>
            ${isOverdue ? '<span class="badge bg-danger mt-2">Overdue</span>' : ''}
        </div>
    `;
}

// Populate assignee filter and task assignee select
function populateAssigneeFilter() {
    try {
        if (elements.assigneeFilter) {
            elements.assigneeFilter.innerHTML = `
                <option value="all">All Assignees</option>
                ${state.teamMembers.map(member => `
                    <option value="${member.id}">${member.name}</option>
                `).join('')}
            `;
        }
        if (elements.taskAssignee) {
            elements.taskAssignee.innerHTML = state.teamMembers.map(member => `
                <option value="${member.id}">${member.name}</option>
            `).join('');
        }
    } catch (error) {
        console.error('Error populating assignee filter:', error);
        showToast('Failed to populate assignee filter', 'error');
    }
}

// Edit task
function editTask(taskId) {
    try {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskAssignee').value = task.assignee;
            document.getElementById('taskDueDate').value = task.dueDate;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskModalLabel').textContent = 'Edit Task';
            elements.taskModal.show();
        }
    } catch (error) {
        console.error('Error editing task:', error);
        showToast('Failed to edit task', 'error');
    }
}

// Handle edit task (from detail modal)
function handleEditTask() {
    const taskId = parseInt(elements.taskDetailContent.dataset.taskId);
    elements.taskDetailModal.hide();
    editTask(taskId);
}

// Delete task
function deleteTask(taskId) {
    try {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            saveToStorage('tasks', state.tasks);
            showToast('Task deleted successfully!', 'success');
            notifyTaskAction(task, 'deleted');
            renderAll();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Failed to delete task', 'error');
    }
}

// Handle delete task (from detail modal)
function handleDeleteTask() {
    const taskId = parseInt(elements.taskDetailContent.dataset.taskId);
    elements.taskDetailModal.hide();
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
    }
}

// View task details
function viewTaskDetails(taskId) {
    try {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            const assignee = state.teamMembers.find(member => member.id === task.assignee);
            const creator = state.teamMembers.find(member => member.id === task.createdBy);
            elements.taskDetailContent.dataset.taskId = task.id;
            elements.taskDetailContent.innerHTML = `
                <h5>${task.title}</h5>
                <p><strong>Description:</strong> ${task.description}</p>
                <p><strong>Category:</strong> ${task.category}</p>
                <p><strong>Priority:</strong> <span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></p>
                <p><strong>Assignee:</strong> ${assignee ? assignee.name : 'Unassigned'}</p>
                <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                <p><strong>Status:</strong> <span class="badge ${getStatusClass(task.status)}">${task.status}</span></p>
                <p><strong>Created By:</strong> ${creator ? creator.name : 'Unknown'}</p>
                <p><strong>Created At:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
                <hr>
                <h6>Comments</h6>
                <div id="commentList">
                    ${task.comments.map(comment => `
                        <div class="comment-item">
                            <strong>${state.teamMembers.find(m => m.id === comment.userId)?.name || 'Unknown'}</strong>: 
                            ${comment.text}
                            <small class="d-block text-muted">${new Date(comment.timestamp).toLocaleString()}</small>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3">
                    <textarea class="form-control mb-2" id="newComment" placeholder="Add a comment..."></textarea>
                    <button class="btn btn-primary" onclick="addComment(${task.id})">Add Comment</button>
                </div>
            `;
            elements.taskDetailModal.show();
        }
    } catch (error) {
        console.error('Error viewing task details:', error);
        showToast('Failed to view task details', 'error');
    }
}

// Add comment
function addComment(taskId) {
    try {
        const task = state.tasks.find(t => t.id === taskId);
        if (task && elements.taskDetailContent.querySelector('#newComment')) {
            const commentText = elements.taskDetailContent.querySelector('#newComment').value.trim();
            if (commentText) {
                task.comments.push({
                    id: task.comments.length + 1,
                    userId: state.currentUser.id,
                    text: commentText,
                    timestamp: new Date().toISOString()
                });
                saveToStorage('tasks', state.tasks);
                viewTaskDetails(taskId);
                showToast('Comment added successfully!', 'success');
            }
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showToast('Failed to add comment', 'error');
    }
}

// Check if task is overdue
function isTaskOverdue(task) {
    try {
        if (!task.dueDate || task.status === 'done') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    } catch (error) {
        console.error('Error checking overdue task:', error);
        return false;
    }
}

// Check overdue tasks and notify
function checkOverdueTasks() {
    try {
        const overdueTasks = state.tasks.filter(task => isTaskOverdue(task) && task.assignee === state.currentUser.id);
        overdueTasks.forEach(task => {
            showToast(`Task "${task.title}" is overdue! Due: ${new Date(task.dueDate).toLocaleDateString()}`, 'warning');
        });
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
        showToast('Failed to check overdue tasks', 'error');
    }
}

// Notify task action
function notifyTaskAction(task, action) {
    try {
        const assignee = state.teamMembers.find(member => member.id === task.assignee);
        const creator = state.teamMembers.find(member => member.id === task.createdBy);
        const currentUserName = state.currentUser.name;

        if (assignee && assignee.id !== state.currentUser.id) {
            showToast(`Task "${task.title}" ${action} by ${currentUserName} for ${assignee.name}`, 'info');
        }
        if (creator && creator.id !== state.currentUser.id && creator.id !== task.assignee) {
            showToast(`Task "${task.title}" ${action} by ${currentUserName} (created by ${creator.name})`, 'info');
        }
    } catch (error) {
        console.error('Error notifying task action:', error);
        showToast('Failed to notify task action', 'error');
    }
}

// Filter tasks based on current filters
function filterTasks(tasks) {
    try {
        let filteredTasks = [...tasks];

        const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm)
            );
        }

        if (state.filters.priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === state.filters.priority);
        }

        if (state.filters.assignee !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.assignee === parseInt(state.filters.assignee));
        }

        if (state.filters.dueDate !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            filteredTasks = filteredTasks.filter(task => {
                if (!task.dueDate) return false;

                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                switch (state.filters.dueDate) {
                    case 'today':
                        return dueDate.getTime() === today.getTime();
                    case 'week':
                        return dueDate >= today && dueDate <= endOfWeek;
                    case 'month':
                        return dueDate >= today && dueDate <= endOfMonth;
                    case 'overdue':
                        return dueDate < today && task.status !== 'done';
                    default:
                        return true;
                }
            });
        }

        return filteredTasks;
    } catch (error) {
        console.error('Error filtering tasks:', error);
        showToast('Failed to filter tasks', 'error');
        return [];
    }
}

// Sort tasks based on current sort option
function sortTasks(tasks) {
    try {
        const sortedTasks = [...tasks];

        switch (state.currentSort) {
            case 'priority':
                sortedTasks.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                break;
            case 'dueDate':
                sortedTasks.sort((a, b) => {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
        }

        return sortedTasks;
    } catch (error) {
        console.error('Error sorting tasks:', error);
        showToast('Failed to sort tasks', 'error');
        return tasks;
    }
}

// Get priority class for styling
function getPriorityClass(priority) {
    try {
        switch (priority) {
            case 'high': return 'bg-danger';
            case 'medium': return 'bg-warning';
            case 'low': return 'bg-success';
            default: return 'bg-secondary';
        }
    } catch (error) {
        console.error('Error getting priority class:', error);
        return 'bg-secondary';
    }
}

// Get status class for styling
function getStatusClass(status) {
    try {
        switch (status) {
            case 'todo': return 'bg-primary';
            case 'inProgress': return 'bg-warning';
            case 'done': return 'bg-success';
            default: return 'bg-secondary';
        }
    } catch (error) {
        console.error('Error getting status class:', error);
        return 'bg-secondary';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    try {
        if (elements.toastMessage) {
            elements.toastMessage.textContent = message;
        }

        const toastHeader = document.querySelector('#actionToast .toast-header');
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            switch (type) {
                case 'success':
                    icon.className = 'bi bi-check-circle text-success me-2';
                    break;
                case 'error':
                    icon.className = 'bi bi-exclamation-circle text-danger me-2';
                    break;
                case 'info':
                    icon.className = 'bi bi-info-circle text-primary me-2';
                    break;
                case 'warning':
                    icon.className = 'bi bi-exclamation-triangle text-warning me-2';
                    break;
            }
        }

        if (elements.actionToast) {
            elements.actionToast.show();
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    try {
        // Simulate a new comment on a random task
        const randomTask = state.tasks[Math.floor(Math.random() * state.tasks.length)];
        if (randomTask && state.currentUser) {
            const newComment = {
                id: randomTask.comments.length + 1,
                userId: state.currentUser.id,
                text: `Simulated update: Reviewed by ${state.currentUser.name}`,
                timestamp: new Date().toISOString()
            };
            randomTask.comments.push(newComment);
            saveToStorage('tasks', state.tasks);
            showToast(`New comment on "${randomTask.title}"`, 'info');
            if (state.currentView === 'kanban' || state.currentView === 'list') {
                renderAll();
            }
        }
    } catch (error) {
        console.error('Error simulating real-time updates:', error);
    }
}

// Local storage utilities
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        showToast(`Failed to save ${key} to storage`, 'error');
    }
}

function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting from localStorage (${key}):`, error);
        showToast(`Failed to retrieve ${key} from storage`, 'error');
        return null;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        showToast(`Failed to remove ${key} from storage`, 'error');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);