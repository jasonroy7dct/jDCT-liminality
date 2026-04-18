import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for demo purposes (In production, store in Firestore or secure session)
  let accessToken: string | null = null;
  
  let accounts: any[] = [];
  let transactions: any[] = [];
  let minionTasks: any[] = [];

  const getAccounts = async () => {
    if (accessToken) {
      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: accessToken,
        });

        const plaidAccounts = accountsResponse.data.accounts.map(acc => ({
          id: acc.account_id,
          name: acc.name,
          balance: acc.balances.current || 0,
          currency: acc.balances.iso_currency_code === 'TWD' ? 'TWD' : 'USD',
          type: acc.type === 'investment' ? 'Investment' : 'Cash',
          institution: 'Plaid Linked',
        }));

        return [
          ...plaidAccounts,
          ...accounts.filter(a => a.institution === 'Cathay')
        ];
      } catch (error) {
        console.error('Error fetching Plaid accounts:', error);
      }
    }
    return accounts;
  };

  const getTransactions = async () => {
    if (accessToken) {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const response = await plaidClient.transactionsGet({
          access_token: accessToken,
          start_date: thirtyDaysAgo.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        });

        const plaidTrx = response.data.transactions.map(t => ({
          id: t.transaction_id,
          date: t.date,
          description: t.name,
          amount: -t.amount, // Flip sign: Positive in Plaid is debit, we want negative for expense
          currency: t.iso_currency_code || 'USD',
          status: t.pending ? 'Pending' : 'Completed',
          category: t.category?.[0] || 'General',
          accountId: t.account_id
        }));

        return [
          ...plaidTrx,
          ...transactions
        ];
      } catch (error) {
        console.error('Error fetching Plaid transactions:', error);
      }
    }
    return transactions;
  };

  app.get("/api/dashboard", async (req, res) => {
    const currentAccounts = await getAccounts();
    const currentTransactions = await getTransactions();
    
    const usdCash = currentAccounts.filter(a => a.currency === 'USD' && (a.type === 'Cash' || a.type === 'Checking' || a.type === 'Savings')).reduce((sum, a) => sum + a.balance, 0);
    const twdCash = currentAccounts.filter(a => a.currency === 'TWD' && (a.type === 'Cash' || a.type === 'Checking' || a.type === 'Savings')).reduce((sum, a) => sum + a.balance, 0);
    const equities = currentAccounts.filter(a => a.type === 'Investment').reduce((sum, a) => sum + a.balance, 0);
    const liabilities = currentAccounts.filter(a => a.type === 'Credit Card').reduce((sum, a) => sum + a.balance, 0);
    
    const TWD_RATE = 32.85; 
    const totalRaw = usdCash + (twdCash / TWD_RATE) + equities - liabilities;
    const taxDrag = (equities * 0.15) + (twdCash / TWD_RATE * 0.05); 
    const totalPurchasingPower = Math.max(0, totalRaw - taxDrag);

    const monthlyBurn = currentTransactions
      .filter(t => t.amount < 0 && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + Math.abs(t.currency === 'TWD' ? t.amount / TWD_RATE : t.amount), 0);

    const allocation = [
      { name: 'USD Cash', value: usdCash },
      { name: 'TWD Cash (Adj)', value: (twdCash / TWD_RATE) * 0.95 },
      { name: 'Investments', value: equities },
    ];

    const simulationRunway = Array.from({ length: 24 }, (_, i) => {
      const month = i + 1;
      const rsuVesting = month % 3 === 0 ? 12000 : 0; // Quarterly vesting
      const expenses = 6500; // NYC rent + life
      return {
        month: `Month ${month}`,
        balance: Math.max(0, totalPurchasingPower - (expenses * month) + (rsuVesting * Math.floor(month / 3)))
      };
    });

    // Deterministic trend data
    const trend = Array.from({ length: 10 }, (_, i) => {
      const base = totalPurchasingPower * 0.95;
      return base + (totalPurchasingPower * 0.05 * (i / 9));
    });

    const offers = [];
    if (usdCash > 50000) {
      offers.push({
        id: 'marcus-hysa',
        provider: 'Marcus by Goldman Sachs',
        title: 'High-Yield Savings (4.5% APY)',
        description: 'Your idle Chase balance is earning 0.01%. Move to Marcus to earn $2,250+ annually.',
        link: 'https://www.marcus.com/share/JAS-ON-123',
        commissionEstimate: 100
      });
    }

    // Dynamic insights based on data
    const insights = [];
    if (equities > 10000) {
      insights.push({ id: '1', type: 'TAX', title: 'Wash Sale Alert', description: 'Selling 0050 now can offset $1,200 in NVDA gains.', priority: 'HIGH' });
    }
    
    const forexSignals = [
      { pair: 'USD/TWD', rate: '32.85', signal: 'SELL', trend: 'down', reason: 'TWD oversold on RSI(14). Expect mean reversion.' },
      { pair: 'USD/JPY', rate: '151.20', signal: 'BUY', trend: 'up', reason: 'BoJ yield curve control remains dovish.' },
      { pair: 'USD/HKD', rate: '7.82', signal: 'HOLD', trend: 'up', reason: 'Peg remains stable within 7.75-7.85 band.' },
      { pair: 'EUR/USD', rate: '1.08', signal: 'BUY', trend: 'up', reason: 'ECB hawkish pivot on inflation data.' }
    ];

    if (TWD_RATE > 32.5) {
      insights.push({ id: '2', type: 'FOREX', title: 'TWD Weakness', description: `TWD is at ${TWD_RATE.toFixed(2)}. Good time to repatriate USD.`, priority: 'MEDIUM' });
    }
    if (usdCash > 10000) {
      insights.push({ id: '3', type: 'WEALTH', title: 'Idle Cash', description: `You have ${usdCash.toLocaleString()} in a 0.01% checking account. Move to SoFi?`, priority: 'LOW' });
    }

    res.json({
      totalPurchasingPower,
      totalPurchasingPowerTrend: trend,
      allocation,
      usdCash,
      twdCash,
      crossBorderEquities: equities,
      forexSignals,
      taxHarvesting: {
        opportunityFound: true,
        targetAsset: "Taiwan 0050 Loss",
        offsetAsset: "US NVDA Gain",
        estimatedSavings: 1350.00,
        description: "Detected unrealized losses in TW stocks that can offset US capital gains. Estimated tax savings: $1,350.",
      },
      minionInsights: insights,
      wealthHealthScore: 85, // Stable default
      wealthHealthFactors: [
        { label: 'Liquidity', score: Math.min(100, Math.floor(usdCash / 500)), status: 'Excellent' },
        { label: 'Tax Efficiency', score: 62, status: 'Needs Work' },
        { label: 'Diversification', score: 78, status: 'Good' },
        { label: 'Runway', score: Math.min(100, Math.floor(totalPurchasingPower / 5000)), status: 'Strong' }
      ],
      stressTest: {
        runwayMonths: Math.floor(totalPurchasingPower / (monthlyBurn || 5500)),
        monthlyBurn: monthlyBurn || 5500,
        soulDepreciationRate: 0.12,
        status: monthlyBurn > 7000 ? 'Danger' : 'Warning',
        recommendation: monthlyBurn > 7000 
          ? 'Your burn rate is high. NYC move requires aggressive cost cutting or selling assets.'
          : 'Manhattan rent ($4.5k) will strain cash flow. Consider selling 10% NVDA for 2-year runway.'
      },
      simulationRunway,
      taxSavings: 1250.40,
      harvestableLoss: 4250.00,
      taxReports: {
        fbar: {
          status: 'Ready',
          maxBalances: [
            { institution: 'Cathay United', account: '...8821', maxValueTWD: 2450000, maxValueUSD: 74581.43 },
            { institution: 'E.SUN Bank', account: '...1029', maxValueTWD: 120500, maxValueUSD: 3668.18 }
          ]
        },
        ftc: {
          status: 'Action Required',
          estimatedCredit: 420.50,
          description: 'Foreign taxes paid on 0050 dividends can be claimed via Form 1116.'
        }
      },
      taxDeadlines: [
        { date: '2026-04-15', title: 'US Federal Tax Return', status: 'Upcoming', priority: 'CRITICAL' },
        { date: '2026-05-31', title: 'Taiwan Income Tax', status: 'Upcoming', priority: 'HIGH' },
        { date: '2026-06-30', title: 'FBAR Filing Deadline', status: 'Upcoming', priority: 'CRITICAL' },
        { date: '2026-10-15', title: 'US Extension Deadline', status: 'Future', priority: 'MEDIUM' }
      ],
      taxComplianceScore: 78,
      strategy: {
        title: 'Q2 Cross-Border Liquidity Plan',
        summary: 'Your current position is strong but over-concentrated in US tech. We recommend a phased diversification into TWD-denominated yield assets while maintaining USD growth exposure.',
        pillars: [
          {
            title: 'Tax-Loss Harvesting',
            description: 'Realize $4,250 in losses from 0050 to offset upcoming US dividend taxes.',
            action: 'Minion: Execute 0050 Sell Order',
            impact: 'HIGH'
          },
          {
            title: 'Currency Hedge',
            description: 'USD/TWD is at a local peak. Lock in 20% of your TWD needs for the next 6 months.',
            action: 'Minion: Convert $10k to TWD',
            impact: 'MEDIUM'
          },
          {
            title: 'Yield Optimization',
            description: 'Move idle cash from Chase (0.01%) to SoFi (4.60%) or Taiwan High-Yield Savings.',
            action: 'Minion: Transfer $5k to SoFi',
            impact: 'HIGH'
          }
        ],
        riskLevel: 'MEDIUM',
        nextReviewDate: '2026-04-15',
        generatedAt: new Date().toISOString()
      },
      offers,
      minionTasks,
      lastSync: new Date().toISOString()
    });
  });

  app.post("/api/minion/execute", (req, res) => {
    const { instruction } = req.body;
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'WEALTH_ACTION',
      status: 'EXECUTING',
      instruction,
      result: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    minionTasks.unshift(newTask);
    
    // Simulate execution
    setTimeout(() => {
      const taskIndex = minionTasks.findIndex(t => t.id === newTask.id);
      if (taskIndex !== -1) {
        minionTasks[taskIndex].status = 'COMPLETED';
        minionTasks[taskIndex].result = `Successfully processed: ${instruction}. Applied to sandbox state.`;
        minionTasks[taskIndex].updatedAt = new Date().toISOString();
      }
    }, 3000);
    
    res.json(newTask);
  });

  app.get("/api/minion/tasks", (req, res) => {
    res.json(minionTasks);
  });

  app.get("/api/accounts", async (req, res) => {
    const currentAccounts = await getAccounts();
    res.json(currentAccounts);
  });

  app.get("/api/transactions", async (req, res) => {
    const currentTransactions = await getTransactions();
    res.json(currentTransactions);
  });

  app.post('/api/plaid_disconnect', (req, res) => {
    accessToken = null;
    res.json({ success: true });
  });

  app.post('/api/create_link_token', async (req, res) => {
    try {
      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: 'user-id' },
        client_name: 'Liminality',
        products: [Products.Transactions, Products.Investments],
        country_codes: [CountryCode.Us],
        language: 'en',
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error creating link token:', error);
      res.status(500).json({ error: 'Failed to create link token' });
    }
  });

  app.post('/api/exchange_public_token', async (req, res) => {
    const { public_token } = req.body;
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token,
      });
      accessToken = response.data.access_token;
      res.json({ success: true });
    } catch (error) {
      console.error('Error exchanging public token:', error);
      res.status(500).json({ error: 'Failed to exchange public token' });
    }
  });

  app.get('/api/plaid_status', (req, res) => {
    res.json({ connected: !!accessToken });
  });

  app.post("/api/sync", async (req, res) => {
    try {
      if (accessToken) {
        // Triggering the helper functions will fetch fresh data from Plaid
        await getAccounts();
        await getTransactions();
        res.json({ success: true, message: "Assets synchronized with Plaid and global providers." });
      } else {
        res.json({ success: true, message: "Sync complete. (No Plaid account connected, using local data)" });
      }
    } catch (error) {
      console.error('Sync error:', error);
      res.status(500).json({ error: 'Failed to synchronize data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Liminality server running on http://localhost:${PORT}`);
  });
}

startServer();
