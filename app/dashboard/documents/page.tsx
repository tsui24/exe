"use client";

import { useState } from "react";
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
} from "@/components/ui/dialog";
import { useDocuments, type Document } from "@/lib/document-context";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default function DocumentsPage() {
  const { documents, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "uploading":
        return <Clock className="h-4 w-4 animate-pulse text-primary" />;
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

  const toggleRowExpansion = (docId: string) => {
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
  const readyDocuments = documents.filter((d) => d.status === "ready").length;
  const processingDocuments = documents.filter(
    (d) => d.status === "processing" || d.status === "uploading"
  ).length;
  const totalFlagged = documents.reduce(
    (acc, doc) => acc + (doc.analysisResults?.itemsFlagged || 0),
    0
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">All Documents</h1>
          <p className="text-muted-foreground">
            View and manage all uploaded documents and their analysis results
          </p>
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
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readyDocuments}</p>
                <p className="text-sm text-muted-foreground">Analyzed</p>
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
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFlagged}</p>
                <p className="text-sm text-muted-foreground">Issues Flagged</p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <>
                      <TableRow key={doc.id} className="group">
                        <TableCell>
                          {doc.status === "ready" && (
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
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.pages} pages
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
                          {doc.analysisResults ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {doc.analysisResults.complianceScore}%
                              </span>
                              {doc.analysisResults.itemsFlagged > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-destructive/10 text-destructive"
                                >
                                  {doc.analysisResults.itemsFlagged} issues
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(doc.uploadedAt)}
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
                                disabled={doc.status !== "ready"}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(doc.id) && doc.analysisResults && (
                        <TableRow key={`${doc.id}-expanded`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Compliance Summary */}
                              <div>
                                <h4 className="mb-3 font-medium">
                                  Compliance Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="rounded-lg bg-card p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Items Passed
                                    </p>
                                    <p className="text-lg font-bold text-success">
                                      {doc.analysisResults.itemsPassed}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-card p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Items Flagged
                                    </p>
                                    <p className="text-lg font-bold text-destructive">
                                      {doc.analysisResults.itemsFlagged}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-card p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Pending Review
                                    </p>
                                    <p className="text-lg font-bold text-warning-foreground">
                                      {doc.analysisResults.pendingReview}
                                    </p>
                                  </div>
                                  <div className="rounded-lg bg-card p-3">
                                    <p className="text-xs text-muted-foreground">
                                      Standards Checked
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                      {doc.analysisResults.standardsChecked}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Risks */}
                              <div>
                                <h4 className="mb-3 font-medium">
                                  Identified Risks
                                </h4>
                                <div className="space-y-2">
                                  {doc.analysisResults.risks.map((risk) => (
                                    <div
                                      key={risk.id}
                                      className="rounded-lg border bg-card p-3"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2">
                                          {risk.severity === "high" ? (
                                            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                                          ) : (
                                            <ShieldCheck className="mt-0.5 h-4 w-4 text-warning-foreground" />
                                          )}
                                          <div>
                                            <p className="text-sm font-medium">
                                              {risk.title}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                              {risk.description}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                              {risk.standards.map((std) => (
                                                <Badge
                                                  key={std}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {std}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        {getSeverityBadge(risk.severity)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Compliance Items Table */}
                            <div className="mt-4">
                              <h4 className="mb-3 font-medium">
                                Compliance Checklist
                              </h4>
                              <div className="overflow-hidden rounded-lg border bg-card">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Parameter</TableHead>
                                      <TableHead>Standard</TableHead>
                                      <TableHead>Actual</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {doc.analysisResults.complianceItems.map(
                                      (item, idx) => (
                                        <TableRow key={idx}>
                                          <TableCell className="font-medium">
                                            {item.parameter}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {item.standard}
                                          </TableCell>
                                          <TableCell className="font-mono text-xs">
                                            {item.actual}
                                          </TableCell>
                                          <TableCell>
                                            {item.status === "pass" ? (
                                              <CheckCircle className="h-4 w-4 text-success" />
                                            ) : item.status === "fail" ? (
                                              <AlertTriangle className="h-4 w-4 text-destructive" />
                                            ) : (
                                              <Clock className="h-4 w-4 text-warning-foreground" />
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
            {selectedDocument?.analysisResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-bold text-success">
                      {selectedDocument.analysisResults.complianceScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Compliance Score
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">
                      {selectedDocument.analysisResults.itemsPassed}
                    </p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-bold text-destructive">
                      {selectedDocument.analysisResults.itemsFlagged}
                    </p>
                    <p className="text-xs text-muted-foreground">Flagged</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-2xl font-bold">
                      {selectedDocument.analysisResults.standardsChecked}
                    </p>
                    <p className="text-xs text-muted-foreground">Standards</p>
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
