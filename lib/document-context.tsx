"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type DocumentStatus = "uploading" | "processing" | "ready" | "error";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  status: DocumentStatus;
  progress: number;
  uploadedAt: string;
  uploadedBy: string;
  pages?: number;
  analysisResults?: AnalysisResult;
}

export interface AnalysisResult {
  complianceScore: number;
  itemsPassed: number;
  itemsFlagged: number;
  pendingReview: number;
  standardsChecked: number;
  risks: Risk[];
  complianceItems: ComplianceItem[];
}

export interface Risk {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  standards: string[];
}

export interface ComplianceItem {
  parameter: string;
  standard: string;
  actual: string;
  status: "pass" | "fail" | "warning";
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (doc: Omit<Document, "id" | "uploadedAt">) => string;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vietbuild_documents");
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("vietbuild_documents", JSON.stringify(documents));
    }
  }, [documents]);

  const addDocument = (doc: Omit<Document, "id" | "uploadedAt">): string => {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDoc: Document = {
      ...doc,
      id,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    return id;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    localStorage.setItem(
      "vietbuild_documents",
      JSON.stringify(documents.filter((doc) => doc.id !== id))
    );
  };

  const getDocument = (id: string) => {
    return documents.find((doc) => doc.id === id);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        getDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
}
