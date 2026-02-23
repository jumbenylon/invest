'use client'
import { useState, useEffect } from 'react'
import { User, Lock, CreditCard, Check, Loader2 } from 'lucide-react'
import { PLAN_PRICES } from '@/lib/subscription'

function apiHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('invest_token') : ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<'profile' | 'password' | 'plan'>('profile')
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('invest_user')
    if (u) {
      const parsed = JSON.parse(u)
      setUser(parsed)
      setProfileForm({ name: parsed.name || '', email: parsed.email || '' })
    }
  }, [])

  const planBadge: Record<string, string> = {
    free: 'bg-[#2a2d3a] text-[#8b8fa8]',
    pro: 'bg-[#ff1a66]/20 text-[#ff1a66]',
    enterprise: 'bg-amber-500/20 text-amber-400',
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[#8b8fa8] text-sm">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2a2d3a]">
        {[{ key: 'profile', label: 'Profile', icon: User }, { key: 'password', label: 'Password', icon: Lock }, { key: 'plan', label: 'Plan', icon: CreditCard }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[#ff1a66] text-[#ff1a66]' : 'border-transparent text-[#8b8fa8] hover:text-white'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-[#00b359]/10 border border-[#00b359]/20 text-[#00b359] px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-[#ff1a66]/20 rounded-full flex items-center justify-center text-[#ff1a66] font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planBadge[user?.plan] || planBadge.free}`}>
                {user?.plan?.toUpperCase()} PLAN
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff1a66]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={profileForm.email} type="email"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-4 py-3 text-sm text-[#8b8fa8] cursor-not-allowed" readOnly />
            <p className="text-xs text-[#8b8fa8] mt-1">Email cannot be changed</p>
          </div>
          <p className="text-sm text-[#8b8fa8]">Profile editing will be available in a future update.</p>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6 space-y-4">
          <p className="text-sm text-[#8b8fa8]">Password changes coming in next update.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff1a66]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff1a66]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff1a66]" />
          </div>
          <button disabled className="bg-[#ff1a66]/50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed">
            Update Password
          </button>
        </div>
      )}

      {/* Plan Tab */}
      {tab === 'plan' && (
        <div className="space-y-4">
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-6">
            <p className="text-sm text-[#8b8fa8] mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold px-3 py-1 rounded-full ${planBadge[user?.plan] || planBadge.free}`}>
                {user?.plan?.toUpperCase()}
              </span>
              <span className="text-[#8b8fa8]">
                {user?.plan === 'free' ? 'Free forever' : `TZS ${(PLAN_PRICES[user?.plan as 'pro' | 'enterprise'] || 0).toLocaleString()}/month`}
              </span>
            </div>
          </div>

          {user?.plan === 'free' && (
            <div className="bg-gradient-to-br from-[#ff1a66]/10 to-[#1a1d27] border border-[#ff1a66]/20 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
              <p className="text-[#8b8fa8] text-sm mb-4">Unlock unlimited investments, loans, goals and advanced analytics.</p>
              <p className="text-2xl font-bold mb-4">TZS 5,000<span className="text-base font-normal text-[#8b8fa8]">/month</span></p>
              <a href="mailto:hello@sakuragroup.co.tz?subject=Mimi%20Invest%20Pro%20Upgrade"
                className="block text-center bg-[#ff1a66] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                Upgrade to Pro — Contact Us
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
