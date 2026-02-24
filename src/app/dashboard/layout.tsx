'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, PieChart, BarChart2, TrendingUp,
  ArrowLeftRight, CreditCard, Target, Star, Settings,
  LogOut, Menu, X, Plus, User,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/portfolio', icon: PieChart, label: 'Portfolio' },
  { href: '/dashboard/dse', icon: BarChart2, label: 'DSE Stocks' },
  { href: '/dashboard/utt', icon: TrendingUp, label: 'UTT Funds' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/dashboard/loans', icon: CreditCard, label: 'Loans' },
  { href: '/dashboard/goals', icon: Target, label: 'Goals' },
  { href: '/dashboard/watchlist', icon: Star, label: 'Watchlist' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const bottomNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/dse', icon: BarChart2, label: 'DSE' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Txns' },
  { href: '/dashboard/settings', icon: User, label: 'Profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('invest_token')
    const userData = localStorage.getItem('invest_user')
    if (!token) {
      router.replace('/auth/login')
      return
    }
    if (userData) setUser(JSON.parse(userData))
  }, [router])

  function logout() {
    localStorage.removeItem('invest_token')
    localStorage.removeItem('invest_user')
    router.replace('/auth/login')
  }

  if (!user) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff1a66] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const planBadge = {
    free: 'bg-[#2a2d3a] text-[#8b8fa8]',
    pro: 'bg-[#ff1a66]/20 text-[#ff1a66]',
    enterprise: 'bg-amber-500/20 text-amber-400',
  }[user.plan as string] || 'bg-[#2a2d3a] text-[#8b8fa8]'

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2a2d3a]">
          <div className="w-8 h-8 bg-[#ff1a66] rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">Mimi Invest</span>
          <button className="ml-auto lg:hidden text-[#8b8fa8]" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-b border-[#2a2d3a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ff1a66]/20 rounded-full flex items-center justify-center text-[#ff1a66] font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planBadge}`}>
                {user.plan?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-[#ff1a66]/10 text-[#ff1a66]'
                    : 'text-[#8b8fa8] hover:bg-[#2a2d3a] hover:text-white'
                  }
                `}
              >
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#2a2d3a]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#8b8fa8] hover:bg-[#2a2d3a] hover:text-white transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-[#2a2d3a] bg-[#1a1d27]">
          <button onClick={() => setSidebarOpen(true)} className="text-[#8b8fa8] hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ff1a66] rounded flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">Mimi Invest</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1d27] border-t border-[#2a2d3a] flex items-center justify-around px-2 py-1.5 safe-area-pb">
        {bottomNav.slice(0, 2).map(({ href, icon: Icon, label }) => {
          const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${active ? 'text-[#ff1a66]' : 'text-[#8b8fa8]'}`}>
              <Icon className={`w-5 h-5 ${active ? 'text-[#ff1a66]' : 'text-[#8b8fa8]'}`} />
              {label}
            </Link>
          )
        })}

        {/* Center FAB */}
        <Link href="/dashboard/transactions?new=1" className="flex flex-col items-center -mt-4">
          <span className="w-12 h-12 rounded-full bg-[#ff1a66] flex items-center justify-center shadow-lg shadow-[#ff1a66]/40">
            <Plus className="w-6 h-6 text-white" />
          </span>
          <span className="text-[10px] text-[#8b8fa8] mt-0.5 font-medium">New</span>
        </Link>

        {bottomNav.slice(2).map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${active ? 'text-[#ff1a66]' : 'text-[#8b8fa8]'}`}>
              <Icon className={`w-5 h-5 ${active ? 'text-[#ff1a66]' : 'text-[#8b8fa8]'}`} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
