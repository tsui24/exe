"""
Migration script to add subscription columns to users table.
Run this once to update your database schema.
"""
from sqlalchemy import text
from .database import engine

def migrate_subscription_columns():
    """Add subscription_plan and subscription_expires_at columns to users table."""
    
    migrations = [
        """
        ALTER TABLE users 
        ADD COLUMN subscription_plan ENUM('free', 'normal', 'pro') 
        DEFAULT 'free' NOT NULL
        AFTER is_admin
        """,
        """
        ALTER TABLE users 
        ADD COLUMN subscription_expires_at DATETIME 
        NULL
        AFTER subscription_plan
        """
    ]
    
    with engine.connect() as connection:
        for migration_sql in migrations:
            try:
                print(f"Executing: {migration_sql.strip()}")
                connection.execute(text(migration_sql))
                connection.commit()
                print("✓ Migration executed successfully")
            except Exception as e:
                if "Duplicate column name" in str(e):
                    print(f"⚠ Column already exists, skipping...")
                else:
                    print(f"✗ Error: {e}")
                    raise

if __name__ == "__main__":
    print("Starting migration...")
    migrate_subscription_columns()
    print("Migration completed!")
