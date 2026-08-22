'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerificationVaultModal } from '@/components/manager/VerificationVaultModal';
import { Lock, Eye, AlertTriangle } from 'lucide-react';

export default function VerificationVaultPage() {
  const [selectedBen, setSelectedBen] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const beneficiaries = [
    { id: 'BEN-72A91', category: 'MEDICAL', hospital: 'XYZ Super Specialty Hospital', estimated_cost: 78500, ngo: 'Red Cross Relief India', status: 'VERIFIED', documents: ['Aadhaar Identity (Encrypted)', 'XYZ Hospital Estimate (Encrypted)'] },
    { id: 'BEN-48B12', category: 'DISABILITY', hospital: 'City Rehabilitation Center', estimated_cost: 45000, ngo: 'Red Cross Relief India', status: 'VERIFIED', documents: ['Disability Certificate (Encrypted)'] },
    { id: 'BEN-99C03', category: 'DISASTER', hospital: 'District Disaster Unit', estimated_cost: 25000, ngo: 'Care Foundation', status: 'UNDER_REVIEW', documents: ['Disaster Ration Assessment (Encrypted)'] },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-xs">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-purple-500/30 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Lock className="w-7 h-7" /></div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Restricted Verification Vault</h1>
          <p className="text-slate-300 mt-0.5">High-security vault for inspecting raw beneficiary identity &amp; hospital documents</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-200 uppercase">Donor Privacy Enforcement Notice</p>
          <p className="text-amber-300/80 text-[11px] leading-relaxed mt-1">Donors only see anonymized status badges (e.g. <code>BEN-72A91 — VERIFIED ✓</code>). Raw Aadhaar cards, medical certificates, and phone numbers are isolated inside this Vault.</p>
        </div>
      </div>

      <Card title="Vault Document Inspection" subtitle="Click 'VIEW VERIFICATION DETAILS' to generate a short-lived signed URL for document inspection">
        <div className="space-y-3">
          {beneficiaries.map((ben) => (
            <div key={ben.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-mono font-bold text-emerald-400"><span>{ben.id}</span><Badge variant={ben.status === 'VERIFIED' ? 'success' : 'warning'}>{ben.status} ✓</Badge></div>
                <p className="font-semibold text-slate-200 mt-1">{ben.hospital}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">NGO: {ben.ngo} • Estimated Cost: ₹{ben.estimated_cost.toLocaleString()}</p>
              </div>
              <Button variant="primary" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => { setSelectedBen(ben.id); setIsModalOpen(true); }}>
                VIEW VERIFICATION DETAILS
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {selectedBen && <VerificationVaultModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} beneficiaryId={selectedBen} />}
    </div>
  );
}
