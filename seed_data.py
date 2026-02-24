from backend_ai.database import SessionLocal
from backend_ai.models import User, Feedback
from backend_ai.auth import get_password_hash
from datetime import datetime, timedelta
import random

db = SessionLocal()

# Tạo users với tên Việt Nam thông dụng
users_data = [
    ("nguyenvana", "Nguyễn Văn A"),
    ("tranthib", "Trần Thị B"),
    ("levanc", "Lê Văn C"),
    ("phamthid", "Phạm Thị D"),
    ("hoangvane", "Hoàng Văn E"),
    ("vuthif", "Vũ Thị F"),
    ("dangvang", "Đặng Văn G"),
    ("dothih", "Đỗ Thị H"),
]

print("Creating users...")
created_users = []
for username, full_name in users_data:
    existing = db.query(User).filter(User.username == username).first()
    if not existing:
        user = User(
            username=username,
            full_name=full_name,
            hashed_password=get_password_hash("123456"),
            is_active=True,
            is_admin=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        created_users.append(user)
        print(f"Created user: {username}")
    else:
        created_users.append(existing)
        print(f"User exists: {username}")

# Lấy tất cả users để random
all_users = db.query(User).all()

# Câu hỏi và phản hồi về xây dựng (LIKE)
like_feedbacks = [
    ("Quy định về móng nhà cao tầng là gì?", "Theo TCVN 9362:2012, móng nhà cao tầng cần được thiết kế với hệ số an toàn tối thiểu 1.5 và phải có khảo sát địa chất chi tiết."),
    ("Cường độ bê tông M300 tương đương bao nhiêu MPa?", "Bê tông M300 tương đương khoảng 30 MPa (B25 theo tiêu chuẩn hiện tại)."),
    ("Tiêu chuẩn phòng cháy chữa cháy cho nhà dân dụng?", "Theo QCVN 06:2022, nhà dân dụng cần có lối thoát hiểm tối thiểu 1.2m và bình chữa cháy cách nhau không quá 20m."),
    ("Khoảng cách giữa các cọc móng là bao nhiêu?", "Khoảng cách tối thiểu giữa các cọc móng là 2.5D đến 3D (D là đường kính cọc) theo TCVN 10304:2014."),
    ("Độ dày tối thiểu của sàn bê tông cốt thép?", "Độ dày tối thiểu của sàn bê tông cốt thép là 60mm cho nhà dân dụng và 80mm cho công trình công nghiệp."),
    ("Yêu cầu về độ ẩm của gỗ xây dựng?", "Độ ẩm gỗ xây dựng không được vượt quá 15% theo TCVN 7754:2007 để tránh cong vênh và nứt nẻ."),
    ("Thời gian bảo dưỡng bê tông tối thiểu?", "Bê tông cần được bảo dưỡng ẩm tối thiểu 7 ngày ở nhiệt độ trên 15°C theo TCVN 4453:1995."),
    ("Quy định về chiều cao lan can cầu thang?", "Lan can cầu thang phải có chiều cao tối thiểu 0.9m đến 1.1m theo QCXDVN 01:2021."),
    ("Độ nghiêng tối đa của mái nhà dân dụng?", "Độ nghiêng mái tối đa phụ thuộc vật liệu: ngói 35-40°, tôn 15-25°, bê tông nhẹ 5-15° theo TCVN 2737:1995."),
    ("Yêu cầu về hệ thống thoát nước mưa?", "Đường ống thoát nước mưa phải có độ dốc tối thiểu 0.5-1% và đường kính tối thiểu DN100 theo TCVN 7957:2008."),
    ("Tiêu chuẩn gạch xây không nung?", "Gạch không nung phải đạt cường độ chịu nén tối thiểu 3.5 MPa và hút nước dưới 20% theo TCVN 6477:2016."),
    ("Khoảng cách giữa các cột nhà khung bê tông?", "Khoảng cách cột thường từ 4-8m tùy tải trọng, phổ biến nhất là 6m cho nhà dân dụng."),
    ("Độ dày lớp bảo vệ cốt thép là bao nhiêu?", "Lớp bảo vệ tối thiểu: 20mm cho dầm/cột, 15mm cho sàn, 50mm cho móng theo TCVN 5574:2018."),
    ("Yêu cầu về thông gió tự nhiên nhà ở?", "Diện tích cửa thông gió phải đạt tối thiểu 5-8% diện tích sàn theo QCXDVN 01:2021."),
    ("Quy định về kích thước gạch ốp lát tiêu chuẩn?", "Kích thước phổ biến: 30x30cm, 40x40cm, 60x60cm với độ dày 8-12mm theo TCVN 6355:2009."),
    ("Thời gian đạt cường độ thiết kế của bê tông?", "Bê tông thường đạt 100% cường độ thiết kế sau 28 ngày bảo dưỡng chuẩn."),
    ("Độ dốc tối thiểu của mái tôn?", "Mái tôn cần độ dốc tối thiểu 10-15% (5-8°) để thoát nước hiệu quả."),
    ("Quy định về chiều cao tầng trệt nhà phố?", "Chiều cao tầng trệt thường 3.0-3.6m, tầng lửng 2.4-2.7m, tầng 2 trở lên 2.7-3.0m."),
    ("Tiêu chuẩn cát xây dựng?", "Cát xây dựng cần có mô đun độ lớn 2.0-2.5, hàm lượng bùn sét < 3% theo TCVN 7570:2006."),
    ("Khoảng cách tối đa giữa các mối nối cốt thép?", "Mối nối cốt thép cần lệch nhau tối thiểu 1.3 lần chiều dài neo và không quá 50% tại cùng mặt cắt."),
    ("Độ bền chịu nước của xi măng?", "Xi măng phải đạt độ bền chịu nén tối thiểu 32.5 MPa ở 28 ngày theo TCVN 6260:2009."),
    ("Yêu cầu về ánh sáng tự nhiên phòng học?", "Diện tích cửa sổ phòng học phải đạt tối thiểu 20% diện tích sàn theo TCVN 4051:2008."),
    ("Quy định về độ cao tường rào?", "Tường rào phía trước không quá 1.8m, phía sau không quá 2.2m theo quy định địa phương."),
    ("Kích thước chuẩn cửa đi 1 cánh?", "Cửa đi 1 cánh thường 0.8-1.0m x 2.0-2.2m (rộng x cao)."),
    ("Độ dày tối thiểu của vữa trát tường?", "Vữa trát tường có độ dày 1.5-2.0cm cho trát thường, 2.5-3.0cm cho trát chống thấm."),
    ("Yêu cầu về hệ số cách nhiệt mái nhà?", "Hệ số truyền nhiệt mái nhà ≤ 1.0 W/m²K vùng nóng, ≤ 1.2 W/m²K vùng ôn hòa theo QCVN 09:2017."),
    ("Quy định về tải trọng sàn nhà ở?", "Tải trọng sàn nhà ở thường 200 kg/m² (2.0 kN/m²) theo TCVN 2737:1995."),
    ("Độ sâu chôn móng tối thiểu?", "Độ sâu chôn móng tối thiểu 0.8m cho móng băng nhà 1-2 tầng trên nền đất tốt."),
    ("Tiêu chuẩn thép xây dựng phổ biến?", "Thép xây dựng thường dùng: CB240T (φ≤10), CB300T (φ10-40), CB400V, CB500V theo TCVN 1651:2018."),
    ("Khoảng cách tối đa giữa các cọc tre chống đỡ?", "Cọc tre chống đỡ dầm/sàn cách nhau tối đa 1.2-1.5m tùy kích thước cấu kiện."),
]

# Câu hỏi và phản hồi DISLIKE với comment
dislike_feedbacks = [
    ("Giá xây nhà bao nhiêu tiền 1m2?", "Chi phí xây nhà khoảng 3-5 triệu/m2 tùy vật liệu.", "Thiếu chi tiết, không nói rõ vật liệu gì, khu vực nào, không đầy đủ thông tin"),
    ("Làm sao xin giấy phép xây dựng?", "Bạn cần nộp hồ sơ lên UBND xã/phường để xin giấy phép.", "Quá chung chung, không liệt kê hồ sơ cần thiết, thời gian xử lý"),
    ("Nên dùng bê tông nào cho móng?", "Dùng bê tông M200 là được.", "Không giải thích tại sao, không xét điều kiện địa chất, tải trọng công trình"),
    ("Tường gạch dày bao nhiêu?", "Tường gạch thường dày 10cm hoặc 20cm.", "Thiếu ngữ cảnh, không nói rõ loại tường (tường chịu lực hay ngăn), tiêu chuẩn"),
    ("Cần bao nhiêu xi măng xây 1m2 tường?", "Khoảng 20kg xi măng cho 1m2 tường.", "Sai công thức, không tính theo độ dày vữa và kích thước gạch chuẩn"),
    ("Khoảng cách cột nhà 2 tầng?", "Cột cách nhau 5m là được.", "Thiếu cơ sở tính toán, không xét loại móng, độ cứng dầm, tải trọng"),
    ("Mái tôn dùng loại nào tốt?", "Dùng tôn lạnh là được.", "Không so sánh các loại, không nói về độ dày, lớp phủ, tuổi thọ"),
    ("Có cần xin phép sửa nhà không?", "Sửa nhỏ thì không cần.", "Không rõ 'sửa nhỏ' là gì, cần trích dẫn quy định pháp luật cụ thể"),
]

print("\nCreating feedbacks...")
base_date = datetime.now() - timedelta(days=30)

# Thêm LIKE feedbacks
for idx, (msg, response) in enumerate(like_feedbacks):
    user = random.choice(all_users)
    feedback = Feedback(
        user_id=user.id,
        message=msg,
        ai_response=response[:200] if len(response) > 200 else response,  # Giới hạn 200 ký tự
        feedback_type="like",
        comment=None,
        created_at=base_date + timedelta(days=idx, hours=random.randint(0, 23))
    )
    db.add(feedback)
    print(f"Added LIKE feedback {idx+1}: {msg[:50]}...")

# Thêm DISLIKE feedbacks
for idx, (msg, response, comment) in enumerate(dislike_feedbacks):
    user = random.choice(all_users)
    feedback = Feedback(
        user_id=user.id,
        message=msg,
        ai_response=response[:200] if len(response) > 200 else response,
        feedback_type="dislike",
        comment=comment,
        created_at=base_date + timedelta(days=idx*2, hours=random.randint(0, 23))
    )
    db.add(feedback)
    print(f"Added DISLIKE feedback {idx+1}: {msg[:50]}...")

db.commit()
print(f"\n✅ Created {len(users_data)} users and {len(like_feedbacks) + len(dislike_feedbacks)} feedbacks!")

# ===== THÊM 50 FEEDBACKS VỚI AI_RESPONSE LÀ "..." =====
print("\n🔥 Adding 50 additional feedbacks with '...' response...")

additional_messages = [
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

feedback_types = ["like", "dislike"]  # Chỉ có 2 giá trị: like hoặc dislike
comments_list = [
    "Thông tin rất hữu ích",
    "Cần thêm chi tiết hơn",
    "Không đúng với thực tế",
    "Cảm ơn bạn đã tư vấn",
    None,
    "Rất chi tiết và dễ hiểu",
    "Cần cập nhật giá mới hơn",
    None,
    "Thiếu một số thông tin quan trọng",
    "Tôi đã áp dụng và thành công",
]

additional_base_date = datetime.now() - timedelta(days=90)

for idx, message in enumerate(additional_messages):
    user = random.choice(all_users)
    feedback_type = random.choice(feedback_types)
    comment = random.choice(comments_list)
    
    feedback = Feedback(
        user_id=user.id,
        message=message,
        ai_response="...",  # AI response là "..."
        feedback_type=feedback_type,
        comment=comment,
        created_at=additional_base_date + timedelta(days=idx, hours=random.randint(0, 23), minutes=random.randint(0, 59))
    )
    db.add(feedback)
    print(f"Added additional feedback {idx+1}/50: {message[:50]}...")

db.commit()
print(f"\n✅ Added 50 additional feedbacks with '...' response!")
print(f"📊 Total feedbacks in database: {len(like_feedbacks) + len(dislike_feedbacks) + 50}")

db.close()
