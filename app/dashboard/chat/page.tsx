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
  default: `I can help you with questions about Vietnamese construction standards and regulations. Here are some topics I can assist with:

**Standards & Codes:**
- TCVN (Vietnamese National Standards)
- QCVN (National Technical Regulations)
- Building codes and compliance requirements

**Common Topics:**
- Structural design requirements
- Fire safety regulations
- Material specifications
- Building permit processes

What would you like to know about?`,
  fire: `According to **QCVN 06:2022** - National Technical Regulation on Fire Safety for Buildings and Structures:

**Key Requirements:**
- Buildings must have fire escape routes with minimum width of 1.2m
- Fire-resistant doors must meet EI 60 standard minimum
- Smoke detectors required in all rooms larger than 50m2
- Fire extinguishers must be placed every 20m in corridors

**For High-rise Buildings (>28m):**
- REI 120 for structural elements
- Automatic sprinkler systems required
- Emergency lighting with 2-hour backup

Would you like more details on any specific requirement?`,
  concrete: `According to **TCVN 5574:2018** - Concrete and Reinforced Concrete Structures:

**Concrete Strength Classes:**
- B15 (M200): Light structures, non-load bearing
- B20 (M250): Residential foundations
- B25 (M300): Standard structural use
- B30 (M400): High-rise buildings, bridges

**Key Requirements:**
- Minimum cover depth: 25-50mm (depending on exposure)
- Water-cement ratio: max 0.55 for durability
- Slump: 50-150mm for different applications

**Quality Control:**
- Cube test specimens required every 50m3
- 28-day strength verification mandatory

Do you need information about specific applications?`,
  foundation: `According to **TCVN 9362:2012** - Foundation Design Standards:

**Soil Investigation Requirements:**
- Minimum 2 boreholes per 300m2
- Depth: at least 2x foundation width below base
- SPT tests every 1.5m depth

**Foundation Types:**
- Strip foundations: for walls and light structures
- Pad foundations: for columns (min 300mm thick)
- Raft foundations: for poor soil conditions
- Pile foundations: when bearing capacity < 100 kPa

**Safety Factors:**
- Dead load: 1.35
- Live load: 1.5
- Seismic: per TCVN 9386:2012

Any specific foundation design questions?`,
  permit: `**Building Permit Process in Vietnam:**

**Required Documents:**
1. Application form (Mau don xin phep xay dung)
2. Land use right certificate
3. Architectural drawings (scale 1:100 or 1:200)
4. Structural calculations
5. Fire safety approval (for buildings >5 floors)
6. Environmental impact assessment (if required)

**Processing Time:**
- Individual houses: 15 working days
- Commercial buildings: 30 working days
- Industrial projects: 45 working days

**Common Rejection Reasons:**
- Incomplete documentation
- Violation of zoning regulations
- Insufficient setback distances

Need help with any specific permit requirement?`,
};

const suggestedQuestions = [
  {
    icon: Building,
    text: "What are the foundation requirements?",
  },
  {
    icon: Scale,
    text: "Fire safety regulations for buildings",
  },
  {
    icon: FileText,
    text: "Building permit process in Vietnam",
  },
  {
    icon: MessageSquare,
    text: "Concrete strength requirements",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Chào mừng đến với **ConstructionIQ**! Tôi là trợ lý AI chuyên về tuân thủ xây dựng của bạn.

I can answer questions about:
- Vietnamese construction standards (TCVN)
- Building regulations (QCVN)
- Permit requirements
- Material specifications
- Safety compliance

Ask me anything about construction compliance in Vietnam!`,
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
          <h2 className="font-semibold">Construction Brain</h2>
          <p className="text-xs text-muted-foreground">
            AI-powered construction compliance assistant
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
            placeholder="Ask about construction standards..."
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
