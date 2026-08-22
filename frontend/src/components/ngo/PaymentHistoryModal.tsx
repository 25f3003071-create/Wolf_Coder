'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils/currency';
import { authFetch } from '@/lib/auth/api-client';
import { History, Receipt, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryId: string;
  beneficiaryName: string;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  beneficiaryId,
  beneficiaryName,
}) => {
  const [disbursements, setDisbursements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && beneficiaryId) {
      setIsLoading(true);
      authFetch(`/api/beneficiaries/${beneficiaryId}/disbursements`)
        .then((res) => res.json())
        .then((data) => {
          setIsLoading(false);
          if (data.success) {
            setDisbursements(data.disbursements || []);
          }
        })
        .catch(() => setIsLoading(false));
    }
  }, [isOpen, beneficiaryId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aid Disbursement History" subtitle={`Complete record of aid payments for ${beneficiaryName || beneficiaryId}`}>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading disbursement history...</p>
        ) : disbursements.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
            No aid disbursements recorded yet for this beneficiary.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {disbursements.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{item.id}</span>
                    <Badge variant="success" className="text-[9px] py-0">SIMULATED</Badge>
                  </div>
                  <span className="font-extrabold text-slate-100 text-sm">{formatCurrency(item.amount)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Aid Category</span>
                    <span className="font-semibold">{item.aid_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment Method</span>
                    <span className="font-semibold">{item.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Reference ID</span>
                    <span className="font-mono text-[11px] text-slate-300">{item.payment_reference}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date</span>
                    <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {item.blockchain_tx_hash && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Blockchain Status</span>
                    <span className="font-mono text-slate-300 truncate max-w-[200px]">
                      {item.blockchain_tx_hash}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
