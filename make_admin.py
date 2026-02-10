from backend_ai.database import SessionLocal
from backend_ai.models import User

db = SessionLocal()
user = db.query(User).filter(User.username == 'namhh').first()
if user:
    user.is_admin = True
    db.commit()
    print(f'User {user.username} (ID: {user.id}) is now admin!')
else:
    print('User not found')
db.close()
