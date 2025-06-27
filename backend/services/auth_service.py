from sqlalchemy.orm import Session
from models.user import User
from utils.security import verify_password, get_password_hash

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, username: str, password: str):
    if get_user_by_username(db, username) or get_user_by_email(db, email):
        return None
    
    hashed_password = get_password_hash(password)

    user = User(email=email, username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)

    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user
