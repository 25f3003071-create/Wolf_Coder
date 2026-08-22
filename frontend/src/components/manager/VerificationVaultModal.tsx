'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { authFetch } from '@/lib/auth/api-client';
import { Lock, ShieldCheck, ExternalLink, AlertTriangle, Eye } from 'lucide-react';

interface VerificationVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryId?: string;
  documentType?: string;
}

export const VerificationVaultModal: React.FC<VerificationVaultModalProps> = ({
  isOpen,
  onClose,
  beneficiaryId = 'BEN-72A91',
  documentType = 'Aadhaar & Hospital Estimate',
}) => {
  const [loading, setLoading] = useState(false);
  const [vaultData, setVaultData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestVaultAccess = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch('/api/manager/vault', { method: 'POST', body: JSON.stringify({ beneficiaryId, documentType }) });
      const data = await res.json();
      setLoading(false);
      if (data.error) setErrorMsg(data.error);
      else setVaultData(data.vaultAccess);
    } catch {
      setLoading(false);
      setErrorMsg('Failed to decrypt vault metadata');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restricted Verification Vault" subtitle={`Step-up security document inspection for ${beneficiaryId}`}>
      <div className="space-y-5 text-xs">
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">This action is audited and logged. Access to raw identity cards and medical estimates is strictly limited to authorized Managers for verification purposes.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between"><span className="text-slate-400 uppercase font-semibold">Beneficiary Reference</span><span className="text-emerald-400 font-mono font-bold">{beneficiaryId}</span></div>
          <div className="flex justify-between"><span className="text-slate-400 uppercase font-semibold">Classification</span><span className="text-slate-200 font-bold">{documentType}</span></div>
          <div className="flex justify-between"><span className="text-slate-400 uppercase font-semibold">Permission</span><Badge variant="success">MANAGER AUDITOR PERMITTED ✓</Badge></div>
        </div>

        {!vaultData && !errorMsg && (
          <div className="text-center py-2">
            <Button variant="primary" size="lg" isLoading={loading} icon={<Lock className="w-4 h-4" />} onClick={requestVaultAccess}>
              AUTHENTICATE & GENERATE SECURE VAULT SIGNED URL
            </Button>
          </div>
        )}

        {errorMsg && <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300">{errorMsg}</div>}

        {vaultData && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> SECURE SIGNED URL ACTIVE</span>
              <span className="text-[10px] text-slate-400 font-mono">Expires in: {vaultData.expires_in}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono"><span className="text-slate-400 text-[10px] block">Document Hash:</span><span className="text-slate-200 break-all">{vaultData.file_hash}</span></div>
            <div className="flex items-center justify-between pt-1 font-semibold">
              <span className="text-slate-400">Hospital: <strong className="text-slate-200">{vaultData.hospital_name}</strong></span>
              <a href={vaultData.signed_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all">
                <Eye className="w-3.5 h-3.5" /> View Encrypted File <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
