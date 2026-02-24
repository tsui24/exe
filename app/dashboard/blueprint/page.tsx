"use client";

import { useState } from "react";
import { Upload, FileText, AlertCircle, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aiBackendApi } from "@/lib/api-client";
import ReactMarkdown from "react-markdown";

export default function BlueprintAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Check if user has Pro subscription (temporarily set to true for testing)
  const checkProAccess = () => {
    // TODO: Implement real Pro check from backend
    return true; // Temporary: allow all users to test

    /* Real implementation when subscription field is added:
    const user = localStorage.getItem("user");
    if (!user) return false;
    
    try {
      const userData = JSON.parse(user);
      return userData.subscription === "pro";
    } catch {
      return false;
    }
    */
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file ảnh (JPG, PNG, ...)");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("Kích thước file không được vượt quá 50MB");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn bản vẽ để phân tích");
      return;
    }

    if (!query.trim()) {
      setError("Vui lòng nhập câu hỏi về bản vẽ");
      return;
    }

    if (!isPro) {
      setError(
        "Tính năng phân tích bản vẽ chuyên sâu chỉ dành cho gói Pro. Vui lòng nâng cấp tài khoản.",
      );
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysis("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      // Add detailed blueprint analysis instruction to query
      const detailedQuery = `[PHÂN TÍCH BẢN VẼ CHUYÊN SÂU - GÓI PRO]

${query}

Yêu cầu phân tích chi tiết:
1. Nhận diện loại bản vẽ và hệ thống kết cấu chính
2. Đọc kích thước, cao độ từ bản vẽ
3. Kiểm tra tuân thủ quy chuẩn TCVN, QCVN
4. Ước tính khối lượng vật liệu (bê tông, cốt thép)
5. Phát hiện sai sót hoặc xung đột thiết kế
6. Đề xuất tối ưu hóa

Trả lời theo format:
## 🏗️ THÔNG TIN BẢN VẼ
## 🔍 PHÂN TÍCH KẾT CẤU
## ⚠️ VẤN ĐỀ PHÁT HIỆN
## ✅ ĐÁNH GIÁ TUÂN THỦ
## 📊 DỰ TOÁN SƠ BỘ
## 💡 ĐỀ XUẤT TỐI ƯU`;

      formData.append("query", detailedQuery);

      const result = await aiBackendApi.chatWithImage(formData);
      setAnalysis(result.reply);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Đã xảy ra lỗi khi phân tích bản vẽ",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isPro = checkProAccess();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Phân Tích Bản Vẽ Chuyên Sâu</h1>
          <p className="text-muted-foreground">
            Công nghệ AI phân tích kết cấu, dự toán và tuân thủ quy chuẩn
          </p>
        </div>
        {isPro && <Crown className="w-6 h-6 text-yellow-500 ml-auto" />}
      </div>

      {!isPro && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <Crown className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Tính năng Pro:</strong> Phân tích bản vẽ chuyên sâu chỉ dành
            cho gói Pro.
            <a href="#" className="underline ml-1 font-semibold">
              Nâng cấp ngay
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tải Bản Vẽ</CardTitle>
          <CardDescription>
            Chọn bản vẽ mặt bằng, mặt đứng, mặt cắt hoặc chi tiết kết cấu (tối
            đa 50MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="blueprint-upload"
              disabled={!isPro}
            />
            <label htmlFor="blueprint-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Nhấn để chọn bản vẽ"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Hỗ trợ JPG, PNG (tối đa 50MB)
              </p>
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-contain border rounded-lg"
              />
            </div>
          )}

          <Textarea
            placeholder="Nhập câu hỏi về bản vẽ (VD: Phân tích kết cấu và tính toán khối lượng vật liệu)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            disabled={!isPro}
          />

          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || !query.trim() || isAnalyzing || !isPro}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Phân Tích Bản Vẽ
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Result Section */}
      <Card>
        <CardHeader>
          <CardTitle>Kết Quả Phân Tích</CardTitle>
          <CardDescription>
            Báo cáo chuyên sâu về kết cấu, quy chuẩn và dự toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analysis && !isAnalyzing && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Kết quả phân tích sẽ hiển thị ở đây</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">
                AI đang phân tích bản vẽ của bạn...
              </p>
            </div>
          )}

          {analysis && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card>
        <CardHeader>
          <CardTitle>Tính Năng Phân Tích Chuyên Sâu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Phân Tích Kết Cấu</h3>
                <p className="text-sm text-muted-foreground">
                  Nhận diện hệ thống móng, cột, dầm, sàn, mái
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Kiểm Tra Quy Chuẩn</h3>
                <p className="text-sm text-muted-foreground">
                  Đối chiếu với TCVN, QCVN liên quan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Dự Toán Vật Liệu</h3>
                <p className="text-sm text-muted-foreground">
                  Ước tính khối lượng bê tông, cốt thép
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Phát Hiện Vấn Đề</h3>
                <p className="text-sm text-muted-foreground">
                  Sai sót kích thước, xung đột hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tư Vấn Tối Ưu</h3>
                <p className="text-sm text-muted-foreground">
                  Đề xuất cải tiến thiết kế, tiết kiệm chi phí
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Công Thức LaTeX</h3>
                <p className="text-sm text-muted-foreground">
                  Hiển thị công thức tính toán chuyên nghiệp
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
