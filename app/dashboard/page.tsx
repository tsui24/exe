"use client";

import React from "react";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useDocuments,
  type Document,
  type AnalysisResult,
} from "@/lib/document-context";
import { useAuth } from "@/lib/auth-context";
import { ChatOnly } from "@/components/dashboard/chat-only";
import { documentApi, chatApi } from "@/lib/api-client";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    title?: string;
    content?: string;
    metadata?: Record<string, any>;
  }>;
}

// Mock analysis results generator
function generateMockAnalysis(): AnalysisResult {
  return {
    complianceScore: Math.floor(Math.random() * 30) + 70,
    itemsPassed: Math.floor(Math.random() * 10) + 8,
    itemsFlagged: Math.floor(Math.random() * 5) + 1,
    pendingReview: Math.floor(Math.random() * 4) + 2,
    standardsChecked: Math.floor(Math.random() * 6) + 5,
    risks: [
      {
        id: "1",
        severity: "high",
        title: "Fire Safety Non-Compliance",
        description:
          "Detected potential issues in fire safety requirements per QCVN 06:2022",
        standards: ["QCVN 06:2022", "Nghị định 136/2020"],
      },
      {
        id: "2",
        severity: "medium",
        title: "Structural Documentation Gap",
        description: "Missing load calculation details for foundation design",
        standards: ["TCVN 5574:2018"],
      },
    ],
    complianceItems: [
      {
        parameter: "Concrete Strength",
        standard: "≥ 30 MPa",
        actual: "32 MPa",
        status: "pass",
      },
      {
        parameter: "Fire Rating",
        standard: "REI 120",
        actual: "REI 90",
        status: "fail",
      },
      {
        parameter: "Cover Depth",
        standard: "≥ 40 mm",
        actual: "45 mm",
        status: "pass",
      },
      {
        parameter: "Rebar Spacing",
        standard: "≤ 200 mm",
        actual: "180 mm",
        status: "pass",
      },
    ],
  };
}

// Mock AI responses
const mockResponses: Record<string, string> = {
  default: `Based on my analysis of the uploaded document, I can provide insights on the construction compliance aspects. The document has been processed and analyzed against Vietnamese construction standards (TCVN) and regulations (QCVN).

**Key Findings:**
- The document contains structural specifications that need verification against TCVN 5574:2018
- Fire safety requirements should be cross-referenced with QCVN 06:2022
- Material specifications appear to comply with standard requirements

Would you like me to elaborate on any specific aspect?`,
  fire: `According to **QCVN 06:2022** - National Technical Regulation on Fire Safety for Buildings and Structures, the fire rating requirements are as follows:

For high-rise buildings (over 28 meters):
- **Structural elements**: REI 120 minimum
- **Load-bearing walls**: REI 90 minimum
- **Fire barriers**: EI 60 minimum

The document shows a fire rating of **REI 90**, which does **not meet** the REI 120 requirement for high-rise structures.

**Recommendation:** Review the fire protection design and consider additional fire-resistant coatings or structural modifications.`,
  concrete: `According to **TCVN 5574:2018** - Concrete and Reinforced Concrete Structures Design Standard:

The concrete specifications in your document show:
- **Compressive strength**: 32 MPa (Grade B25)
- **Water-cement ratio**: 0.45
- **Slump**: 120 mm

This **complies** with the minimum requirements for structural concrete in foundation work, which specifies ≥ 30 MPa.

The mix design appears suitable for the intended application.`,
};

export default function DashboardUploadPage() {
  const { user } = useAuth();

  // Show chat-only interface for normal users
  if (user?.plan !== "pro") {
    return <ChatOnly />;
  }

  return <ProDashboard />;
}

function ProDashboard() {
  const [dragActive, setDragActive] = useState(false);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { documents, addDocument, updateDocument } = useDocuments();
  const { user } = useAuth();

  // Filter only ready documents for this session
  const readyDocuments = documents.filter((d) => d.status === "ready");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const simulateProcessing = useCallback(
    (docId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          const analysis = generateMockAnalysis();
          updateDocument(docId, {
            status: "ready",
            progress: 100,
            analysisResults: analysis,
          });
        } else {
          updateDocument(docId, {
            progress: Math.min(progress, 99),
            status: "processing",
          });
        }
      }, 500);
    },
    [updateDocument],
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      // Add documents to UI immediately
      const docIds = fileArray.map((file) =>
        addDocument({
          name: file.name,
          type: file.type || "application/pdf",
          size: file.size,
          status: "uploading",
          progress: 0,
          uploadedBy: user?.username || "unknown",
          pages: Math.floor(Math.random() * 50) + 5,
        }),
      );

      try {
        // Upload files to backend
        const response = await documentApi.upload({
          files: fileArray,
          user_id: user?.id.toString() || "1",
          max_workers: fileArray.length > 1 ? 4 : undefined,
        });

        // Store conversation ID for chat
        setCurrentConversationId(response.conversation_id);

        // Update documents based on upload results
        response.results.forEach((result, index) => {
          if (result.status === "success") {
            // Generate mock analysis for successful uploads
            const analysis = generateMockAnalysis();
            updateDocument(docIds[index], {
              status: "ready",
              progress: 100,
              analysisResults: analysis,
            });
          } else {
            updateDocument(docIds[index], {
              status: "error",
              progress: 0,
            });
          }
        });

        // Auto-select first successful document
        if (response.results[0]?.status === "success") {
          const firstDoc = documents.find((d) => d.id === docIds[0]);
          if (firstDoc) {
            setTimeout(() => selectDocument(firstDoc), 500);
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Mark all as error
        docIds.forEach((docId) => {
          updateDocument(docId, {
            status: "error",
            progress: 0,
          });
        });
      }
    },
    [addDocument, updateDocument, user, documents],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles],
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    try {
      // Call real chat API
      const response = await chatApi.sendMessage({
        message: messageContent,
        conversation_id: currentConversationId || undefined,
        chat_history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Priority: sources > message
      let displayContent = response.message;

      if (response.sources && response.sources.length > 0) {
        // Deduplicate sources based on content only (ignore section_title variations)
        const uniqueSources = response.sources.reduce((acc, src) => {
          const contentKey = (src.content || "").trim();
          if (contentKey && !acc.has(contentKey)) {
            acc.set(contentKey, src);
          }
          return acc;
        }, new Map());

        const deduplicatedSources = Array.from(uniqueSources.values());

        // If we have unique sources, format them nicely
        if (deduplicatedSources.length > 0) {
          displayContent = deduplicatedSources
            .map((src, idx) => {
              let srcText = `**📚 Nguồn ${idx + 1}**`;

              // Add filename if available
              const filename = (src as any).filename;
              const sectionTitle = (src as any).section_title;

              if (filename || sectionTitle) {
                srcText += " - ";
                if (filename) srcText += `_${filename}_`;
                if (sectionTitle) srcText += ` (${sectionTitle})`;
              } else if (src.title) {
                srcText += ` - ${src.title}`;
              }

              srcText += "\n\n";
              if (src.content) srcText += src.content;

              return srcText;
            })
            .join("\n\n---\n\n");
        }
      }

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: displayContent,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content:
          "Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, currentConversationId, messages]);

  const selectDocument = (doc: Document) => {
    setActiveDocument(doc);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Document **"${doc.name}"** has been analyzed and is ready for questions. 

**Analysis Summary:**
- Compliance Score: ${doc.analysisResults?.complianceScore}%
- Items Passed: ${doc.analysisResults?.itemsPassed}
- Items Flagged: ${doc.analysisResults?.itemsFlagged}
- Standards Checked: ${doc.analysisResults?.standardsChecked}

What would you like to know about this document?`,
      },
    ]);
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning-foreground" />;
      case "ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Uploading
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="secondary"
            className="bg-warning/10 text-warning-foreground"
          >
            Processing
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success">
            Ready
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6">
      {/* Left Panel - Upload & Documents */}
      <div className="flex w-80 flex-col gap-4">
        {/* Upload Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.dwg,.xlsx"
                className="hidden"
                onChange={handleFileInput}
              />
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC, DOCX, DWG, XLSX
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[calc(100%-4rem)] overflow-y-auto">
            {documents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No documents uploaded yet
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      activeDocument?.id === doc.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    } ${doc.status !== "ready" ? "opacity-70" : ""}`}
                    onClick={() =>
                      doc.status === "ready" && selectDocument(doc)
                    }
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.pages} pages
                      </p>
                      {(doc.status === "uploading" ||
                        doc.status === "processing") && (
                        <Progress value={doc.progress} className="mt-2 h-1.5" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusIcon(doc.status)}
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - AI Chat */}
      <Card className="flex flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Construction Brain</h2>
            <p className="text-xs text-muted-foreground">
              {activeDocument
                ? `Analyzing: ${activeDocument.name}`
                : "Select a document to start asking questions"}
            </p>
          </div>
          {activeDocument && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setActiveDocument(null);
                setMessages([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {!activeDocument ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Document Selected</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {readyDocuments.length > 0
                ? "Select a processed document from the list to start asking questions about it."
                : "Upload a document and wait for it to be processed, then you can ask questions about it."}
            </p>
          </div>
        ) : (
          <>
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
                        className="text-sm leading-relaxed whitespace-pre-wrap"
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
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about this document..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Phân tích AI bởi ConstructionIQ
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
