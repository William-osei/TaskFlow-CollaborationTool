#!/usr/bin/env python3
"""
TaskFlow Collaboration Tool - Database Models
Recreated from recovered database schema
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

# db will be injected when models are imported
db = None

class User(UserMixin, db.Model):
    """User model - recreated from recovered schema"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='member')  # admin, member
    avatar_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    owned_projects = db.relationship('Project', backref='owner', lazy=True, foreign_keys='Project.owner_id')
    assigned_tasks = db.relationship('Task', backref='assignee', lazy=True, foreign_keys='Task.assignee_id')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        """Convert user to dictionary for JSON responses"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    @property
    def full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'

class Project(db.Model):
    """Project model - recreated from recovered schema"""
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='ACTIVE')  # ACTIVE, COMPLETED, ON_HOLD, CANCELLED
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.name}>'
    
    def to_dict(self):
        """Convert project to dictionary for JSON responses"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'owner_id': self.owner_id,
            'owner_name': self.owner.full_name if self.owner else None,
            'task_count': len(self.tasks)
        }
    
    @property
    def completion_percentage(self):
        """Calculate project completion percentage"""
        if not self.tasks:
            return 0
        
        completed_tasks = sum(1 for task in self.tasks if task.status == 'COMPLETED')
        return round((completed_tasks / len(self.tasks)) * 100, 2)
    
    def get_tasks_by_status(self, status):
        """Get tasks filtered by status"""
        return [task for task in self.tasks if task.status == status]

class Task(db.Model):
    """Task model - recreated from recovered schema"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='TODO')  # TODO, IN_PROGRESS, COMPLETED, CANCELLED
    priority = db.Column(db.String(10), default='MEDIUM')  # LOW, MEDIUM, HIGH, URGENT
    due_date = db.Column(db.DateTime)
    estimated_hours = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def __repr__(self):
        return f'<Task {self.title}>'
    
    def to_dict(self):
        """Convert task to dictionary for JSON responses"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'estimated_hours': self.estimated_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'project_id': self.project_id,
            'project_name': self.project.name if self.project else None,
            'assignee_id': self.assignee_id,
            'assignee_name': self.assignee.full_name if self.assignee else None
        }
    
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if not self.due_date or self.status == 'COMPLETED':
            return False
        return datetime.utcnow() > self.due_date
    
    @property
    def days_until_due(self):
        """Get days until due date"""
        if not self.due_date:
            return None
        
        delta = self.due_date - datetime.utcnow()
        return delta.days
    
    def mark_completed(self):
        """Mark task as completed"""
        self.status = 'COMPLETED'
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def assign_to_user(self, user_id):
        """Assign task to a user"""
        self.assignee_id = user_id
        self.updated_at = datetime.utcnow()

