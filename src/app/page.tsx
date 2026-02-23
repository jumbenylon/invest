import Link from 'next/link'
import { TrendingUp, Shield, Target, BarChart3, Smartphone, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Nav */}
      <nav className="border-b border-[#2a2d3a] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff1a66] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Mimi Invest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-[#8b8fa8] hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register" className="bg-[#ff1a66] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#ff1a66]/10 text-[#ff1a66] px-4 py-2 rounded-full text-sm font-medium mb-6">
          <TrendingUp className="w-4 h-4" />
          Tanzania&apos;s #1 Investment Tracker
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Your Money.<br />
          <span className="text-[#ff1a66]">Your Growth.</span>
        </h1>
        <p className="text-xl text-[#8b8fa8] mb-8 max-w-2xl mx-auto">
          Track DSE stocks, UTT funds, loans and financial goals all in one place.
          Built for Tanzanian investors who take their money seriously.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/register" className="bg-[#ff1a66] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/auth/login" className="border border-[#2a2d3a] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#1a1d27] transition-colors">
            Sign In
          </Link>
        </div>
        <p className="text-sm text-[#8b8fa8] mt-4">Free forever · No credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to invest smarter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: 'DSE Portfolio Tracker', desc: 'Real-time tracking of your Dar es Salaam Stock Exchange holdings. Monitor gains, losses, and sector exposure.', color: 'text-[#00b359]' },
            { icon: TrendingUp, title: 'UTT Fund Monitor', desc: 'Track all your UTT investments — Umoja, Wekeza, Jikimu, Watoto and more. NAV updates daily.', color: 'text-[#ff1a66]' },
            { icon: Target, title: 'Financial Goals', desc: 'Set savings targets and track progress toward your dreams — car, house, education or emergency fund.', color: 'text-[#f4a261]' },
            { icon: Shield, title: 'Loan & Debt Tracker', desc: 'Manage all your loans in one place. Track repayments, interest and balance with full payment history.', color: 'text-purple-400' },
            { icon: BarChart3, title: 'Income & Expense Ledger', desc: 'Log all your transactions and see where your money goes each month with beautiful insights.', color: 'text-blue-400' },
            { icon: Smartphone, title: 'Works on Any Device', desc: 'Installable as a PWA on Android and iOS. Access your portfolio anywhere, even offline.', color: 'text-cyan-400' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 hover:border-[#ff1a66]/30 transition-colors">
              <Icon className={`w-8 h-8 ${color} mb-4`} />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-[#8b8fa8] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-[#8b8fa8] text-center mb-12">Start free. Upgrade when you&apos;re ready.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
            <h3 className="font-bold text-xl mb-2">Free</h3>
            <div className="text-4xl font-bold mb-1">TZS 0</div>
            <p className="text-[#8b8fa8] text-sm mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {['Up to 5 investments', '30 transactions/month', '3 financial goals', 'DSE & UTT browsing', 'Basic portfolio view'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#00b359] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center border border-[#2a2d3a] text-white py-3 rounded-xl font-semibold hover:bg-[#2a2d3a] transition-colors">
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-[#1a1d27] border-2 border-[#ff1a66] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff1a66] text-white px-4 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <h3 className="font-bold text-xl mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-1">TZS 5,000<span className="text-lg text-[#8b8fa8]">/mo</span></div>
            <p className="text-[#8b8fa8] text-sm mb-6">For serious investors</p>
            <ul className="space-y-3 mb-8">
              {['Unlimited investments', 'Unlimited transactions', 'Unlimited goals', 'Full loan tracker', 'Repayment schedules', 'Advanced analytics', 'CSV export'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#ff1a66] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center bg-[#ff1a66] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Start Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8">
            <h3 className="font-bold text-xl mb-2">Enterprise</h3>
            <div className="text-4xl font-bold mb-1">TZS 50,000<span className="text-lg text-[#8b8fa8]">/mo</span></div>
            <p className="text-[#8b8fa8] text-sm mb-6">For wealth managers & firms</p>
            <ul className="space-y-3 mb-8">
              {['All Pro features', 'API access', 'Multi-portfolio', 'White-label option', 'Priority support', 'Custom integrations'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#f4a261] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href="mailto:hello@sakuragroup.co.tz" className="block text-center border border-[#2a2d3a] text-white py-3 rounded-xl font-semibold hover:bg-[#2a2d3a] transition-colors">
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-[#ff1a66]/20 to-[#ff1a66]/5 border border-[#ff1a66]/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold mb-4">Start tracking your wealth today</h2>
          <p className="text-[#8b8fa8] mb-8">Join Tanzanian investors who use Mimi Invest to grow their portfolios.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-[#ff1a66] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2d3a] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ff1a66] rounded flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-[#8b8fa8]">Mimi Invest by Sakura Group © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-[#8b8fa8]">
            <a href="mailto:hello@sakuragroup.co.tz" className="hover:text-white transition-colors">Contact</a>
            <span>invest.sakuragroup.co.tz</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
