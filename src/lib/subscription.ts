export type Plan = 'free' | 'pro' | 'enterprise'

export const PLAN_LIMITS = {
  free: {
    maxAssets: 5,
    maxTransactionsPerMonth: 30,
    loansEnabled: false,
    goalsEnabled: true,
    maxGoals: 3,
    apiAccess: false,
    multiPortfolio: false,
  },
  pro: {
    maxAssets: Infinity,
    maxTransactionsPerMonth: Infinity,
    loansEnabled: true,
    goalsEnabled: true,
    maxGoals: Infinity,
    apiAccess: false,
    multiPortfolio: false,
  },
  enterprise: {
    maxAssets: Infinity,
    maxTransactionsPerMonth: Infinity,
    loansEnabled: true,
    goalsEnabled: true,
    maxGoals: Infinity,
    apiAccess: true,
    multiPortfolio: true,
  },
} as const

export const PLAN_PRICES = {
  free: 0,
  pro: 5000,
  enterprise: 50000,
}

export const PLAN_LABELS = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

export function canAddAsset(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxAssets
}

export function canAddTransaction(plan: Plan, monthlyCount: number): boolean {
  return monthlyCount < PLAN_LIMITS[plan].maxTransactionsPerMonth
}

export function canUseLoan(plan: Plan): boolean {
  return PLAN_LIMITS[plan].loansEnabled
}

export function canAddGoal(plan: Plan, currentCount: number): boolean {
  return plan !== 'free' || currentCount < PLAN_LIMITS[plan].maxGoals
}

export function getPlanFeatures(plan: Plan) {
  return PLAN_LIMITS[plan]
}
