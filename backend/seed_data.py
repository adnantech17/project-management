#!/usr/bin/env python3
"""
Database seeding script for ADPM (Advanced Project Management)
Creates realistic dummy data for all models including many-to-many relationships.
"""

import os
import sys
import random
from datetime import datetime, timedelta
from typing import List
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.category import Category
from models.ticket import Ticket, ticket_users
from models.ticket_history import TicketHistory
from utils.security import get_password_hash

USERS_DATA = [
    {
        "email": "adnan@example.com",
        "username": "adnan",
        "first_name": "Adnan",
        "last_name": "Ali",
        "password": "password123"
    },
    {
        "email": "jane.smith@example.com", 
        "username": "janesmith",
        "first_name": "Jane",
        "last_name": "Smith",
        "password": "password123"
    },
    {
        "email": "bob.wilson@example.com",
        "username": "bobwilson", 
        "first_name": "Bob",
        "last_name": "Wilson",
        "password": "password123"
    },
    {
        "email": "alice.brown@example.com",
        "username": "alicebrown",
        "first_name": "Alice", 
        "last_name": "Brown",
        "password": "password123"
    },
    {
        "email": "charlie.davis@example.com",
        "username": "charliedavis",
        "first_name": "Charlie",
        "last_name": "Davis", 
        "password": "password123"
    },
    {
        "email": "diana.miller@example.com",
        "username": "dianamiller",
        "first_name": "Diana",
        "last_name": "Miller",
        "password": "password123"
    }
]

CATEGORIES_DATA = [
    {"name": "To Do", "color": "#EF4444", "position": 0},
    {"name": "In Progress", "color": "#F59E0B", "position": 1},
    {"name": "Review", "color": "#8B5CF6", "position": 2},
    {"name": "Testing", "color": "#3B82F6", "position": 3},
    {"name": "Done", "color": "#10B981", "position": 4},
    {"name": "Blocked", "color": "#DC2626", "position": 5},
]

TICKETS_DATA = [
    {
        "title": "Implement user authentication system",
        "description": "Create a comprehensive user authentication system with login, logout, and registration functionality. Include JWT token management and password hashing.",
        "category_name": "In Progress"
    },
    {
        "title": "Design dashboard UI/UX",
        "description": "Create wireframes and mockups for the main dashboard interface. Focus on user experience and modern design principles.",
        "category_name": "To Do"
    },
    {
        "title": "Set up database schema",
        "description": "Design and implement the database schema for users, projects, and tickets. Include proper relationships and constraints.",
        "category_name": "Done"
    },
    {
        "title": "Create API documentation",
        "description": "Document all API endpoints using OpenAPI/Swagger. Include request/response examples and authentication details.",
        "category_name": "Review"
    },
    {
        "title": "Implement ticket management",
        "description": "Build CRUD operations for ticket management including create, read, update, delete, and status changes.",
        "category_name": "In Progress"
    },
    {
        "title": "Add real-time notifications",
        "description": "Implement WebSocket-based real-time notifications for ticket updates and user mentions.",
        "category_name": "To Do"
    },
    {
        "title": "Setup CI/CD pipeline",
        "description": "Configure continuous integration and deployment using GitHub Actions. Include automated testing and deployment to staging/production.",
        "category_name": "Testing"
    },
    {
        "title": "Implement file upload feature",
        "description": "Add ability to upload and attach files to tickets. Support multiple file formats and include security validation.",
        "category_name": "To Do"
    },
    {
        "title": "Create user roles and permissions",
        "description": "Implement role-based access control with different permission levels for admin, manager, and regular users.",
        "category_name": "Review"
    },
    {
        "title": "Setup monitoring and logging",
        "description": "Implement application monitoring, error tracking, and comprehensive logging for production debugging.",
        "category_name": "Blocked"
    },
    {
        "title": "Optimize database performance",
        "description": "Add database indexes, optimize queries, and implement caching strategies for better performance.",
        "category_name": "Done"
    },
    {
        "title": "Create mobile responsive design",
        "description": "Ensure the application works seamlessly on mobile devices with responsive design and touch-friendly interface.",
        "category_name": "Testing"
    },
    {
        "title": "Implement search functionality",
        "description": "Add full-text search capabilities for tickets, users, and projects with filters and sorting options.",
        "category_name": "In Progress"
    },
    {
        "title": "Setup backup and recovery",
        "description": "Implement automated database backups and disaster recovery procedures for data protection.",
        "category_name": "To Do"
    },
    {
        "title": "Create analytics dashboard",
        "description": "Build analytics and reporting features showing project progress, team productivity, and performance metrics.",
        "category_name": "To Do"
    }
]


def create_users(db: Session) -> List[User]:
    """Create user accounts with hashed passwords."""
    users = []
    
    for user_data in USERS_DATA:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if existing_user:
            users.append(existing_user)
            continue
            
        user = User(
            email=user_data["email"],
            username=user_data["username"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            hashed_password=get_password_hash(user_data["password"]),
            is_active=True
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    return users


def create_categories(db: Session, users: List[User]) -> List[Category]:
    """Create project categories."""
    categories = []
    
    main_user = users[0]
    
    for cat_data in CATEGORIES_DATA:
        existing_category = db.query(Category).filter(
            Category.name == cat_data["name"], 
            Category.user_id == main_user.id
        ).first()
        if existing_category:
            categories.append(existing_category)
            continue
            
        category = Category(
            name=cat_data["name"],
            color=cat_data["color"],
            position=cat_data["position"],
            user_id=main_user.id
        )
        db.add(category)
        categories.append(category)
    
    db.commit()
    return categories


def create_tickets(db: Session, users: List[User], categories: List[Category]) -> List[Ticket]:
    """Create tickets with realistic data."""
    tickets = []
    
    main_user = users[0]
    
    for i, ticket_data in enumerate(TICKETS_DATA):
        category = next((cat for cat in categories if cat.name == ticket_data["category_name"]), categories[0])
        
        existing_ticket = db.query(Ticket).filter(Ticket.title == ticket_data["title"]).first()
        if existing_ticket:
            tickets.append(existing_ticket)
            continue
        
        expiry_date = datetime.now() + timedelta(days=random.randint(1, 30))
        
        ticket = Ticket(
            title=ticket_data["title"],
            description=ticket_data["description"],
            expiry_date=expiry_date,
            position=i,
            category_id=category.id,
            user_id=main_user.id
        )
        db.add(ticket)
        tickets.append(ticket)
    
    db.commit()
    return tickets


def assign_users_to_tickets(db: Session, users: List[User], tickets: List[Ticket]):
    """Create many-to-many relationships between users and tickets."""
    for ticket in tickets:
        num_assignees = random.randint(1, min(3, len(users)))
        assigned_users = random.sample(users, num_assignees)
        
        for user in assigned_users:
            existing = db.execute(
                ticket_users.select().where(
                    ticket_users.c.ticket_id == ticket.id,
                    ticket_users.c.user_id == user.id
                )
            ).first()
            
            if not existing:
                db.execute(
                    ticket_users.insert().values(
                        ticket_id=ticket.id,
                        user_id=user.id,
                        assigned_at=datetime.now()
                    )
                )
    
    db.commit()


def create_ticket_history(db: Session, users: List[User], tickets: List[Ticket], categories: List[Category]):
    """Create ticket history entries for realistic activity logs."""
    history_actions = [
        ("created", "Ticket created"),
        ("updated", "Description updated"),
        ("moved", "Moved to different category"),
        ("updated", "Assigned users updated"),
        ("updated", "Due date extended"),
    ]
    
    for ticket in tickets:
        num_entries = random.randint(2, 5)
        
        for i in range(num_entries):
            action_type, description = random.choice(history_actions)
            random_user = random.choice(users)
            
            old_values = None
            new_values = None
            from_category_name = None
            to_category_name = None
            
            if action_type == "created":
                new_values = {
                    "title": ticket.title,
                    "description": ticket.description,
                    "category": ticket.category.name if ticket.category else None,
                    "assigned_users": [user.username for user in users[:2]]
                }
                to_category_name = ticket.category.name if ticket.category else None
                
            elif action_type == "moved":
                old_category = random.choice(categories)
                new_category = ticket.category
                from_category_name = old_category.name
                to_category_name = new_category.name if new_category else None
                old_values = {"category": old_category.name}
                new_values = {"category": new_category.name if new_category else None}
                
            elif action_type == "updated":
                old_values = {
                    "title": ticket.title,
                    "description": "Old description content",
                    "assigned_users": [users[0].username]
                }
                new_values = {
                    "title": ticket.title,
                    "description": ticket.description,
                    "assigned_users": [user.username for user in users[:2]]
                }
            
            created_at = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            history = TicketHistory(
                ticket_id=ticket.id,
                user_id=random_user.id,
                action_type=action_type,
                old_values=old_values,
                new_values=new_values,
                from_category_name=from_category_name,
                to_category_name=to_category_name,
                created_at=created_at
            )
            db.add(history)
    
    db.commit()


def seed_database():
    """Main function to seed the database with dummy data."""
    db = next(get_db())
    
    try:
        users = create_users(db)
        categories = create_categories(db, users)
        tickets = create_tickets(db, users, categories)
        assign_users_to_tickets(db, users, tickets)
        create_ticket_history(db, users, tickets, categories)
        
        print(f"Seeded: {len(users)} users, {len(categories)} categories, {len(tickets)} tickets")
        print("Login: adnan@example.com / password123")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()