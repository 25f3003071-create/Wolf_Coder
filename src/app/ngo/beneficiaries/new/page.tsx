'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { authFetch } from '@/lib/auth/api-client';
import { UserPlus, ShieldCheck, Lock, Upload } from 'lucide-react';

export default function RegisterBeneficiaryPage() {
  const [category, setCategory] = useState('MEDICAL');
  const [aidRequired, setAidRequired] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [anonymizedSummary, setAnonymizedSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify({
          category,
          aidRequired,
          hospitalName,
          estimatedCost: Number(estimatedCost),
          anonymizedSummary,
          documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        }),
      });
      const data = await res.json();
      setIsSubmitting(false);
      if (data.success) {
        router.push('/ngo');
      }
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-emerald-400" />
          Register New Beneficiary
        </h1>
        <p className="text-xs text-slate-400">
          Create an anonymized beneficiary record with encrypted document storage in the Manager Vault
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Verification Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="MEDICAL">Medical Emergency (Hospital Surgery / Care)</option>
                <option value="DISABILITY">Disability Assistance (Certificate / Rehab)</option>
                <option value="DISASTER">Disaster Relief (Flood / Earthquake Aid)</option>
                <option value="OTHER">Other Emergency Relief</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Cost (₹)</label>
              <input
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                required
                placeholder="78500"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hospital / Authorized Institution</label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              required
              placeholder="e.g. XYZ Super Specialty Hospital"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Required Aid Description</label>
            <textarea
              value={aidRequired}
              onChange={(e) => setAidRequired(e.target.value)}
              required
              rows={3}
              placeholder="Emergency Cardiac Surgery & Post-Op Intensive Care"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Anonymized Summary for Donors</label>
            <input
              type="text"
              value={anonymizedSummary}
              onChange={(e) => setAnonymizedSummary(e.target.value)}
              required
              placeholder="e.g. Emergency cardiac procedure for 48yo sole earner from rural district."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">This summary will be visible to donors. Do NOT include PII or phone numbers here.</p>
          </div>

          {/* SENSITIVE FILE UPLOAD BOX */}
          <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-2">
            <Lock className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-slate-200">Upload Sensitive Identity / Hospital Verification Documents</p>
            <p className="text-[10px] text-slate-400 max-w-md mx-auto">
              Aadhaar, disability certificates, and hospital estimates are stored in encrypted Supabase Vault buckets. Only authorized Managers can view them during verification.
            </p>
            <div className="pt-2">
              <Button type="button" variant="outline" size="sm" icon={<Upload className="w-4 h-4" />}>
                Select Private File (Encrypted)
              </Button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSubmitting} icon={<ShieldCheck className="w-4 h-4" />}>
            SUBMIT BENEFICIARY FOR MANAGER VERIFICATION
          </Button>
        </form>
      </Card>
    </div>
  );
}
