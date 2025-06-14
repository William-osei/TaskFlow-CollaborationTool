// TaskFlow Frontend JavaScript

// API Base URL
const API_BASE = 'http://localhost:5000';

// Current user state
let currentUser = null;

// DOM Elements
const elements = {
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    loginModal: document.getElementById('loginModal'),
    closeModal: document.getElementById('closeModal'),
    loginForm: document.getElementById('loginForm'),
    userInfo: document.getElementById('userInfo'),
    statusMessage: document.getElementById('statusMessage'),
    navLinks: document.querySelectorAll('.nav-link'),
    contentSections: document.querySelectorAll('.content-section')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDashboardData();
    setupNavigation();
});

// Setup event listeners
function setupEventListeners() {
    // Login modal
    elements.loginBtn.addEventListener('click', () => showModal());
    elements.closeModal.addEventListener('click', () => hideModal());
    elements.loginModal.addEventListener('click', (e) => {
        if (e.target === elements.loginModal) hideModal();
    });
    
    // Login form
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            showSection(target);
            
            // Update active nav link
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Setup navigation
function setupNavigation() {
    // Show dashboard by default
    showSection('dashboard');
}

// Show specific content section
function showSection(sectionId) {
    elements.contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'projects':
                loadProjects();
                break;
            case 'tasks':
                loadTasks();
                break;
            case 'users':
                loadUsers();
                break;
        }
    }
}

// Modal functions
function showModal() {
    elements.loginModal.classList.add('show');
}

function hideModal() {
    elements.loginModal.classList.remove('show');
    elements.loginForm.reset();
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.loginForm);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            updateUserInterface();
            hideModal();
            showMessage('Login successful!', 'success');
            loadDashboardData();
        } else {
            showMessage(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    updateUserInterface();
    showMessage('Logged out successfully', 'info');
    loadDashboardData();
}

// Update UI based on login status
function updateUserInterface() {
    if (currentUser) {
        elements.loginBtn.style.display = 'none';
        elements.logoutBtn.style.display = 'block';
        document.querySelector('.user-name').textContent = currentUser.first_name + ' ' + currentUser.last_name;
    } else {
        elements.loginBtn.style.display = 'block';
        elements.logoutBtn.style.display = 'none';
        document.querySelector('.user-name').textContent = 'Guest User';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        await Promise.all([
            loadStats(),
            loadRecentActivity()
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        const [usersResponse, projectsResponse, tasksResponse] = await Promise.all([
            fetch(`${API_BASE}/api/users`),
            fetch(`${API_BASE}/api/projects`),
            fetch(`${API_BASE}/api/tasks`)
        ]);
        
        const users = await usersResponse.json();
        const projects = await projectsResponse.json();
        const tasks = await tasksResponse.json();
        
        // Update dashboard stats
        document.getElementById('totalUsers').textContent = users.users?.length || 0;
        document.getElementById('totalProjects').textContent = projects.projects?.length || 0;
        document.getElementById('totalTasks').textContent = tasks.tasks?.length || 0;
        
        const completedTasks = tasks.tasks?.filter(task => task.status === 'COMPLETED').length || 0;
        document.getElementById('completedTasks').textContent = completedTasks;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set default values on error
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalProjects').textContent = '0';
        document.getElementById('totalTasks').textContent = '0';
        document.getElementById('completedTasks').textContent = '0';
    }
}

// Load recent activity
async function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '<p class="no-data">Loading recent activity...</p>';
    
    // For now, show placeholder
    setTimeout(() => {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
    }, 1000);
}

// Load projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '<p class="no-data">Loading projects...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/api/projects`);
        const result = await response.json();
        
        if (result.projects && result.projects.length > 0) {
            projectsGrid.innerHTML = '';
            result.projects.forEach(project => {
                const projectCard = createProjectCard(project);
                projectsGrid.appendChild(projectCard);
            });
        } else {
            projectsGrid.innerHTML = '<p class="no-data">No projects found</p>';
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsGrid.innerHTML = '<p class="no-data">Error loading projects</p>';
    }
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const statusColor = {
        'ACTIVE': '#28a745',
        'COMPLETED': '#007bff',
        'ON_HOLD': '#ffc107',
        'CANCELLED': '#dc3545'
    };
    
    card.innerHTML = `
        <h3>${project.name}</h3>
        <p>${project.description || 'No description available'}</p>
        <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="background: ${statusColor[project.status] || '#6c757d'}; color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem;">
                ${project.status}
            </span>
            <small style="color: #666;">
                Created: ${new Date(project.created_at).toLocaleDateString()}
            </small>
        </div>
    `;
    
    return card;
}

// Load tasks
async function loadTasks() {
    const todoTasks = document.getElementById('todoTasks');
    const inProgressTasks = document.getElementById('inProgressTasks');
    const completedTasksList = document.getElementById('completedTasksList');
    
    // Clear existing content
    [todoTasks, inProgressTasks, completedTasksList].forEach(container => {
        container.innerHTML = '<p class="no-data">Loading...</p>';
    });
    
    try {
        const response = await fetch(`${API_BASE}/api/tasks`);
        const result = await response.json();
        
        // Clear loading messages
        [todoTasks, inProgressTasks, completedTasksList].forEach(container => {
            container.innerHTML = '';
        });
        
        if (result.tasks && result.tasks.length > 0) {
            // Group tasks by status
            const taskGroups = {
                'TODO': [],
                'IN_PROGRESS': [],
                'COMPLETED': []
            };
            
            result.tasks.forEach(task => {
                const group = taskGroups[task.status] || taskGroups['TODO'];
                group.push(task);
            });
            
            // Populate task columns
            populateTaskColumn(todoTasks, taskGroups['TODO']);
            populateTaskColumn(inProgressTasks, taskGroups['IN_PROGRESS']);
            populateTaskColumn(completedTasksList, taskGroups['COMPLETED']);
        } else {
            [todoTasks, inProgressTasks, completedTasksList].forEach(container => {
                container.innerHTML = '<p class="no-data">No tasks</p>';
            });
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        [todoTasks, inProgressTasks, completedTasksList].forEach(container => {
            container.innerHTML = '<p class="no-data">Error loading tasks</p>';
        });
    }
}

// Populate task column
function populateTaskColumn(container, tasks) {
    if (tasks.length === 0) {
        container.innerHTML = '<p class="no-data">No tasks</p>';
        return;
    }
    
    container.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        container.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.priority.toLowerCase()}-priority`;
    
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
    
    taskDiv.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description || 'No description'}</p>
        <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: #666;">
            <span>Priority: ${task.priority}</span>
            <span>Due: ${dueDate}</span>
        </div>
    `;
    
    return taskDiv;
}

// Load users
async function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '<tr><td colspan="6" class="no-data">Loading users...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE}/api/users`);
        const result = await response.json();
        
        if (result.users && result.users.length > 0) {
            usersTableBody.innerHTML = '';
            result.users.forEach(user => {
                const userRow = createUserRow(user);
                usersTableBody.appendChild(userRow);
            });
        } else {
            usersTableBody.innerHTML = '<tr><td colspan="6" class="no-data">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        usersTableBody.innerHTML = '<tr><td colspan="6" class="no-data">Error loading users</td></tr>';
    }
}

// Create user row element
function createUserRow(user) {
    const row = document.createElement('tr');
    
    const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
    const status = user.is_active ? 'Active' : 'Inactive';
    const statusColor = user.is_active ? '#28a745' : '#dc3545';
    
    row.innerHTML = `
        <td>${user.first_name} ${user.last_name}</td>
        <td>${user.email}</td>
        <td>
            <span style="background: ${user.role === 'admin' ? '#007bff' : '#6c757d'}; color: white; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.8rem;">
                ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
        </td>
        <td>
            <span style="color: ${statusColor}; font-weight: 500;">${status}</span>
        </td>
        <td>${lastLogin}</td>
        <td>
            <button style="background: #667eea; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem; cursor: pointer;">
                Edit
            </button>
        </td>
    `;
    
    return row;
}

// Show status message
function showMessage(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type} show`;
    
    setTimeout(() => {
        elements.statusMessage.classList.remove('show');
    }, 3000);
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const result = await response.json();
        console.log('API Health:', result);
    } catch (error) {
        console.error('API Health Check Failed:', error);
        showMessage('Unable to connect to server', 'error');
    }
}

// Check API health on load
checkAPIHealth();

