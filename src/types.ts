export interface Holding {
  id: string;
  name: string;
  symbol?: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currency: string;
  gainLoss?: number;
  gainLossPercentage?: number;
  updatedAt?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'Checking' | 'Savings' | 'Investment' | 'Credit Card' | '401k' | 'Roth IRA' | 'Traditional IRA' | 'Other' | 'Cash';
  institution: string;
  logo?: string;
  updatedAt?: string;
  deleted?: boolean;
  holdings?: Holding[];
  annualYield?: number;
  riskProfile?: 'Low' | 'Moderate' | 'High' | 'Aggressive';
  providerId?: string; // For de-duplication with Plaid/Manual imports
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  category?: string;
  accountId?: string;
}

export interface StressTestResult {
  runwayMonths: number;
  monthlyBurn: number;
  soulDepreciationRate: number; // A fun "artist soul" metric
  status: 'Safe' | 'Warning' | 'Danger';
  recommendation: string;
}

export interface ReferralOffer {
  id: string;
  provider: string;
  title: string;
  description: string;
  link: string;
  commissionEstimate: number;
}

export interface MinionTask {
  id: string;
  type: 'WEALTH_ACTION' | 'TAX_OPTIMIZER' | 'SANDBOX_SIM';
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  instruction: string;
  result?: string;
  reasoning?: string;
  autonomousDecision?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SandboxState {
  isActive: boolean;
  originalAccounts?: Account[];
  simulatedAccounts?: Account[];
  changes?: string[];
}

export interface StrategyPillar {
  title: string;
  description?: string;
  action: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  type?: 'COMPLIANCE' | 'STRATEGY' | 'ALLOCATION' | 'YIELD';
  reason?: string;
}

export interface TaxDeadline {
  id: string;
  date: string;
  title: string;
  status: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WealthStrategy {
  title: string;
  summary: string;
  pillars: StrategyPillar[];
  top3Actions: StrategyPillar[]; // Primary focus
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  complianceScore: number;
  taxOpportunityScore: number;
  nextReviewDate: string;
  generatedAt: string;
}

export interface DashboardData {
  totalRaw: number;
  totalPurchasingPower: number;
  totalPurchasingPowerTrend: number[];
  allocation: { name: string; value: number }[];
  usdCash: number;
  usCash: number;
  twdCash: number;
  investmentLosses: number;
  crossBorderEquities: number;
  twAssetsUSD?: number;
  taxResidencyStatus?: 'NRA' | 'RA' | 'H1B' | 'F1_OPT' | 'Dual_Status';
  residencyHistory?: { year: number; status: string; daysInUS: number }[];
  taxHarvesting: {
    opportunityFound: boolean;
    targetAsset: string;
    offsetAsset: string;
    estimatedSavings: number;
    description: string;
  };
  minionInsights?: {
    id: string;
    type: 'TAX' | 'FOREX' | 'WEALTH';
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
  wealthHealthScore?: number;
  wealthHealthFactors?: {
    label: string;
    score: number;
    status: string;
  }[];
  forexSignals?: {
    pair: string;
    rate: string;
    signal: string;
    trend: 'up' | 'down';
    reason: string;
  }[];
  stressTest?: StressTestResult;
  jurisdictionBreakdown?: {
    us: { total: number; liquid: number; invested: number };
    tw: { total: number; liquid: number; invested: number };
  };
  jurisdictionInsight?: {
    usRatio: number;
    recommendation: string;
  };
  simulationRunway?: { month: string; balance: number }[];
  taxSavings: number;
  harvestableLoss: number;
  taxReports?: {
    fbar: {
      status: string;
      maxBalances: { institution: string; account: string; maxValueTWD: number; maxValueUSD: number }[];
    };
    ftc: {
      status: string;
      estimatedCredit: number;
      description: string;
    };
    opportunities?: number;
  };
  taxDeadlines?: TaxDeadline[];
  taxComplianceScore?: number;
  offers: ReferralOffer[];
  lastSync: string;
  minionTasks: MinionTask[];
  sandbox?: SandboxState;
  strategy?: WealthStrategy;
}
