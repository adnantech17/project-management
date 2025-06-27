# This file now imports from core for backward compatibility
from core.database import SessionLocal, engine, Base, get_db

__all__ = ['SessionLocal', 'engine', 'Base', 'get_db'] 
