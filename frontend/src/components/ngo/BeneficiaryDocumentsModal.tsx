'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { authFetch } from '@/lib/auth/api-client';
import { FileText, Upload, Trash2, Download, Eye, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BeneficiaryDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryId: string | null;
  beneficiaryName: string;
}

export const BeneficiaryDocumentsModal: React.FC<BeneficiaryDocumentsModalProps> = ({
  isOpen,
  onClose,
  beneficiaryId,
  beneficiaryName,
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Document Upload Form State
  const [documentType, setDocumentType] = useState('Hospital Estimate');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDocuments = async () => {
    if (!beneficiaryId) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/beneficiaries/${beneficiaryId}/documents`);
      const data = await res.json();
      setIsLoading(false);
      if (res.ok && data.success) {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && beneficiaryId) {
      fetchDocuments();
    }
  }, [isOpen, beneficiaryId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate 10 MB limit (10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');
        setSelectedFile(null);
        return;
      }

      // Validate Allowed types: PDF, JPG, JPEG, PNG
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMsg('INVALID FILE TYPE: Allowed formats are PDF, JPG, JPEG, and PNG.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !beneficiaryId) {
      setErrorMsg('Please select a valid document file.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await authFetch(`/api/beneficiaries/${beneficiaryId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          filename: selectedFile.name,
          mimeType: selectedFile.type || 'application/pdf',
          fileSize: selectedFile.size,
          storagePath: `documents/${beneficiaryId.toLowerCase()}_${selectedFile.name}`,
        }),
      });

      const data = await res.json();
      setIsUploading(false);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      setSelectedFile(null);
      fetchDocuments();
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || 'Failed to upload document.');
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await authFetch(`/api/beneficiaries/${beneficiaryId}/documents/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supporting Documents" subtitle={`Manage uploaded verification files for ${beneficiaryName || beneficiaryId}`}>
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* UPLOAD FORM */}
        <form onSubmit={handleUpload} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">Upload New Document</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="ID Proof">ID Proof</option>
                <option value="Medical Document">Medical Document</option>
                <option value="Hospital Estimate">Hospital Estimate</option>
                <option value="Disaster Evidence">Disaster Evidence</option>
                <option value="Eligibility Document">Eligibility Document</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select File (PDF, JPG, PNG &lt; 10MB)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-950 file:text-emerald-400"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <p className="text-[11px] text-slate-400">Max size: 10 MB per file</p>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUploading}
              disabled={isUploading || !selectedFile}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Upload Document
            </Button>
          </div>
        </form>

        {/* DOCUMENTS LIST */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Uploaded Documents ({documents.length})</p>

          {isLoading ? (
            <p className="text-xs text-slate-400 py-4 text-center">Loading document repository...</p>
          ) : documents.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
              No documents uploaded yet for this beneficiary.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-100 truncate">{doc.filename}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Badge variant="neutral" className="text-[9px] px-1.5 py-0">{doc.document_type}</Badge>
                        <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                      title="View / Download"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
