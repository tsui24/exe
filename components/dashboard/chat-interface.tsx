"use client";

import { useState } from "react";
import {
  Send,
  FileText,
  ExternalLink,
  Bot,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citation?: {
    title: string;
    code: string;
    section: string;
  };
  highlights?: { label: string; value: string }[];
}

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content:
      "Check the concrete slump requirements for high-rise foundations according to TCVN 4453.",
  },
  {
    id: "2",
    role: "assistant",
    content: `According to **TCVN 4453:1995** - Concrete and Reinforced Concrete Structures Construction Standard, the concrete slump requirements for high-rise foundations are as follows:

For **foundation concrete work** in high-rise buildings, the recommended slump values depend on the placement method:

- **Pump placement**: 100-150 mm
- **Crane and bucket**: 50-100 mm  
- **Chute placement**: 100-150 mm

The tolerance for slump testing is **±30 mm** from the specified value.

**Important note**: For foundations deeper than 2m, consider using self-compacting concrete (SCC) with slump flow of 550-750 mm per TCVN 12209:2018.`,
    citation: {
      title: "TCVN 4453:1995",
      code: "Concrete and Reinforced Concrete Structures",
      section: "Section 4.2.3 - Workability Requirements",
    },
    highlights: [
      { label: "Pump placement", value: "100-150 mm" },
      { label: "Crane/bucket", value: "50-100 mm" },
      { label: "Tolerance", value: "±30 mm" },
    ],
  },
];

export function ChatInterface() {
  const [messages] = useState<Message[]>(sampleMessages);
  const [inputValue, setInputValue] = useState("");

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">Construction Brain</h2>
          <p className="text-xs text-muted-foreground">
            AI-powered compliance assistant
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
              className={`max-w-[80%] space-y-3 ${message.role === "user" ? "text-right" : ""}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === "assistant" ? "prose prose-sm max-w-none" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\n/g, "<br />"),
                  }}
                />
              </div>

              {message.highlights && (
                <div className="flex flex-wrap gap-2">
                  {message.highlights.map((highlight) => (
                    <div
                      key={highlight.label}
                      className="rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        {highlight.label}
                      </p>
                      <p className="text-sm font-semibold text-success">
                        {highlight.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {message.citation && (
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="flex items-start gap-3 p-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          TCVN
                        </Badge>
                        <span className="text-sm font-medium">
                          {message.citation.title}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {message.citation.code}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {message.citation.section}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about construction standards, regulations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Được hỗ trợ bởi ConstructionIQ • Tham chiếu TCVN, QCVN và quy chuẩn
          construction laws
        </p>
      </div>
    </Card>
  );
}
