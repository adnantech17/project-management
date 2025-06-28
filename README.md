# ADPM - Advanced Project Management

## Prerequisites

- Python 3.8+
- Node.js 18+
- Docker & Docker Compose

## Quick Setup (Docker)

### One-Time Setup
```bash
cd backend
cp env.sample .env                              # Copy environment configuration
docker-compose up -d                            # Start database and app services
docker-compose exec app alembic upgrade head    # Apply database schema
docker-compose exec app python seed_data.py     # Create sample data for testing
```

### Daily Development Commands
```bash
docker-compose up -d                            # Start services (if stopped)
docker-compose down                             # Stop services when done
```

### Frontend Setup
```bash
cd frontend
cp env.sample .env                              # Copy frontend configuration (one-time)
npm install                                     # Install dependencies (one-time)
npm run dev                                     # Start development server (daily)
```

## Manual Setup (Local Development)

### One-Time Setup
```bash
cd backend
cp env.sample .env                              # Copy environment configuration
python3 -m venv venv                            # Create isolated Python environment
source venv/bin/activate                        # Activate virtual environment
pip install -r requirements.txt                 # Install Python dependencies
alembic upgrade head                            # Apply database schema
python seed_data.py                             # Create sample data for testing
```

### Daily Development Commands
```bash
source venv/bin/activate                        # Activate virtual environment
uvicorn main:app --reload                       # Start backend with auto-reload
```

### Frontend Setup
```bash
cd frontend
cp env.sample .env                              # Copy frontend configuration (one-time)
npm install                                     # Install dependencies (one-time)
npm run dev                                     # Start development server (daily)
```

## Environment Configuration

- **Always** copy `env.sample` to `.env` in both backend and frontend directories
- **Production**: Change `JWT_SECRET_KEY`, `POSTGRES_PASSWORD`, set `DEBUG=False`

## Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Default Login
- Email: john.doe@example.com
- Password: password123

## Database Management

### When Schema Changes (As Needed)
```bash
alembic revision -m "description"               # Create migration file for schema changes
alembic upgrade head                            # Apply new migrations to database
```

### Reset Everything (When Things Break)
```bash
docker-compose down -v                          # Stop and remove all data
docker-compose up -d                            # Start fresh services
docker-compose exec app alembic upgrade head    # Recreate database schema
docker-compose exec app python seed_data.py     # Recreate sample data
```

## Troubleshooting

- **Environment variable warnings**: Ensure `.env` file exists in backend directory
- **Database connection errors**: Make sure Docker containers are running
- **Permission errors**: Run `sudo chown -R $USER:$USER .` if needed 