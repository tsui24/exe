import mysql.connector
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection
db_url = os.getenv("DATABASE_URL")
# Parse: mysql://user:password@host:port/database
db_parts = db_url.replace("mysql://", "").split("@")
user_pass = db_parts[0].split(":")
host_db = db_parts[1].split("/")
host_port = host_db[0].split(":")

connection = mysql.connector.connect(
    host=host_port[0],
    port=int(host_port[1]) if len(host_port) > 1 else 3306,
    user=user_pass[0],
    password=user_pass[1],
    database=host_db[1]
)

cursor = connection.cursor()

# Sample messages về xây dựng (tiếng Việt)
messages = [
    "Tôi cần tư vấn về loại xi măng phù hợp cho móng nhà",
    "Giá cát xây dựng hiện nay bao nhiêu tiền 1m3?",
    "Làm thế nào để chống thấm tường nhà cũ?",
    "Tôi muốn biết quy trình đổ bê tông móng",
    "Kích thước cột tiêu chuẩn cho nhà 2 tầng là bao nhiêu?",
    "Nên dùng gạch block hay gạch đỏ để xây tường?",
    "Chi phí xây nhà cấp 4 khoảng 80m2 hết bao nhiêu?",
    "Tôi cần tính toán thép cho sàn nhà",
    "Làm sao để tính khối lượng bê tông cần dùng?",
    "Quy trình thi công móng băng như thế nào?",
    "Tôi muốn biết về loại sơn chống thấm tốt nhất",
    "Khoảng cách giữa các cột nhà phố là bao nhiêu?",
    "Nên chọn mái ngói hay mái tôn cho nhà ở?",
    "Giá thuê máy đào móng 1 ngày bao nhiêu?",
    "Tôi cần tư vấn về thiết kế cầu thang",
    "Độ dày sàn bê tông tiêu chuẩn là bao nhiêu?",
    "Làm thế nào để chống nứt tường?",
    "Chi phí ốp lát gạch 100m2 hết bao nhiêu?",
    "Tôi muốn biết về kỹ thuật đóng cọc",
    "Quy trình nghiệm thu công trình như thế nào?",
    "Nên dùng cửa nhôm hay cửa gỗ?",
    "Tôi cần tính diện tích xây dựng cho thửa đất 100m2",
    "Giá sắt thép phi 10 hiện nay bao nhiêu?",
    "Làm sao để kiểm tra chất lượng bê tông?",
    "Tôi muốn biết về hệ thống thoát nước mưa",
    "Chi phí làm hệ thống điện nước cho nhà mới",
    "Quy trình xin giấy phép xây dựng như thế nào?",
    "Nên dùng tấm lợp nào cho mái nhà?",
    "Tôi cần tư vấn về thiết kế phòng tắm",
    "Khoảng cách an toàn giữa nhà và ranh giới?",
    "Giá cát vàng và cát trắng khác nhau như thế nào?",
    "Làm thế nào để chống mối cho nhà gỗ?",
    "Tôi muốn biết về quy chuẩn xây dựng Việt Nam",
    "Chi phí làm hàng rào bê tông 50m",
    "Quy trình thi công sàn gỗ công nghiệp",
    "Nên chọn vật liệu nào để cách nhiệt mái?",
    "Tôi cần tính tải trọng cho dầm nhà",
    "Giá thuê cần cẩu xây dựng 1 tháng",
    "Làm sao để kiểm tra độ nghiêng của cột?",
    "Tôi muốn biết về hệ thống phòng cháy chữa cháy",
    "Chi phí hoàn thiện nội thất nhà 100m2",
    "Quy trình bảo dưỡng công trình sau xây dựng",
    "Nên dùng xi măng trắng hay xi măng xám?",
    "Tôi cần tư vấn về thiết kế ban công",
    "Khoảng cách tối thiểu giữa các tầng lầu?",
    "Giá thuê máy trộn bê tông 1 ngày",
    "Làm thế nào để tính khối lượng đất đào?",
    "Tôi muốn biết về kỹ thuật hàn thép",
    "Chi phí sửa chữa nhà cũ 70m2",
    "Quy trình kiểm định chất lượng công trình"
]

# Feedback types
feedback_types = ["helpful", "not_helpful", "incorrect", "other"]

# Comments mẫu
comments = [
    "Thông tin rất hữu ích",
    "Cần thêm chi tiết hơn",
    "Không đúng với thực tế",
    "Cảm ơn bạn đã tư vấn",
    None,  # Some feedbacks have no comment
    "Rất chi tiết và dễ hiểu",
    "Cần cập nhật giá mới hơn",
    None,
    "Thiếu một số thông tin quan trọng",
    "Tôi đã áp dụng và thành công",
]

# Generate 50 feedbacks
print("Đang tạo 50 feedback records...")

for i in range(50):
    # Random user_id (1-5, giả sử có 5 users)
    user_id = random.randint(1, 5)
    
    # Random message
    message = random.choice(messages)
    
    # ai_response là "..."
    ai_response = "..."
    
    # Random feedback type
    feedback_type = random.choice(feedback_types)
    
    # Random comment (có thể null)
    comment = random.choice(comments)
    
    # Random created_at (trong 3 tháng gần đây)
    days_ago = random.randint(0, 90)
    created_at = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
    
    # Insert query
    query = """
    INSERT INTO feedbacks (user_id, message, ai_response, feedback_type, comment, created_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(query, (user_id, message, ai_response, feedback_type, comment, created_at))
    print(f"✓ Inserted feedback {i+1}/50")

connection.commit()
print(f"\n✅ Đã thêm 50 feedback records thành công!")

# Show total count
cursor.execute("SELECT COUNT(*) FROM feedbacks")
total = cursor.fetchone()[0]
print(f"📊 Tổng số feedback trong database: {total}")

cursor.close()
connection.close()
