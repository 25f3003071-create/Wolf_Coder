'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { authFetch } from '@/lib/auth/api-client';
import { UserPlus, AlertTriangle, ShieldCheck, CheckCircle2, Upload, FileText, X } from 'lucide-react';

interface RegisterBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBeneficiary: any) => void;
}

interface SelectedDoc {
  file: File;
  category: string;
}

export const RegisterBeneficiaryModal: React.FC<RegisterBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Section A — Personal Information
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [familyMembers, setFamilyMembers] = useState('4');

  // Section B — Address
  const [address, setAddress] = useState('');
  const [cityDistrict, setCityDistrict] = useState('');
  const [stateName, setStateName] = useState('Himachal Pradesh');
  const [pinCode, setPinCode] = useState('');

  // Section C — Emergency / Aid Information
  const [emergencyNeed, setEmergencyNeed] = useState('');
  const [aidCategory, setAidCategory] = useState('Medical Treatment');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [requestedAmount, setRequestedAmount] = useState('50000');
  const [approvedAmount, setApprovedAmount] = useState('50000');
  const [description, setDescription] = useState('');

  // Section D — Verification Documents Upload
  const [docCategory, setDocCategory] = useState('Hospital Estimate');
  const [selectedDocs, setSelectedDocs] = useState<SelectedDoc[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate 10 MB limit
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('FILE SIZE EXCEEDED: File size cannot exceed 10 MB.');
        return;
      }

      // Validate allowed file types
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExts.includes(ext)) {
        setErrorMsg('INVALID FILE TYPE: Allowed formats are PDF, JPG, JPEG, and PNG.');
        return;
      }

      setSelectedDocs((prev) => [...prev, { file, category: docCategory }]);
      e.target.value = '';
    }
  };

  const handleRemoveDoc = (index: number) => {
    setSelectedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Mobile Number is required.');
      return;
    }
    if (!age || Number(age) <= 0) {
      setErrorMsg('Valid age is required.');
      return;
    }
    if (!address.trim() || !cityDistrict.trim()) {
      setErrorMsg('Full address and City/District are required.');
      return;
    }
    if (!emergencyNeed.trim()) {
      setErrorMsg('Emergency / Relief Need is required.');
      return;
    }
    const reqAmt = Number(requestedAmount);
    const appAmt = Number(approvedAmount);
    if (!reqAmt || reqAmt <= 0) {
      setErrorMsg('Valid requested aid amount is required.');
      return;
    }
    if (!appAmt || appAmt <= 0) {
      setErrorMsg('Valid approved aid amount is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create Beneficiary via POST /api/beneficiaries
      const res = await authFetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          email,
          age: Number(age),
          gender,
          familyMembers: Number(familyMembers) || 1,
          address,
          cityDistrict: `${cityDistrict}${stateName ? `, ${stateName}` : ''}${pinCode ? ` - ${pinCode}` : ''}`,
          emergencyNeed,
          aidCategory,
          priority,
          requestedAmount: reqAmt,
          approvedAmount: appAmt,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.beneficiary) {
        throw new Error(data.error || 'Failed to register beneficiary.');
      }

      const createdBen = data.beneficiary;

      // 2. Upload initial verification documents if any selected
      if (selectedDocs.length > 0) {
        for (const docItem of selectedDocs) {
          try {
            await authFetch(`/api/beneficiaries/${createdBen.id}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documentType: docItem.category,
                filename: docItem.file.name,
                mimeType: docItem.file.type || 'application/pdf',
                fileSize: docItem.file.size,
                storagePath: `documents/${createdBen.id.toLowerCase()}_${docItem.file.name}`,
              }),
            });
          } catch (docErr) {
            console.warn('Initial document upload warning:', docErr);
          }
        }
      }

      setIsSubmitting(false);
      setSuccessMsg(`Beneficiary registered successfully — ${createdBen.id}`);

      setTimeout(() => {
        onSuccess(createdBen);
        onClose();
        setSuccessMsg(null);
        // Reset form
        setFullName('');
        setMobile('');
        setEmergencyNeed('');
        setRequestedAmount('50000');
        setApprovedAmount('50000');
        setDescription('');
        setSelectedDocs([]);
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to register beneficiary.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Beneficiary"
      subtitle="Create a verified beneficiary case and assign an approved aid budget."
    >
      {successMsg ? (
        <div className="py-8 text-center space-y-4 animate-fade-in">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">{successMsg}</h3>
          <p className="text-xs text-slate-400">Updating NGO Workspace dashboard and beneficiary tables...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* SECTION A — PERSONAL INFORMATION */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              Section A — Personal Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sunita Sharma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sunita.sharma@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="48"
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Family *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={familyMembers}
                    onChange={(e) => setFamilyMembers(e.target.value)}
                    placeholder="4"
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B — ADDRESS */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              Section B — Address
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village Rampur, Ward 4, Post Office Box 12"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / District *</label>
                <input
                  type="text"
                  required
                  value={cityDistrict}
                  onChange={(e) => setCityDistrict(e.target.value)}
                  placeholder="Shimla"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Himachal Pradesh"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="171001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION C — EMERGENCY / AID INFORMATION */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              Section C — Emergency / Aid Information
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emergency Need *</label>
              <input
                type="text"
                required
                value={emergencyNeed}
                onChange={(e) => setEmergencyNeed(e.target.value)}
                placeholder="e.g. Emergency Cardiac Surgery & Medication"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aid Category *</label>
                <select
                  value={aidCategory}
                  onChange={(e) => setAidCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Medical Treatment">Medical Treatment</option>
                  <option value="Medicines">Medicines</option>
                  <option value="Hospitalization">Hospitalization</option>
                  <option value="Food & Essential Supplies">Food &amp; Essential Supplies</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Disaster Relief">Disaster Relief</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Aid Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={requestedAmount}
                  onChange={(e) => {
                    setRequestedAmount(e.target.value);
                    setApprovedAmount(e.target.value);
                  }}
                  placeholder="50000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Aid Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hospital estimate details or verification notes..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* SECTION D — INITIAL VERIFICATION DOCUMENTS UPLOAD */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              Section D — Initial Verification Documents (Optional)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Document Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach File (PDF, JPG, PNG &lt; 10MB)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-950 file:text-emerald-400"
                />
              </div>
            </div>

            {selectedDocs.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-300">Files Selected for Upload ({selectedDocs.length}):</p>
                {selectedDocs.map((docItem, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-200">{docItem.file.name}</span>
                      <span className="text-[10px] text-slate-400">({(docItem.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>Generates server-side <code>BEN-2026-XXXXXX</code> beneficiary ID with database persistence and auto-refreshes workspace charts.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              icon={<UserPlus className="w-4 h-4" />}
            >
              REGISTER BENEFICIARY
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
