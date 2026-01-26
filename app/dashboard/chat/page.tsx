"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  MessageSquare,
  Building,
  Scale,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Mock AI responses for general construction questions
const mockResponses: Record<string, string> = {
  default: `Tôi có thể giúp bạn trả lời các câu hỏi về tiêu chuẩn và quy định xây dựng Việt Nam. Dưới đây là các chủ đề tôi có thể hỗ trợ:

**Tiêu Chuẩn & Quy Chuẩn:**
- TCVN (Tiêu chuẩn Việt Nam)
- QCVN (Quy chuẩn kỹ thuật Quốc gia)
- Quy định về xây dựng và tuân thủ

**Các Chủ Đề Phổ Biến:**
- Yêu cầu thiết kế kết cấu
- Quy định phòng cháy chữa cháy
- Đặc tính vật liệu
- Quy trình cấp giấy phép xây dựng

Bạn muốn biết về vấn đề gì?`,
  fire: `Theo **QCVN 06:2022** - Quy chuẩn kỹ thuật Quốc gia về An toàn cháy cho Nhà và Công trình:

**Yêu Cầu Chính:**
- Công trình phải có lối thoát hiểm với chiều rộng tối thiểu 1,2m
- Cửa chống cháy phải đạt tiêu chuẩn tối thiểu EI 60
- Yêu cầu lắp đặt đầu báo khói ở các phòng có diện tích lớn hơn 50m2
- Bình chữa cháy phải được đặt cách nhau 20m trong hành lang

**Đối với Nhà Cao Tầng (>28m):**
- REI 120 cho các kết cấu chịu lực
- Yêu cầu hệ thống phun nước tự động
- Đèn chiếu sáng khẩn cấp với nguồn dự phòng 2 giờ

Bạn có muốn biết chi tiết về yêu cầu cụ thể nào không?`,
  concrete: `Theo **TCVN 5574:2018** - Kết cấu Bê tông và Bê tông Cốt thép:

**Cấp Độ Bền Bê Tông:**
- B15 (M200): Kết cấu nhẹ, không chịu lực
- B20 (M250): Móng công trình dân dụng
- B25 (M300): Sử dụng kết cấu tiêu chuẩn
- B30 (M400): Nhà cao tầng, cầu

**Yêu Cầu Chính:**
- Độ dày lớp bảo vệ tối thiểu: 25-50mm (tùy điều kiện môi trường)
- Tỷ lệ nước/xi măng: tối đa 0,55 để đảm bảo độ bền
- Độ sụt: 50-150mm cho các ứng dụng khác nhau

**Kiểm Soát Chất Lượng:**
- Yêu cầu mẫu thử khối lập phương mỗi 50m3
- Bắt buộc kiểm tra cường độ sau 28 ngày

Bạn có cần thông tin về ứng dụng cụ thể không?`,
  foundation: `Theo **TCVN 9362:2012** - Tiêu chuẩn Thiết kế Móng:

**Yêu Cầu Khảo Sát Địa Chất:**
- Tối thiểu 2 lỗ khoan mỗi 300m2
- Độ sâu: ít nhất 2 lần chiều rộng móng tính từ đáy móng
- Thí nghiệm SPT cứ mỗi 1,5m độ sâu

**Các Loại Móng:**
- Móng băng: cho tường và kết cấu nhẹ
- Móng đơn: cho cột (dày tối thiểu 300mm)
- Móng bè: cho điều kiện đất yếu
- Móng cọc: khi sức chịu tải < 100 kPa

**Hệ Số An Toàn:**
- Tải trọng tĩnh: 1.35
- Tải trọng động: 1.5
- Động đất: theo TCVN 9386:2012

Bạn có câu hỏi cụ thể nào về thiết kế móng không?`,
  permit: `**Quy Trình Cấp Giấy Phép Xây Dựng tại Việt Nam:**

**Hồ Sơ Yêu Cầu:**
1. Đơn xin phép xây dựng
2. Giấy chứng nhận quyền sử dụng đất
3. Bản vẽ kiến trúc (tỷ lệ 1:100 hoặc 1:200)
4. Tính toán kết cấu
5. Phê duyệt phòng cháy chữa cháy (công trình trên 5 tầng)
6. Đánh giá tác động môi trường (nếu yêu cầu)

**Thời Gian Xử Lý:**
- Nhà ở riêng lẻ: 15 ngày làm việc
- Công trình thương mại: 30 ngày làm việc
- Dự án công nghiệp: 45 ngày làm việc

**Lý Do Thường Bị Từ Chối:**
- Hồ sơ không đầy đủ
- Vi phạm quy hoạch
- Khoảng lùi không đủ

Bạn cần hỗ trợ về yêu cầu giấy phép cụ thể nào không?`,
};

const suggestedQuestions = [
  {
    icon: Building,
    text: "Yêu cầu về thiết kế móng là gì?",
  },
  {
    icon: Scale,
    text: "Quy định phòng cháy chữa cháy",
  },
  {
    icon: FileText,
    text: "Quy trình xin giấy phép xây dựng",
  },
  {
    icon: MessageSquare,
    text: "Yêu cầu cường độ bê tông",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Chào mừng đến với **ConstructionIQ**! Tôi là trợ lý AI chuyên về tuân thủ xây dựng của bạn.

Tôi có thể trả lời các câu hỏi về:
- Tiêu chuẩn xây dựng Việt Nam (TCVN)
- Quy chuẩn kỹ thuật (QCVN)
- Yêu cầu giấy phép
- Đặc tính vật liệu
- Tuân thủ an toàn

Hãy hỏi tôi bất kỳ điều gì về tuân thủ xây dựng tại Việt Nam!`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    (messageText?: string) => {
      const text = messageText || inputValue;
      if (!text.trim()) return;

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const lowerInput = text.toLowerCase();
        let response = mockResponses.default;

        if (
          lowerInput.includes("fire") ||
          lowerInput.includes("cháy") ||
          lowerInput.includes("safety")
        ) {
          response = mockResponses.fire;
        } else if (
          lowerInput.includes("concrete") ||
          lowerInput.includes("bê tông") ||
          lowerInput.includes("strength")
        ) {
          response = mockResponses.concrete;
        } else if (
          lowerInput.includes("foundation") ||
          lowerInput.includes("móng") ||
          lowerInput.includes("soil")
        ) {
          response = mockResponses.foundation;
        } else if (
          lowerInput.includes("permit") ||
          lowerInput.includes("giấy phép") ||
          lowerInput.includes("license")
        ) {
          response = mockResponses.permit;
        }

        const aiMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: response,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    },
    [inputValue],
  );

  return (
    <Card className="flex h-[calc(100vh-5rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">Trợ Lý AI Xây Dựng</h2>
          <p className="text-xs text-muted-foreground">
            Hỗ trợ tuân thủ quy chuẩn xây dựng thông minh
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}

            <div
              className={`max-w-[80%] ${message.role === "user" ? "text-right" : ""}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="rounded-2xl bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-border p-4">
        {messages.length === 1 && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.text)}
                className="flex items-center gap-2 rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted"
              >
                <q.icon className="h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-1">{q.text}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Hỏi về tiêu chuẩn xây dựng..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Phân tích AI bởi ConstructionIQ
        </p>
      </div>
    </Card>
  );
}
