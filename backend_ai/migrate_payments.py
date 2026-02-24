"""
Database migration script to add payment and subscription features.
This script updates existing tables and creates new ones.

Run this script after updating models.py
"""
from sqlalchemy import inspect
from backend_ai.database import engine, Base, SessionLocal
from backend_ai.models import User, Payment
from backend_ai import models

def check_column_exists(table_name, column_name):
    """Check if a column exists in a table."""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def add_subscription_columns():
    """Add subscription columns to users table if they don't exist."""
    from sqlalchemy import text
    
    with engine.connect() as conn:
        # Check and add subscription_plan column
        if not check_column_exists('users', 'subscription_plan'):
            print("Adding subscription_plan column to users table...")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN subscription_plan "
                "ENUM('free', 'normal', 'pro') NOT NULL DEFAULT 'free'"
            ))
            conn.commit()
            print("✓ Added subscription_plan column")
        else:
            print("✓ subscription_plan column already exists")
        
        # Check and add subscription_expires_at column
        if not check_column_exists('users', 'subscription_expires_at'):
            print("Adding subscription_expires_at column to users table...")
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN subscription_expires_at DATETIME NULL"
            ))
            conn.commit()
            print("✓ Added subscription_expires_at column")
        else:
            print("✓ subscription_expires_at column already exists")

def create_payments_table():
    """Create payments table if it doesn't exist."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if 'payments' not in tables:
        print("Creating payments table...")
        Base.metadata.tables['payments'].create(engine)
        print("✓ Created payments table")
    else:
        print("✓ payments table already exists")

def main():
    """Main migration function."""
    print("=" * 60)
    print("Database Migration: Adding Payment & Subscription Features")
    print("=" * 60)
    print()
    
    try:
        # Step 1: Add subscription columns to users table
        print("Step 1: Updating users table...")
        add_subscription_columns()
        print()
        
        # Step 2: Create payments table
        print("Step 2: Creating payments table...")
        create_payments_table()
        print()
        
        print("=" * 60)
        print("Migration completed successfully! ✓")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Configure PayOS credentials in .env file")
        print("2. Restart the backend server")
        print("3. Test the registration flow with plan selection")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        print("Please check your database connection and try again.")
        raise

if __name__ == "__main__":
    main()
