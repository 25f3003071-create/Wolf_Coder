'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Settings, ShieldCheck, Lock, Bell, User, Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyRealtime, setNotifyRealtime] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
          <Settings className="w-7 h-7 text-emerald-400" />
          Account & Platform Settings
        </h1>
        <p className="text-xs text-slate-400">Manage profile details, Web3 security, and realtime notifications</p>
      </div>

      <Card title="User Profile" subtitle="Your public platform profile information">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue="Rahul Sharma"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                defaultValue="donor@relieftrack.org"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Real-Time Notifications" subtitle="Configure donation journey status alerts">
        <div className="space-y-4 text-xs">
          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="block font-bold text-slate-200">Email Notifications</span>
              <span className="text-slate-400 text-[11px]">Receive receipt updates when NGO allocates funds</span>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
            <div>
              <span className="block font-bold text-slate-200">Supabase Realtime Web Notifications</span>
              <span className="text-slate-400 text-[11px]">Instant browser alerts when camera evidence is anchored</span>
            </div>
            <input
              type="checkbox"
              checked={notifyRealtime}
              onChange={(e) => setNotifyRealtime(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </label>

          <Button variant="primary" size="md" icon={<Save className="w-4 h-4" />}>
            Save Notification Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}
