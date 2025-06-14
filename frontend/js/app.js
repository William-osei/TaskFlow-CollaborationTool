// TaskFlow Frontend JavaScript

// API Base URL
const API_BASE = 'http://localhost:5000';

// Demo mode detection (for GitHub Pages)
const DEMO_MODE = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

// Current user state
let currentUser = null;

// Demo data for GitHub Pages
const DEMO_DATA = {
    users: [
        { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@taskflow.com', role: 'admin', is_active: true, last_login: '2025-06-13T11:03:17.142438' },
        { id: 2, first_name: 'Test', last_name: 'User', email: 'test@taskflow.com', role: 'member', is_active: true, last_login: null },
        { id: 3, first_name: 'Demo', last_name: 'Developer', email: 'demo@taskflow.com', role: 'member', is_active: true, last_login: '2025-06-13T10:26:05.689004' },
        { id: 4, first_name: 'Project', last_name: 'Manager', email: 'pm@taskflow.com', role: 'admin', is_active: true, last_login: '2025-06-12T15:30:22.123456' },
        { id: 5, first_name: 'Team', last_name: 'Lead', email: 'lead@taskflow.com', role: 'member', is_active: true, last_login: '2025-06-13T09:45:33.987654' }
    ],
    projects: [
        { id: 1, name: 'TaskFlow Enhancement Project', description: 'Rebuilding the TaskFlow system with modern technologies', status: 'ACTIVE', created_at: '2025-06-13T10:00:44.719357', owner_id: 1 },
        { id: 2, name: 'Mobile App Development', description: 'Creating a mobile companion app for TaskFlow', status: 'ACTIVE', created_at: '2025-06-12T14:30:22.555444', owner_id: 4 },
        { id: 3, name: 'Database Migration', description: 'Migrating from SQLite to PostgreSQL for production', status: 'COMPLETED', created_at: '2025-06-10T09:15:33.111222', owner_id: 1 }
    ],
    tasks: [
        { id: 1, title: 'Design new dashboard layout', description: 'Create mockups for the improved dashboard interface', status: 'COMPLETED', priority: 'HIGH', created_at: '2025-06-13T10:30:44.719357', project_id: 1, assignee_id: 3 },
        { id: 2, title: 'Implement user authentication', description: 'Add secure login and registration functionality', status: 'COMPLETED', priority: 'HIGH', created_at: '2025-06-13T11:00:44.719357', project_id: 1, assignee_id: 1 },
        { id: 3, title: 'Create API documentation', description: 'Document all REST API endpoints with examples', status: 'IN_PROGRESS', priority: 'MEDIUM', created_at: '2025-06-13T12:00:44.719357', project_id: 1, assignee_id: 2 },
        { id: 4, title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment', status: 'TODO', priority: 'MEDIUM', created_at: '2025-06-13T13:00:44.719357', project_id: 1, assignee_id: 5 },
        { id: 5, title: 'Mobile app wireframes', description: 'Design the mobile app user interface', status: 'IN_PROGRESS', priority: 'HIGH', created_at: '2025-06-12T15:00:22.555444', project_id: 2, assignee_id: 4 },
        { id: 6, title: 'Performance optimization', description: 'Optimize database queries and frontend loading', status: 'TODO', priority: 'LOW', created_at: '2025-06-13T14:00:44.719357', project_id: 1, assignee_id: 3 }
    ]
};

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
    // Show demo banner if in demo mode
    if (DEMO_MODE) {
        document.getElementById('demoBanner').style.display = 'block';
        document.body.classList.add('demo-mode');
        showMessage('🎯 Demo Mode Active - Explore the interface with sample data!', 'info');
    }
    
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
        let users, projects, tasks;
        
        if (DEMO_MODE) {
            // Use demo data
            users = { users: DEMO_DATA.users };
            projects = { projects: DEMO_DATA.projects };
            tasks = { tasks: DEMO_DATA.tasks };
        } else {
            // Use real API
            const [usersResponse, projectsResponse, tasksResponse] = await Promise.all([
                fetch(`${API_BASE}/api/users`),
                fetch(`${API_BASE}/api/projects`),
                fetch(`${API_BASE}/api/tasks`)
            ]);
            
            users = await usersResponse.json();
            projects = await projectsResponse.json();
            tasks = await tasksResponse.json();
        }
        
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
    
    if (DEMO_MODE) {
        // Show demo activities
        setTimeout(() => {
            const activities = [
                { icon: '✅', text: 'Demo Developer completed "Design new dashboard layout"', time: '2 hours ago' },
                { icon: '🚀', text: 'Admin User created project "TaskFlow Enhancement Project"', time: '1 day ago' },
                { icon: '👤', text: 'Project Manager joined the team', time: '2 days ago' },
                { icon: '📋', text: 'Team Lead was assigned to "Mobile app wireframes"', time: '2 days ago' },
                { icon: '🔄', text: 'Database Migration project marked as completed', time: '3 days ago' }
            ];
            
            activityList.innerHTML = activities.map(activity => `
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: white; margin-bottom: 0.5rem; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <span style="font-size: 1.2rem;">${activity.icon}</span>
                    <div style="flex: 1;">
                        <p style="margin: 0; font-size: 0.9rem; color: #333;">${activity.text}</p>
                        <small style="color: #666;">${activity.time}</small>
                    </div>
                </div>
            `).join('');
        }, 1000);
    } else {
        // For real mode, show placeholder
        setTimeout(() => {
            activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        }, 1000);
    }
}

// Load projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '<p class="no-data">Loading projects...</p>';
    
    try {
        let result;
        
        if (DEMO_MODE) {
            // Use demo data
            result = { projects: DEMO_DATA.projects };
        } else {
            // Use real API
            const response = await fetch(`${API_BASE}/api/projects`);
            result = await response.json();
        }
        
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
        let result;
        
        if (DEMO_MODE) {
            // Use demo data
            result = { tasks: DEMO_DATA.tasks };
        } else {
            // Use real API
            const response = await fetch(`${API_BASE}/api/tasks`);
            result = await response.json();
        }
        
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
        let result;
        
        if (DEMO_MODE) {
            // Use demo data
            result = { users: DEMO_DATA.users };
        } else {
            // Use real API
            const response = await fetch(`${API_BASE}/api/users`);
            result = await response.json();
        }
        
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

