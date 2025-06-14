# TaskFlow Collaboration Tool 🚀

## 🌟 **[LIVE DEMO - Click to View!](https://william-osei.github.io/TaskFlow-CollaborationTool/)**

> **🚀 Quick Preview**: Want to see the interface immediately? 
> [**Click here for live demo**](https://william-osei.github.io/TaskFlow-CollaborationTool/) - No setup required!
> 
> Features live demo data with 5 users, 3 projects, and 6 tasks in a fully interactive interface!

---

## 🎯 Project Overview
A complete project management and collaboration tool built with Flask backend and modern HTML/CSS/JavaScript frontend. This project was **recovered and rebuilt** from database schemas after data loss, demonstrating resilient development practices.

## ✨ Features

### 🔐 Authentication System
- User registration and login
- Secure password hashing
- Role-based access (Admin/Member)
- Session management

### 👥 User Management
- User profiles with roles
- Activity tracking
- Last login timestamps
- Active/inactive status

### 📊 Project Management
- Create and manage projects
- Project status tracking (Active, Completed, On Hold, Cancelled)
- Project ownership and assignments
- Timeline management

### ✅ Task Management
- Kanban-style task board (To Do, In Progress, Completed)
- Task priorities (Low, Medium, High, Urgent)
- Due date tracking
- Time estimation
- Task assignments

### 📈 Dashboard & Analytics
- Real-time statistics
- Project and task overview
- User activity monitoring
- Visual progress tracking

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-Login** - User session management
- **SQLite** - Database (with existing data preserved)
- **Werkzeug** - Password hashing
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Responsive design with gradients and animations
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icon library
- **Fetch API** - Asynchronous data loading

## 📁 Project Structure

```
TaskFlow-CollaborationTool/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── instance/
│       ├── taskflow_enhanced.db    # Production database
│       └── taskflow_test.db        # Test database
├── frontend/
│   ├── index.html          # Main application interface
│   ├── css/
│   │   └── styles.css      # Responsive styling
│   └── js/
│       └── app.js          # Frontend logic and API integration
├── docs/
│   ├── RECOVERY_PLAN.md    # Project recovery documentation
│   └── API.md              # API documentation
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.12+ (tested with 3.12.1)
- pip package manager
- Modern web browser

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask application:**
   ```bash
   python app.py
   ```

4. **Server will start on:** `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open in browser:**
   - Open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8000`
   - Access at: `http://localhost:8000`

### Test Login Credentials

**Admin User:**
- Email: `admin@taskflow.com`
- Password: Use the original password from your system

**Test User:**
- Email: `test@taskflow.com`
- Password: Use the original password from your system

## 📊 Database Recovery

This project demonstrates successful **data recovery** from SQLite databases:

- ✅ **5 users recovered** (including admin accounts)
- ✅ **Complete schema preserved** (users, projects, tasks)
- ✅ **1 test project recovered** with full metadata
- ✅ **Authentication system intact** with hashed passwords

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Users
- `GET /api/users` - Get all users

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task

### System
- `GET /health` - Health check
- `GET /` - API information

## 🎨 Features Showcase

### Dashboard
- Real-time statistics cards
- Recent activity feed
- Responsive grid layout

### Project Management
- Visual project cards
- Status indicators with color coding
- Creation date tracking

### Task Board
- Kanban-style columns
- Priority-based color coding
- Drag-and-drop ready structure

### User Interface
- Modern gradient design
- Responsive mobile layout
- Smooth animations and transitions
- Professional color scheme

## 🔧 Development

### Adding New Features
1. Backend: Add routes in `app.py`
2. Frontend: Update `app.js` for API calls
3. Styling: Modify `styles.css` for UI

### Database Modifications
1. Update models in `app.py`
2. Handle migrations carefully to preserve existing data
3. Test with `taskflow_test.db` first

## 🚀 Deployment

### Production Checklist
- [ ] Change `SECRET_KEY` in production
- [ ] Use production WSGI server (Gunicorn)
- [ ] Configure proper database (PostgreSQL recommended)
- [ ] Set up SSL/HTTPS
- [ ] Configure environment variables
- [ ] Set up proper logging
- [ ] Configure CORS for specific domains

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.12+)
- Verify all dependencies installed
- Ensure database files exist in `instance/`

**Frontend can't connect:**
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure no firewall blocking

**Database errors:**
- Check file permissions on database files
- Verify SQLite installation
- Check database file integrity

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time collaboration (WebSockets)
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Automated testing suite

### Technical Improvements
- [ ] Database migrations system
- [ ] API versioning
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Background job processing
- [ ] Comprehensive logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Recovered from database schemas after data loss
- Built with modern web technologies
- Designed for scalability and maintainability
- Demonstrates resilient development practices

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

---

**Status:** ✅ Fully Recovered and Operational  
**Last Updated:** June 2025  
**Version:** 2.0 (Rebuilt)

*This project represents a successful recovery from data loss, demonstrating the importance of database preservation and systematic reconstruction.* 🎯

