"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { documentApi, type DocumentResponse } from "@/lib/api-client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentResponse | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        return;
      }

      const data = await documentApi.list(token);
      setDocuments(data);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách tài liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        return;
      }

      // Determine document type from file extension
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      let docType: "pdf" | "docx" | "image" | "xlsx" | undefined;
      if (fileExtension === "pdf") docType = "pdf";
      else if (fileExtension === "docx" || fileExtension === "doc")
        docType = "docx";
      else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || ""))
        docType = "image";
      else if (fileExtension === "xlsx" || fileExtension === "xls")
        docType = "xlsx";

      await documentApi.upload(
        {
          name: selectedFile.name,
          type: docType,
          size: selectedFile.size,
        },
        token,
      );

      toast({
        title: "Upload thất bại",
        description:
          "Chức năng upload đang trong quá trình phát triển. Tài liệu đã được lưu với trạng thái lỗi.",
        variant: "destructive",
      });

      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể upload tài liệu",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Lỗi",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        return;
      }

      await documentApi.delete(docId, token);

      toast({
        title: "Thành công",
        description: "Đã xóa tài liệu",
      });

      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tài liệu",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusIcon = (status: DocumentResponse["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4 text-warning-foreground" />;
      case "processed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: DocumentResponse["status"]) => {
    switch (status) {
      case "processing":
        return (
          <Badge
            variant="secondary"
            className="bg-warning/10 text-warning-foreground"
          >
            Processing
          </Badge>
        );
      case "processed":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success">
            Processed
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRowExpansion = (docId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const getSeverityBadge = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>;
      case "medium":
        return (
          <Badge
            variant="secondary"
            className="bg-warning/10 text-warning-foreground"
          >
            Medium
          </Badge>
        );
      case "low":
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  // Summary stats
  const totalDocuments = documents.length;
  const processedDocuments = documents.filter(
    (d) => d.status === "processed",
  ).length;
  const processingDocuments = documents.filter(
    (d) => d.status === "processing",
  ).length;
  const errorDocuments = documents.filter((d) => d.status === "error").length;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tài Liệu Của Tôi</h1>
            <p className="text-muted-foreground">
              Xem và quản lý tài liệu đã upload
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Tài Liệu
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDocuments}</p>
                <p className="text-sm text-muted-foreground">Tổng Số</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedDocuments}</p>
                <p className="text-sm text-muted-foreground">Đã Xử Lý</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processingDocuments}</p>
                <p className="text-sm text-muted-foreground">Đang Xử Lý</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorDocuments}</p>
                <p className="text-sm text-muted-foreground">Lỗi</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tài liệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {documents.length === 0
                    ? "Upload your first document to get started"
                    : "No documents match your search criteria"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="group">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRowExpansion(doc.id)}
                        >
                          {expandedRows.has(doc.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type || "unknown"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          {getStatusBadge(doc.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(doc.size)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem Chi Tiết
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Tài Liệu</DialogTitle>
              <DialogDescription>
                Chọn file để upload (Hiện tại đang test, file sẽ được lưu với
                trạng thái lỗi)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Chọn File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    File: {selectedFile.name} (
                    {formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsUploadDialogOpen(false);
                  setSelectedFile(null);
                }}
                disabled={isUploading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Details Dialog */}
        <Dialog
          open={!!selectedDocument}
          onOpenChange={() => setSelectedDocument(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedDocument?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedDocument && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loại File</Label>
                    <p className="text-sm">
                      {selectedDocument.type || "Unknown"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Kích Thước</Label>
                    <p className="text-sm">
                      {formatFileSize(selectedDocument.size)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Trạng Thái</Label>
                    <div>{getStatusBadge(selectedDocument.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày Upload</Label>
                    <p className="text-sm">
                      {formatDate(selectedDocument.uploaded_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  );
}
