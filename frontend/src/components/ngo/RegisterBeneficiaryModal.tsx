'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { authFetch } from '@/lib/auth/api-client';
import { AlertTriangle, CheckCircle2, Upload, FileText, X } from 'lucide-react';

interface RegisterBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBeneficiary: any) => void;
}

export const RegisterBeneficiaryModal: React.FC<RegisterBeneficiaryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [familyMembers, setFamilyMembers] = useState('4');
  const [address, setAddress] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [stateName, setStateName] = useState('Himachal Pradesh');
  const [pinCode, setPinCode] = useState('');
  const [emergencyNeed, setEmergencyNeed] = useState('');
  const [aidCategory, setAidCategory] = useState('Medical Treatment');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [requestedAmount, setRequestedAmount] = useState('50000');
  const [approvedAmount, setApprovedAmount] = useState('50000');
  const [description, setDescription] = useState('');
  const [docCategory, setDocCategory] = useState('Hospital Estimate');
  const [selectedDocs, setSelectedDocs] = useState<{ file: File; category: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { setErrorMsg('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.'); return; }
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) { setErrorMsg('INVALID FILE TYPE: Allowed formats are PDF, JPG, JPEG, and PNG.'); return; }
      setSelectedDocs((prev) => [...prev, { file, category: docCategory }]);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim() || !age || Number(age) <= 0 || !address.trim() || !cityDistrict.trim()) { setErrorMsg('Full Name, Mobile, Age, Address, and City/District are required.'); return; }
    if (!emergencyNeed.trim()) { setErrorMsg('Emergency / Relief Need is required.'); return; }
    const reqAmt = Number(requestedAmount); const appAmt = Number(approvedAmount);
    if (!reqAmt || reqAmt <= 0 || !appAmt || appAmt <= 0) { setErrorMsg('Valid positive requested & approved aid amounts are required.'); return; }

    setIsSubmitting(true); setErrorMsg(null); setSuccessMsg(null);
    try {
      const res = await authFetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, mobile, email, age: Number(age), gender, familyMembers: Number(familyMembers) || 1, address, cityDistrict: `${cityDistrict}${stateName ? `, ${stateName}` : ''}${pinCode ? ` - ${pinCode}` : ''}`, emergencyNeed, aidCategory, priority, requestedAmount: reqAmt, approvedAmount: appAmt, description }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.beneficiary) throw new Error(data.error || 'Failed to register beneficiary.');
      const createdBen = data.beneficiary;

      for (const docItem of selectedDocs) {
        try {
          await authFetch(`/api/beneficiaries/${createdBen.id}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentType: docItem.category, filename: docItem.file.name, mimeType: docItem.file.type || 'application/pdf', fileSize: docItem.file.size, storagePath: `documents/${createdBen.id.toLowerCase()}_${docItem.file.name}` }),
          });
        } catch {}
      }

      setIsSubmitting(false); setSuccessMsg(`Beneficiary registered successfully — ${createdBen.id}`);
      setTimeout(() => { onSuccess(createdBen); onClose(); setSuccessMsg(null); setFullName(''); setMobile(''); setEmergencyNeed(''); setSelectedDocs([]); }, 1200);
    } catch (err: any) {
      setIsSubmitting(false); setErrorMsg(err.message || 'Failed to register beneficiary.');
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Beneficiary" subtitle="Create a verified beneficiary case and assign an approved aid budget.">
      {successMsg ? (
        <div className="py-6 text-center space-y-3"><div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block"><CheckCircle2 className="w-10 h-10" /></div><h3 className="text-xl font-bold text-slate-100">{successMsg}</h3></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /><p>{errorMsg}</p></div>}

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 uppercase border-b border-slate-800 pb-0.5">Section A — Personal Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block font-semibold text-slate-300 mb-1">Full Name *</label><input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Sunita Sharma" className={inputClass} /></div>
              <div><label className="block font-semibold text-slate-300 mb-1">Mobile Number *</label><input type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 9876543210" className={inputClass} /></div>
              <div><label className="block font-semibold text-slate-300 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block font-semibold text-slate-300 mb-1">Age *</label><input type="number" required min="1" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} /></div>
                <div><label className="block font-semibold text-slate-300 mb-1">Gender *</label><select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}><option value="Female">Female</option><option value="Male">Male</option><option value="Other">Other</option></select></div>
                <div><label className="block font-semibold text-slate-300 mb-1">Family</label><input type="number" min="1" value={familyMembers} onChange={(e) => setFamilyMembers(e.target.value)} className={inputClass} /></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 uppercase border-b border-slate-800 pb-0.5">Section B — Address</p>
            <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street Address *" className={inputClass} />
            <div className="grid grid-cols-3 gap-2">
              <input type="text" required value={cityDistrict} onChange={(e) => setCityDistrict(e.target.value)} placeholder="City / District *" className={inputClass} />
              <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State" className={inputClass} />
              <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="PIN Code" className={inputClass} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 uppercase border-b border-slate-800 pb-0.5">Section C — Emergency Need &amp; Budget</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="block font-semibold text-slate-300 mb-1">Relief Need *</label><input type="text" required value={emergencyNeed} onChange={(e) => setEmergencyNeed(e.target.value)} placeholder="e.g. Urgent Cardiac Surgery" className={inputClass} /></div>
              <div><label className="block font-semibold text-slate-300 mb-1">Category *</label><select value={aidCategory} onChange={(e) => setAidCategory(e.target.value)} className={inputClass}><option value="Medical Treatment">Medical Treatment</option><option value="Emergency Food Relief">Emergency Food Relief</option><option value="Disaster Shelter Reconstruction">Disaster Shelter</option></select></div>
              <div><label className="block font-semibold text-slate-300 mb-1">Priority</label><select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={inputClass}><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option></select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block font-semibold text-slate-300 mb-1">Requested (₹)</label><input type="number" required min="1" value={requestedAmount} onChange={(e) => setRequestedAmount(e.target.value)} className={inputClass} /></div>
                <div><label className="block font-semibold text-slate-300 mb-1">Approved (₹)</label><input type="number" required min="1" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} className={inputClass} /></div>
              </div>
            </div>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Case Diagnosis Summary..." className={inputClass} />
          </div>

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 uppercase border-b border-slate-800 pb-0.5">Section D — Verification Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end p-3 rounded-xl bg-slate-950 border border-slate-800">
              <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)} className={inputClass}>
                <option value="Hospital Estimate">Hospital Estimate</option><option value="Government ID Proof">Government ID</option><option value="Medical Diagnostic Report">Medical Report</option>
              </select>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-400 font-bold">
                <Upload className="w-4 h-4" /> Upload File<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>
            {selectedDocs.length > 0 && (
              <div className="space-y-1 pt-1">{selectedDocs.map((doc, idx) => (<div key={idx} className="flex justify-between p-2 rounded bg-slate-900 text-[11px] font-semibold"><span className="truncate">{doc.file.name}</span><button type="button" onClick={() => setSelectedDocs(prev => prev.filter((_, i) => i !== idx))}><X className="w-3.5 h-3.5 text-rose-400" /></button></div>))}</div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register Beneficiary & Assign Aid'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
