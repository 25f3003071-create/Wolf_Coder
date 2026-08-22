/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Camera, ShieldCheck, MapPin, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { useCameraCapture } from './hooks/useCameraCapture';

interface EvidenceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (evidence: { id: string; fileHash: string; storagePath: string }) => void;
  expenseId?: string;
  beneficiaryId?: string;
}

export const EvidenceCaptureModal: React.FC<EvidenceCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  expenseId = 'EXP-2026-77A2',
  beneficiaryId = 'BEN-72A91',
}) => {
  const camera = useCameraCapture({ isOpen, onClose, onCaptureComplete, expenseId, beneficiaryId });

  return (
    <Modal isOpen={isOpen} onClose={() => { camera.stopCameraStream(); onClose(); }} title="In-App High-Trust Evidence Capture" subtitle="Capture field evidence directly using in-app camera controls & Web Crypto SHA-256 hashing">
      <div className="space-y-6">
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>High-trust capture: Image metadata, GPS location, and Web Crypto SHA-256 hash are recorded automatically.</span>
        </div>

        {camera.cameraError && (
          <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{camera.cameraError}</span>
          </div>
        )}

        <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
          {!camera.cameraActive && !camera.capturedImage && (
            <div className="text-center p-6 space-y-3">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 inline-block"><Camera className="w-8 h-8" /></div>
              <p className="text-xs text-slate-400">Click below to open live device camera for verification capture</p>
              <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />} onClick={camera.startCamera}>OPEN DEVICE CAMERA</Button>
            </div>
          )}

          {camera.cameraActive && (
            <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950">
              <video ref={camera.videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-4 border-2 border-dashed border-emerald-500/50 rounded-xl pointer-events-none flex items-center justify-center z-10">
                <span className="text-[10px] text-emerald-400/90 font-mono bg-slate-950/80 px-2 py-1 rounded">ALIGN MEDICAL RECEIPT OR SURGERY EVIDENCE INSIDE BOX</span>
              </div>
              <div className="absolute bottom-4 z-20">
                <Button variant="primary" size="md" icon={<Camera className="w-4 h-4" />} onClick={camera.snapPhoto}>SNAP PHOTO & COMPUTE SHA-256</Button>
              </div>
            </div>
          )}

          {camera.capturedImage && (
            <div className="w-full h-full relative">
              <img src={camera.capturedImage} alt="Evidence Capture" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /><span>GPS: {camera.gpsLocation.lat} N, {camera.gpsLocation.lng} E ({camera.gpsLocation.label})</span></div>
                <span className="text-slate-400">STATUS: CAMERA VERIFIED</span>
              </div>
            </div>
          )}
        </div>

        {camera.hashResult && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <span className="block text-slate-400 font-semibold uppercase text-[10px]">Computed Web Crypto SHA-256 Checksum</span>
            <p className="font-mono text-emerald-400 break-all text-[11px]">{camera.hashResult}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {camera.capturedImage && (
            <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => { camera.setCapturedImage(null); camera.setHashResult(null); camera.startCamera(); }}>
              Retake Photo
            </Button>
          )}
          <Button variant="primary" size="md" disabled={!camera.capturedImage} isLoading={camera.isSubmitting} icon={<CheckCircle2 className="w-4 h-4" />} onClick={camera.handleSubmitEvidence}>
            Submit & Anchor Evidence
          </Button>
        </div>
      </div>
    </Modal>
  );
};
