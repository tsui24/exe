from backend_ai.database import engine, init_db
from sqlalchemy import text

# Drop table
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS feedbacks'))
    conn.commit()
    print('Table dropped!')

# Recreate with new schema
init_db()
print('Table recreated with ai_response as nullable!')
