#!/usr/bin/env python3
"""
TaskFlow Collaboration Tool - Main Flask Application
Recovered and rebuilt from database schema
"""

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(os.getcwd(), "instance", "taskflow_enhanced.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)  # Enable CORS for all domains on all routes
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Define models inline to avoid circular imports
from flask_login import UserMixin

class User(UserMixin, db.Model):
    """User model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='member')
    avatar_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    owned_projects = db.relationship('Project', backref='owner', lazy=True, foreign_keys='Project.owner_id')
    assigned_tasks = db.relationship('Task', backref='assignee', lazy=True, foreign_keys='Task.assignee_id')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Project(db.Model):
    """Project model"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='ACTIVE')
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.name}>'

class Task(db.Model):
    """Task model"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='TODO')
    priority = db.Column(db.String(10), default='MEDIUM')
    due_date = db.Column(db.DateTime)
    estimated_hours = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def __repr__(self):
        return f'<Task {self.title}>'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    """Main dashboard route"""
    return jsonify({
        'message': 'TaskFlow Collaboration Tool API',
        'version': '2.0',
        'status': 'active',
        'endpoints': {
            'auth': '/auth/login, /auth/register',
            'users': '/api/users',
            'projects': '/api/projects',
            'tasks': '/api/tasks'
        }
    })

@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Authentication routes
@app.route('/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'All fields required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data.get('role', 'member'),
        is_active=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

# API Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    users = User.query.all()
    return jsonify({
        'users': [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None
        } for user in users]
    })

@app.route('/api/projects', methods=['GET', 'POST'])
def handle_projects():
    """Handle projects CRUD"""
    if request.method == 'GET':
        projects = Project.query.all()
        return jsonify({
            'projects': [{
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'status': project.status,
                'start_date': project.start_date.isoformat() if project.start_date else None,
                'end_date': project.end_date.isoformat() if project.end_date else None,
                'created_at': project.created_at.isoformat() if project.created_at else None,
                'owner_id': project.owner_id
            } for project in projects]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('owner_id'):
            return jsonify({'error': 'Name and owner_id required'}), 400
        
        project = Project(
            name=data['name'],
            description=data.get('description', ''),
            status=data.get('status', 'ACTIVE'),
            owner_id=data['owner_id'],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        try:
            db.session.add(project)
            db.session.commit()
            
            return jsonify({
                'message': 'Project created successfully',
                'project': {
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'status': project.status,
                    'owner_id': project.owner_id
                }
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Project creation failed'}), 500

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    """Handle tasks CRUD"""
    if request.method == 'GET':
        tasks = Task.query.all()
        return jsonify({
            'tasks': [{
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'estimated_hours': task.estimated_hours,
                'created_at': task.created_at.isoformat() if task.created_at else None,
                'project_id': task.project_id,
                'assignee_id': task.assignee_id
            } for task in tasks]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('project_id'):
            return jsonify({'error': 'Title and project_id required'}), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            status=data.get('status', 'TODO'),
            priority=data.get('priority', 'MEDIUM'),
            project_id=data['project_id'],
            assignee_id=data.get('assignee_id'),
            estimated_hours=data.get('estimated_hours'),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        try:
            db.session.add(task)
            db.session.commit()
            
            return jsonify({
                'message': 'Task created successfully',
                'task': {
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'priority': task.priority,
                    'project_id': task.project_id
                }
            }), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Task creation failed'}), 500

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)

