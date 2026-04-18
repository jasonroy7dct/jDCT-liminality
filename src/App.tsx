import React, { useEffect, useState } from 'react';
import { encryptData, decryptData } from './lib/encryption';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRightLeft,
  AlertCircle,
  LayoutDashboard,
  Wallet,
  PieChart as PieChartIcon,
  Settings,
  History,
  Plus,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  X,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Search,
  Filter,
  Download,
  Building2,
  Menu,
  ChevronLeft,
  Lock,
  Camera,
  AlertTriangle,
  Compass,
  Target,
  Calendar,
  User,
  Cloud,
  LogOut,
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Edit2,
  FileText,
  Maximize2,
  GripVertical,
  Check,
  Languages,
  Activity,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardData, Account, Transaction, MinionTask, SandboxState, StrategyPillar, TaxDeadline } from './types';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { usePlaidLink } from 'react-plaid-link';
import ReactMarkdown from 'react-markdown';
import { MinionCommandCenter } from './components/MinionCommandCenter';
import { SandboxBanner } from './components/SandboxBanner';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { getInstitutionLogo } from './lib/logos';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  FirebaseUser, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { GoogleDriveService } from './lib/googleDrive';
import { translations } from './translations';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const InstitutionLogo = ({ src, name, className = "w-10 h-10" }: { src?: string, name: string, className?: string }) => {
  const [error, setError] = useState(false);
  
  // If src looks like a domain (no http/https and contains a dot), treat it as a domain for the favicon API
  const isDomain = src && !src.startsWith('http') && src.includes('.');
  const logoUrl = isDomain 
    ? `https://www.google.com/s2/favicons?domain=${src}&sz=128` 
    : (src || getInstitutionLogo(name));
  
  if (error) {
    const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <div className={`${className} bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 flex items-center justify-center rounded-xl border border-gray-200/50 shadow-inner`}>
        <span className="text-xs font-bold text-gray-400">{firstLetter}</span>
      </div>
    );
  }
  
  return (
    <div className={`${className} rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100 shadow-sm`}>
      <img 
        src={logoUrl} 
        alt={name} 
        className="w-full h-full object-contain p-1.5" 
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    </div>
  );
};

type Tab = 'dashboard' | 'accounts' | 'transactions' | 'tax' | 'settings' | 'strategy' | 'simulator' | 'history';

const COLORS = ['#0052CC', '#00A3C4', '#24292F'];
const FX_RATE = 32.85;

const AccountListItem = ({ 
  account, 
  selectedAccount, 
  setSelectedAccount, 
  selectedAccountIds, 
  handleToggleSelectAccount, 
  displayCurrency,
  formatCurrency,
  t
}: { 
  account: Account, 
  selectedAccount: string | null, 
  setSelectedAccount: (id: string | null) => void, 
  selectedAccountIds: string[], 
  handleToggleSelectAccount: (id: string, e: React.MouseEvent) => void,
  displayCurrency: string,
  formatCurrency: (amount: number, currency?: string) => string,
  t: (key: string) => string
}) => {
  const dragControls = useDragControls();
  return (
    <Reorder.Item 
      key={account.id} 
      value={account.id}
      layoutId={`account-${account.id}`}
      dragListener={false}
      dragControls={dragControls}
      onClick={() => setSelectedAccount(account.id)}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className={`glass-card p-5 cursor-pointer transition-all relative overflow-hidden group ${
        selectedAccount === account.id ? 'border-plaid-blue ring-2 ring-plaid-blue/10 bg-plaid-blue/[0.02]' : 'hover:border-gray-300'
      }`}
    >
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
        <div 
          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
            selectedAccountIds.includes(account.id) 
              ? 'bg-plaid-blue border-plaid-blue' 
              : 'bg-white border-gray-200 group-hover:border-gray-300'
          }`}
          onClick={(e) => handleToggleSelectAccount(account.id, e)}
        >
          {selectedAccountIds.includes(account.id) && <Check className="w-3 h-3 text-white" />}
        </div>
        <div 
          className="p-1 text-gray-300 group-hover:text-gray-400 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      {selectedAccount === account.id && (
        <motion.div 
          layoutId="active-account-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-plaid-blue"
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <InstitutionLogo 
            src={account.logo} 
            name={account.institution} 
            className={`w-10 h-10 ${selectedAccount === account.id ? 'ring-2 ring-white/20' : ''}`} 
          />
          <div>
            <h4 className="text-sm font-bold text-cool-gray">{account.name}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{account.institution}</p>
          </div>
        </div>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
          account.type === 'Investment' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {account.type}
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-cool-gray tracking-tight">{formatCurrency(account.balance, account.currency)}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayCurrency}</span>
      </div>
    </Reorder.Item>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [firestoreAccounts, setFirestoreAccounts] = useState<Account[]>([]);
  const [apiAccounts, setApiAccounts] = useState<Account[]>([]);
  const [firestoreTransactions, setFirestoreTransactions] = useState<Transaction[]>([]);
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);

  const [accountMode, setAccountMode] = useState<'hybrid' | 'manual'>('hybrid');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [accountOrder, setAccountOrder] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [accountTimeRange, setAccountTimeRange] = useState<'1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');

  const t = (key: keyof typeof translations['en']) => translations[language][key as any] || key;

  useEffect(() => {
    if (firestoreAccounts.length > 0 && accountOrder.length === 0) {
      setAccountOrder(firestoreAccounts.map(a => a.id));
    }
  }, [firestoreAccounts]);

  const handleToggleSelectAccount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAccountIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const accounts = React.useMemo(() => {
    // Get active firestore accounts (not marked as deleted)
    const activeFirestore = firestoreAccounts.filter(a => !(a as any).deleted);
    
    // Apply custom order if available
    const orderedFirestore = [...activeFirestore].sort((a, b) => {
      const indexA = accountOrder.indexOf(a.id);
      const indexB = accountOrder.indexOf(b.id);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
    
    if (accountMode === 'manual') {
      return orderedFirestore;
    }

    const combined = [...orderedFirestore];
    
    // Add API accounts only if they don't have a firestore override (including a deletion marker)
    apiAccounts.forEach(acc => {
      if (!firestoreAccounts.find(a => a.id === acc.id)) {
        combined.push(acc);
      }
    });
    return combined;
  }, [firestoreAccounts, apiAccounts, accountMode, accountOrder]);

  const transactions = React.useMemo(() => {
    const combined = [...firestoreTransactions];
    apiTransactions.forEach(tx => {
      if (!combined.find(t => t.id === tx.id)) {
        combined.push(tx);
      }
    });
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [firestoreTransactions, apiTransactions]);

  const dashboardData = React.useMemo(() => {
    if (!data) return null;
    
    const usdCash = accounts.filter(a => a.currency === 'USD' && (a.type === 'Checking' || a.type === 'Savings' || a.type === 'Cash')).reduce((sum, a) => sum + a.balance, 0);
    const twdCash = accounts.filter(a => a.currency === 'TWD' && (a.type === 'Checking' || a.type === 'Savings' || a.type === 'Cash')).reduce((sum, a) => sum + a.balance, 0);
    const equities = accounts.filter(a => a.type === 'Investment').reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.type === 'Credit Card').reduce((sum, a) => sum + a.balance, 0);
    
    const totalRaw = usdCash + (twdCash / FX_RATE) + equities - liabilities;
    const taxDrag = (equities * 0.15) + (twdCash / FX_RATE * 0.05); 
    const totalPurchasingPower = Math.max(0, totalRaw - taxDrag);
    
    // Simple trend generation if not provided by API
    const trend = data.totalPurchasingPowerTrend || Array.from({ length: 10 }, (_, i) => {
      const base = totalPurchasingPower * 0.95;
      return base + (totalPurchasingPower * 0.05 * (i / 9));
    });

    return {
      ...data,
      totalRaw,
      totalPurchasingPower,
      totalPurchasingPowerTrend: trend,
      usdCash,
      twdCash,
      crossBorderEquities: equities,
      wealthHealthFactors: [
        { label: t('liquidity'), score: Math.min(100, Math.floor(usdCash / 500)), status: t('excellent') },
        { label: t('taxEfficiency'), score: 62, status: t('needsWork') },
        { label: t('diversification'), score: 78, status: t('good') },
        { label: t('runway'), score: Math.min(100, Math.floor(totalPurchasingPower / 5000)), status: t('strong') }
      ]
    };
  }, [data, accounts, FX_RATE]);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showTaxExecutionModal, setShowTaxExecutionModal] = useState(false);
  const [showFBARModal, setShowFBARModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simScenario, setSimScenario] = useState<'US_TO_TW' | 'TW_TO_US'>('US_TO_TW');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | string[], type: 'single' | 'bulk' } | null>(null);

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm || !user) return;
    
    try {
      const idsToDelete = Array.isArray(deleteConfirm.id) ? deleteConfirm.id : [deleteConfirm.id];
      
      for (const id of idsToDelete) {
        const isApiAccount = apiAccounts.some(a => a.id === id);
        const isFirestoreAccount = firestoreAccounts.some(a => a.id === id);

        if (isApiAccount) {
          // For API accounts, we "hide" them by creating a deletion marker in Firestore
          await setDoc(doc(db, 'users', user.uid, 'accounts', id), {
            deleted: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else if (isFirestoreAccount) {
          // For pure Firestore accounts, delete the document
          await deleteDoc(doc(db, 'users', user.uid, 'accounts', id));
        }
      }
      
      if (Array.isArray(deleteConfirm.id)) {
        setSelectedAccountIds([]);
      } else if (selectedAccount === deleteConfirm.id) {
        setSelectedAccount(null);
      }
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };
  const [taxResidencyStatus, setTaxResidencyStatus] = useState<'NRA' | 'RA' | 'H1B' | 'F1_OPT' | 'Dual_Status'>(() => (localStorage.getItem('tax_residency_status') as any) || 'H1B');
  const [residencyHistory, setResidencyHistory] = useState<{ year: number; status: string; daysInUS: number }[]>(() => {
    try {
      const saved = localStorage.getItem('residency_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [taxTopActions, setTaxTopActions] = useState<StrategyPillar[]>([]);

  const getTaxActions = (data: DashboardData, accounts: Account[]): StrategyPillar[] => {
    const actions: StrategyPillar[] = [];
    const isH1B = taxResidencyStatus === 'H1B';
    const isNRA = taxResidencyStatus === 'NRA';
    const twAssetsUSD = data.jurisdictionBreakdown?.tw.total || 0;
    const hasTaiwanStocks = accounts.some(a => a.currency === 'TWD' && a.type === 'Investment');

    if (twAssetsUSD > 10000) {
      actions.push({
        title: t('fbarComplianceLong'),
        description: t('fbarComplianceDesc'),
        action: t('reviewAndExecute'),
        impact: 'HIGH',
        type: 'COMPLIANCE',
        reason: t('fbarMandatoryNotice').replace('{amount}', formatCurrency(twAssetsUSD))
      });
    }

    if (hasTaiwanStocks && !isNRA) {
      actions.push({
        title: t('foreignTaxCredit'),
        description: t('ftcDesc'),
        action: t('reviewAndExecute'),
        impact: 'MEDIUM',
        type: 'STRATEGY',
        reason: t('ftcExplanation')
      });
    }

    if (isH1B) {
      actions.push({
        title: t('exitTaxPlanning'),
        description: t('exitTaxDesc'),
        action: t('reviewAndExecute'),
        impact: 'HIGH',
        type: 'STRATEGY',
        reason: t('exitTaxPlanning')
      });
    }

    if (data.usdCash > 50000 && twAssetsUSD > 100000) {
      actions.push({
        title: t('amtOptimizationLabel') || t('amtOptimization'),
        description: t('amtOptimizationDesc'),
        action: t('reviewAndExecute'),
        impact: 'MEDIUM',
        type: 'STRATEGY',
        reason: t('amtOptimizationLong') || t('amtOptimization')
      });
    }

    return actions.sort((a, b) => b.impact === 'HIGH' ? 1 : -1).slice(0, 3);
  };

  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'TWD'>('USD');
  const [isAccountChatLoading, setIsAccountChatLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [completedDeadlines, setCompletedDeadlines] = useState<string[]>([]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('liminality_currency') as 'USD' | 'TWD';
    if (savedCurrency) setDisplayCurrency(savedCurrency);
    
    const savedDeadlines = localStorage.getItem('completed_deadlines');
    if (savedDeadlines) {
      try {
        setCompletedDeadlines(JSON.parse(savedDeadlines));
      } catch (e) {
        console.error('Failed to parse completed_deadlines', e);
      }
    }
  }, []);

  const handleToggleDeadline = async (id: string) => {
    const next = completedDeadlines.includes(id) 
      ? completedDeadlines.filter(i => i !== id) 
      : [...completedDeadlines, id];
    
    setCompletedDeadlines(next);
    localStorage.setItem('completed_deadlines', JSON.stringify(next));

    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        completedDeadlines: next
      });
    }
  };

  const [masterKey, setMasterKey] = useState<string>(localStorage.getItem('liminality_master_key') || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [showOCRSuccess, setShowOCRSuccess] = useState(false);
  const [showSmartOffer, setShowSmartOffer] = useState(false);
  const [minionTasks, setMinionTasks] = useState<MinionTask[]>([]);
  const [sandbox, setSandbox] = useState<SandboxState | null>(null);
  
  // AI Chat State for Accounts Page
  const [accountChatHistory, setAccountChatHistory] = useState<{role: 'user' | 'model', content: string}[]>(() => {
    try {
      const saved = localStorage.getItem('liminality_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [accountChatInput, setAccountChatInput] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;
  const paginatedHistory = accountChatHistory.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const totalPages = Math.ceil(accountChatHistory.length / pageSize);
  const [showAccountChat, setShowAccountChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(true);

  useEffect(() => {
    localStorage.setItem('liminality_chat_history', JSON.stringify(accountChatHistory));
  }, [accountChatHistory]);
  
  // Google Drive Sync State
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(localStorage.getItem('google_access_token'));
  const [isGoogleConnected, setIsGoogleConnected] = useState(!!localStorage.getItem('google_access_token'));
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [googleDriveError, setGoogleDriveError] = useState<string | null>(null);
  const [lastGoogleSync, setLastGoogleSync] = useState<string | null>(localStorage.getItem('last_google_sync'));

  // FX_RATE moved to top level

    const formatCurrency = (val: number, currency?: string, forceCurrency?: string) => {
    const targetCurrency = forceCurrency || displayCurrency;
    let finalVal = val;
    
    // If currency is provided, it means 'val' is in that specific currency.
    // We need to convert it to the targetCurrency.
    if (currency) {
      if (currency === 'USD' && targetCurrency === 'TWD') {
        finalVal = val * FX_RATE;
      } else if (currency === 'TWD' && targetCurrency === 'USD') {
        finalVal = val / FX_RATE;
      } else if (currency !== targetCurrency) {
        // Fallback for other currencies if needed
        const valInUSD = currency === 'HKD' ? val / 7.8 : currency === 'JPY' ? val / 150 : val;
        finalVal = targetCurrency === 'TWD' ? valInUSD * FX_RATE : valInUSD;
      }
    } else {
      // If no currency is provided, assume 'val' is already in USD basis
      if (targetCurrency === 'TWD') {
        finalVal = val * FX_RATE;
      }
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      maximumFractionDigits: targetCurrency === 'TWD' ? 0 : 2
    }).format(finalVal);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    (window as any).seedInitialData = seedInitialData;

    // Listen to accounts
    const unsubAccounts = onSnapshot(collection(db, 'users', user.uid, 'accounts'), (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Account));
      setFirestoreAccounts(accs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/accounts`));

    // Listen to transactions
    const unsubTransactions = onSnapshot(query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'), limit(50)), (snapshot) => {
      const trxs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      setFirestoreTransactions(trxs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/transactions`));

    // Listen to tasks
    const unsubTasks = onSnapshot(query(collection(db, 'users', user.uid, 'minionTasks'), orderBy('createdAt', 'desc'), limit(10)), (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MinionTask));
      setMinionTasks(tasks);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/minionTasks`));

    // Listen to sandbox
    const unsubSandbox = onSnapshot(doc(db, 'users', user.uid, 'sandboxState', 'current'), (snapshot) => {
      if (snapshot.exists()) {
        setSandbox(snapshot.data() as SandboxState);
      } else {
        setSandbox({ isActive: false });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/sandboxState/current`));

    // Listen to user profile
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setData(prev => ({ ...prev, ...userData } as DashboardData));
        if (userData.userName) setUserName(userData.userName);
        if (userData.displayCurrency) setDisplayCurrency(userData.displayCurrency);
        if (userData.completedDeadlines) setCompletedDeadlines(userData.completedDeadlines);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    return () => {
      unsubAccounts();
      unsubTransactions();
      unsubTasks();
      unsubSandbox();
      unsubProfile();
    };
  }, [user]);

  // Dynamic Dashboard Data Calculation
  useEffect(() => {
    if (!user) return;

    const convertToUSD = (balance: number, currency: string) => {
      if (currency === 'USD') return balance;
      if (currency === 'TWD') return balance / FX_RATE;
      // For other currencies, we'd need more rates, but for now let's handle the main ones
      if (currency === 'HKD') return balance / 7.8;
      if (currency === 'JPY') return balance / 150;
      return balance;
    };

    const usdCash = accounts
      .filter(a => a.currency === 'USD' && (a.type === 'Cash' || a.type === 'Checking' || a.type === 'Savings'))
      .reduce((sum, a) => sum + a.balance, 0);
      
    const twdCash = accounts
      .filter(a => a.currency === 'TWD' && (a.type === 'Cash' || a.type === 'Checking' || a.type === 'Savings'))
      .reduce((sum, a) => sum + a.balance, 0);

    const equitiesUSD = accounts
      .filter(a => a.type === 'Investment')
      .reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);

    const liabilitiesUSD = accounts
      .filter(a => a.type === 'Credit Card')
      .reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    
    const TWD_RATE = FX_RATE;
    const totalRaw = usdCash + (twdCash / TWD_RATE) + equitiesUSD - liabilitiesUSD;
    
    // Estimated tax drag: 15% on investments, 5% on foreign cash
    const taxDrag = (equitiesUSD * 0.15) + (twdCash / TWD_RATE * 0.05); 
    const totalPurchasingPower = Math.max(0, totalRaw - taxDrag);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const monthlyBurn = transactions
      .filter(t => t.amount < 0 && new Date(t.date) > thirtyDaysAgo)
      .reduce((sum, t) => sum + Math.abs(t.currency === 'TWD' ? t.amount / TWD_RATE : t.amount), 0);

    const allocation = [
      { name: 'USD Cash', value: usdCash },
      { name: 'TWD Cash (Adj)', value: (twdCash / TWD_RATE) * 0.95 },
      { name: 'Investments', value: equitiesUSD },
    ];

    // Deterministic Wealth Health Score Calculation
    const liquidityScore = Math.min(100, Math.floor((usdCash + (twdCash / TWD_RATE)) / 20000 * 100));
    const diversificationScore = equitiesUSD > 0 ? Math.min(100, Math.floor((equitiesUSD / totalRaw) * 200)) : 40;
    const runwayScore = Math.min(100, Math.floor((totalPurchasingPower / (monthlyBurn || 5500)) / 12 * 100));
    
    const wealthHealthScore = Math.floor((liquidityScore * 0.4) + (diversificationScore * 0.3) + (runwayScore * 0.3));

    const getJurisdiction = (a: any) => {
      const twInstitutions = ['Cathay', 'E.SUN', 'Fubon', 'CTBC', 'Taishin', 'Mega', 'Taiwan'];
      if (twInstitutions.some(tw => a.institution?.includes(tw)) || a.currency === 'TWD') return 'TW';
      return 'US';
    };

    // Jurisdiction Breakdown Calculation (All stored in USD basis internally for consistency)
    const usAssetsUSD = accounts.filter(a => getJurisdiction(a) === 'US').reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    const twAssetsUSD = accounts.filter(a => getJurisdiction(a) === 'TW').reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    
    const isLiquid = (type: string) => ['cash', 'checking', 'savings'].includes(type.toLowerCase());
    const isInvestment = (type: string) => ['investment', 'brokerage', 'equity'].includes(type.toLowerCase());

    const usLiquidUSD = accounts.filter(a => getJurisdiction(a) === 'US' && isLiquid(a.type)).reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    const usInvestedUSD = accounts.filter(a => getJurisdiction(a) === 'US' && isInvestment(a.type)).reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    
    const twLiquidUSD = accounts.filter(a => getJurisdiction(a) === 'TW' && isLiquid(a.type)).reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);
    const twInvestedUSD = accounts.filter(a => getJurisdiction(a) === 'TW' && isInvestment(a.type)).reduce((sum, a) => sum + convertToUSD(a.balance, a.currency), 0);

    const usRatio = totalRaw > 0 ? (usAssetsUSD / totalRaw) * 100 : 0;

    // Top 3 Strategic Actions Engine - Hardened for Decision Making
    const investmentLosses = transactions
      .filter(t => t.category === 'Investment' && t.amount < 0 && new Date(t.date).getFullYear() === today.getFullYear())
      .reduce((sum, t) => sum + Math.abs(t.currency === 'TWD' ? t.amount / TWD_RATE : t.amount), 0);
    
    // Gain/Loss simulation for specific strategies
    const washSaleImpact = investmentLosses * 0.35; // Assuming aggressive short-term offset
    const ftcImpact = (twInvestedUSD * 0.04) * 0.21; // Est 4% dividend yield, 21% tax credit
    
    const fbarRequired = twAssetsUSD > 10000;
    const fatcaRequired = totalRaw > (taxResidencyStatus === 'RA' ? 50000 : 200000);

    const generatedActions: StrategyPillar[] = [];
    
    // Priority 1: High Risk Compliance
    if (fbarRequired) {
      generatedActions.push({ 
        title: 'File FBAR (FinCEN 114)', 
        reason: taxResidencyStatus === 'NRA' 
          ? 'As an NRA, you are generally exempt UNLESS you also hold RA status in the same year. Review your specific days-in-US.' 
          : 'Aggregate foreign balance exceeds $10,000. Failure to file can result in penalties up to $10,000 per violation.', 
        impact: 'HIGH', 
        type: 'COMPLIANCE',
        action: 'Generate Draft'
      });
    }

    if (taxResidencyStatus === 'H1B') {
      generatedActions.push({
        title: 'Form 8833 Treaty Election',
        reason: 'H-1B holders paying Taiwan tax on dividends/bonuses can often claim treaty benefits to reduce US double taxation. Verify your eligibility for the US-Taiwan tax agreement.',
        impact: 'HIGH',
        type: 'STRATEGY',
        action: 'Read Guide'
      });
    }

    // Priority 2: High Value Strategy
    if (investmentLosses > 2000) {
      generatedActions.push({ 
        title: 'Execute Wash Sale Harvesting', 
        reason: `Identified substantial realizable losses. Offset your US capital gains to save an estimated ${formatCurrency(washSaleImpact)}.`, 
        impact: 'HIGH', 
        type: 'STRATEGY',
        action: 'View Execution'
      });
    } else if (ftcImpact > 500) {
      generatedActions.push({ 
        title: 'Claim Foreign Tax Credit', 
        reason: `You've paid taxes in Taiwan on dividends. Reclaim an estimated ${formatCurrency(ftcImpact)} against your US liability.`, 
        impact: 'MEDIUM', 
        type: 'STRATEGY',
        action: 'Apply Credit'
      });
    }

    // Priority 3: Optimization/Yield
    if (usRatio < 25) {
      generatedActions.push({ 
        title: 'Jurisdictional Rebalancing', 
        reason: 'Portfolio heavily weighted in TWD (over 75%). Potential currency risk if USD strengthens.', 
        impact: 'MEDIUM', 
        type: 'ALLOCATION',
        action: 'Rebalance'
      });
    } else if (taxResidencyStatus === 'NRA') {
      generatedActions.push({ 
        title: 'Update W-8BEN Status', 
        reason: 'Nearing expiration. Renew to maintain lower treaty rate on US dividends.', 
        impact: 'HIGH', 
        type: 'COMPLIANCE',
        action: 'Update Form'
      });
    }

    // Fallback
    if (generatedActions.length < 3) {
      generatedActions.push({ 
        title: 'Review Treasury Yields', 
        reason: 'US Cash reserves could earn higher yield via 3-month T-Bills given current rates.', 
        impact: 'LOW', 
        type: 'YIELD',
        action: 'Analyze Yield'
      });
    }
    
    setTaxTopActions(generatedActions.slice(0, 3));

    // Calculate real 30-day trend
    const trendData: number[] = [];
    let runningBalance = totalPurchasingPower;
    const sortedTransactions = [...transactions]
      .filter(t => new Date(t.date) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Initialize trend with current balance
    trendData.push(runningBalance);

    // Work backwards for 30 days
    for (let i = 1; i < 30; i++) {
      const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      
      const daysTransactions = sortedTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= day && tDate < dayEnd;
      });

      const netChange = daysTransactions.reduce((sum, t) => {
        const amountUSD = t.currency === 'TWD' ? t.amount / TWD_RATE : t.amount;
        return sum + amountUSD;
      }, 0);

      runningBalance -= netChange;
      trendData.unshift(runningBalance);
    }

    const taxSavings = washSaleImpact + ftcImpact + (totalRaw * 0.002);
    const taxComplianceScore = Math.max(0, 100 - (fbarRequired ? 15 : 0) - (fatcaRequired ? 20 : 0) - (accounts.length === 0 ? 30 : 0));

    // Dynamic Tax Deadlines for 2026 (current date: April 17, 2026)
    const activeDeadlines: (TaxDeadline & { id: string })[] = [
      { id: 'irs_return', title: t('irsReturn'), date: '2026-04-15', status: completedDeadlines.includes('irs_return') ? 'COMPLETED' : 'OVERDUE', priority: 'CRITICAL' as const },
      { id: 'q2_est', title: t('q2Estimated'), date: '2026-06-15', status: completedDeadlines.includes('q2_est') ? 'COMPLETED' : 'UPCOMING', priority: 'HIGH' as const },
      { id: 'fbar_oct', title: t('fbarDeadline'), date: '2026-10-15', status: completedDeadlines.includes('fbar_oct') ? 'COMPLETED' : 'UPCOMING', priority: 'CRITICAL' as const },
      { id: 'tw_tax', title: t('twIncomeTax'), date: '2026-05-31', status: completedDeadlines.includes('tw_tax') ? 'COMPLETED' : 'UPCOMING', priority: 'HIGH' as const },
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const newData: DashboardData = {
      totalRaw,
      totalPurchasingPower,
      totalPurchasingPowerTrend: trendData,
      usdCash,
      usCash: usdCash,
      twdCash,
      investmentLosses,
      crossBorderEquities: equitiesUSD,
      allocation,
      wealthHealthScore,
      taxHarvesting: {
        opportunityFound: investmentLosses > 1000,
        targetAsset: investmentLosses > 1000 ? "Unrealized Losses" : "None",
        offsetAsset: "Future Gains",
        estimatedSavings: washSaleImpact,
        description: `Potential savings of ${formatCurrency(washSaleImpact)} identified via selective divestment.`
      },
      taxSavings,
      harvestableLoss: investmentLosses,
      taxComplianceScore,
      taxDeadlines: activeDeadlines,
      taxReports: {
        fbar: {
          status: fbarRequired ? 'REQUIRED' : 'NOT REQUIRED',
          maxBalances: []
        },
        ftc: {
          status: twInvestedUSD > 0 ? 'OPTIMIZABLE' : 'N/A',
          estimatedCredit: ftcImpact,
          description: `Strategic credit potential based on ${taxResidencyStatus} profile.`
        },
        opportunities: generatedActions.length
      },
      wealthHealthFactors: [
        { label: t('liquidity'), score: liquidityScore, status: liquidityScore > 80 ? t('excellent') : liquidityScore > 50 ? t('good') : t('needsWork') },
        { label: t('diversification'), score: diversificationScore, status: diversificationScore > 70 ? t('good') : t('concentrated') || 'Concentrated' },
        { label: t('runway'), score: runwayScore, status: runwayScore > 80 ? t('strong') : t('critical') }
      ],
      jurisdictionBreakdown: {
        us: { total: usAssetsUSD, liquid: usLiquidUSD, invested: usInvestedUSD },
        tw: { total: twAssetsUSD, liquid: twLiquidUSD, invested: twInvestedUSD }
      },
      lastSync: new Date().toISOString(),
      stressTest: {
        runwayMonths: Math.floor(totalPurchasingPower / (monthlyBurn || 5500)),
        monthlyBurn: monthlyBurn || 5500,
        soulDepreciationRate: (monthlyBurn || 5500) > 8000 ? 0.25 : (monthlyBurn || 5500) > 5000 ? 0.15 : 0.08,
        status: (totalPurchasingPower / (monthlyBurn || 5500) < 6) ? 'Danger' : (totalPurchasingPower / (monthlyBurn || 5500) < 12) ? 'Warning' : 'Safe',
        recommendation: (monthlyBurn || 5500) > 7000 
          ? t('burnRateHigh') || 'Your burn rate is high. NYC move requires aggressive cost cutting or selling assets.'
          : totalPurchasingPower / (monthlyBurn || 5500) < 12
          ? (t('rentStrain') || `Manhattan rent ($4.5k) will strain cash flow. Current runway is {months} months.`).replace('{months}', String(Math.floor(totalPurchasingPower / (monthlyBurn || 5500))))
          : t('financialStrong') || "Your financial position is strong enough to support a Manhattan lifestyle for over a year."
      },
      jurisdictionInsight: {
        usRatio,
        recommendation: usRatio > 70 
          ? `Your wealth is currently ${usRatio.toFixed(0)}% US-based. Consider re-balancing to Taiwan-domiciled assets to optimize for tax efficiency.`
          : `Your wealth is well-balanced across jurisdictions (${usRatio.toFixed(0)}% US-based).`
      },
      offers: (data?.offers && data.offers.length > 0) ? data.offers : [
        {
          id: 'sofi-1',
          title: 'High-Yield Savings',
          description: 'Earn 4.60% APY with SoFi. Perfect for your USD cash reserves.',
          link: 'https://www.sofi.com/banking/',
          provider: 'SoFi',
          commissionEstimate: 50
        },
        {
          id: 'schwab-1',
          title: 'International Brokerage',
          description: 'Zero commission trading for global citizens.',
          link: 'https://www.schwab.com/international',
          provider: 'Charles Schwab',
          commissionEstimate: 0
        }
      ],
      minionInsights: data?.minionInsights || [],
      minionTasks: data?.minionTasks || [],
      forexSignals: data?.forexSignals || [],
      strategy: data?.strategy,
      sandbox: data?.sandbox
    };

    setShowSmartOffer(usdCash > 15000);

    // Deep compare to avoid unnecessary state updates that cause flickering
    const hasChanged = !data || 
        JSON.stringify(data.jurisdictionBreakdown) !== JSON.stringify(newData.jurisdictionBreakdown) || 
        data.wealthHealthScore !== newData.wealthHealthScore ||
        Math.abs(data.totalPurchasingPower - newData.totalPurchasingPower) > 1 ||
        data.totalRaw !== newData.totalRaw;

    if (hasChanged) {
      setData(prev => ({ ...prev, ...newData }));
    }
  }, [user, firestoreAccounts, firestoreTransactions, accounts, transactions]);

  // Google OAuth Message Listener (Removed custom flow listener)
  
  // Auto-sync every 5 minutes if connected
  useEffect(() => {
    if (!isGoogleConnected || !googleAccessToken) return;
    
    const interval = setInterval(() => {
      syncWithGoogleDrive();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isGoogleConnected, googleAccessToken, firestoreAccounts, firestoreTransactions, data]);

  const [simRent, setSimRent] = useState(4500);
  const [simSalary, setSimSalary] = useState(8000);
  const [simReturn, setSimReturn] = useState(0.07);
  const [simLifestyle, setSimLifestyle] = useState(1.5); // 1.0 = Frugal, 2.0 = Lavish

  const monthlyBurn = simRent + (2000 * simLifestyle);
  const calculatedRunway = data ? Math.floor(data.totalPurchasingPower / Math.max(1, monthlyBurn - simSalary)) : 0;
  const isSustainable = simSalary > monthlyBurn;

  const simulationData = React.useMemo(() => {
    if (!data) return [];
    let balance = data.totalPurchasingPower;
    const monthlyIncome = simSalary;
    const results = [];
    for (let i = 0; i < 24; i++) {
      balance = balance + monthlyIncome - monthlyBurn + (balance * (simReturn / 12));
      results.push({
        month: `M${i + 1}`,
        balance: Math.max(0, Math.floor(balance))
      });
      if (balance <= 0) break;
    }
    return results;
  }, [data, simRent, simSalary, simReturn, monthlyBurn]);

  const soulDepreciation = React.useMemo(() => {
    const workStress = simSalary / 15000; // More salary usually means more stress
    const financialStress = monthlyBurn / (simSalary || 1);
    const baseDepreciation = (financialStress * 30) + (workStress * 10);
    return Math.min(100, Math.max(0, baseDepreciation)).toFixed(1);
  }, [simSalary, monthlyBurn]);

  const generateNewInsights = async () => {
    if (!user || isGeneratingInsights) return;
    setIsGeneratingInsights(true);
    try {
      const prompt = `
        You are "Minion Intelligence", a cross-border financial AI.
        Analyze the following financial data for a user who has assets in both the US and Taiwan.
        
        Current Accounts: ${JSON.stringify(accounts.map(a => ({ name: a.name, balance: a.balance, currency: a.currency, type: a.type })))}
        Recent Transactions: ${JSON.stringify(transactions.slice(0, 10).map(t => ({ desc: t.description, amount: t.amount, currency: t.currency })))}
        Current Exchange Rate: 1 USD = ${FX_RATE} TWD
        
        Generate 3-4 actionable financial insights. 
        Each insight must have:
        - id: unique string
        - type: one of "TAX", "FOREX", "WEALTH"
        - title: short descriptive title
        - description: 1-2 sentences of advice
        - priority: one of "HIGH", "MEDIUM", "LOW"
        
        Return the result as a JSON array of objects.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["TAX", "FOREX", "WEALTH"] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] }
              },
              required: ["id", "type", "title", "description", "priority"]
            }
          }
        }
      });

      const newInsights = JSON.parse(response.text || '[]');
      
      setData(prev => prev ? { ...prev, minionInsights: newInsights } : null);
    } catch (err) {
      console.error('Failed to generate insights:', err);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const plaidRes = await fetch('/api/plaid_status');
      const plaidStatus = await plaidRes.json();
      setPlaidConnected(plaidStatus.connected);

      const [dashboardRes, accountsRes, transactionsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/accounts'),
        fetch('/api/transactions')
      ]);
      
      const dashboardData = await dashboardRes.json();
      const accountsData = await accountsRes.json();
      const transactionsData = await transactionsRes.json();
      
      setData(prev => ({ ...prev, ...dashboardData } as DashboardData));
      setApiAccounts(accountsData);
      setApiTransactions(transactionsData);
      
      if (dashboardData.minionTasks) {
        setMinionTasks(dashboardData.minionTasks);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithGoogleDrive = async (token?: string) => {
    const activeToken = token || googleAccessToken;
    if (!activeToken || !user) return;

    setIsGoogleSyncing(true);
    try {
      const gd = new GoogleDriveService(activeToken);
      const file = await gd.findDataFile();
      
      const appData = {
        profile: data,
        accounts: firestoreAccounts,
        transactions: firestoreTransactions,
        strategy: data?.strategy,
        minionTasks: minionTasks,
        displayCurrency: displayCurrency,
        lastUpdated: new Date().toISOString()
      };

      // Encrypt the data using user's UID or master key
      const encryptionKey = masterKey || user.uid;
      const encryptedPayload = await encryptData(JSON.stringify(appData), encryptionKey);
      const finalData = {
        version: '1.0',
        encrypted: true,
        protocol: 'AES-256-GCM',
        data: encryptedPayload
      };

      if (file) {
        await gd.updateFile(file.id, finalData);
      } else {
        await gd.createDataFile(finalData);
      }
      
      const now = new Date().toLocaleString();
      setLastGoogleSync(now);
      localStorage.setItem('last_google_sync', now);
    } catch (err) {
      console.error('Google Drive Sync failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('invalid authentication credentials') || errorMessage.includes('insufficient authentication scopes')) {
        setGoogleDriveError('Session expired or permissions missing. Please re-authorize Google Drive.');
        setIsGoogleConnected(false);
        setGoogleAccessToken(null);
        localStorage.removeItem('google_access_token');
      } else {
        setGoogleDriveError(`Sync failed: ${errorMessage}`);
      }
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const loadFromGoogleDrive = async (token?: string) => {
    const activeToken = token || googleAccessToken;
    if (!activeToken) return;
    setIsGoogleSyncing(true);
    try {
      const gd = new GoogleDriveService(activeToken);
      const file = await gd.findDataFile();
      if (file) {
        const rawData = await gd.readFile(file.id);
        let remoteData;

        if (rawData.encrypted && rawData.data) {
          // Decrypt the data
          const currentUserId = user?.uid || auth.currentUser?.uid;
          if (!currentUserId) throw new Error('User not authenticated');
          
          const encryptionKey = masterKey || currentUserId;
          const decryptedJson = await decryptData(rawData.data, encryptionKey);
          remoteData = JSON.parse(decryptedJson);
        } else {
          // Legacy unencrypted data
          remoteData = rawData;
        }
        
        // Update Firestore with remote data
        if (user || token) { // If token is provided, we might still be in handleLogin
          const currentUserId = user?.uid || auth.currentUser?.uid;
          if (currentUserId) {
            if (remoteData.accounts) {
              for (const acc of remoteData.accounts) {
                await setDoc(doc(db, 'users', currentUserId, 'accounts', acc.id), acc);
              }
            }
            if (remoteData.transactions) {
              for (const tx of remoteData.transactions) {
                await setDoc(doc(db, 'users', currentUserId, 'transactions', tx.id), tx);
              }
            }
            if (remoteData.strategy) {
              await setDoc(doc(db, 'users', currentUserId, 'strategy', 'current'), remoteData.strategy);
            }
            if (remoteData.profile) {
              await updateDoc(doc(db, 'users', currentUserId), remoteData.profile);
            }
            if (remoteData.displayCurrency) {
              setDisplayCurrency(remoteData.displayCurrency);
            }
            if (remoteData.minionTasks) {
              for (const task of remoteData.minionTasks) {
                await setDoc(doc(db, 'users', currentUserId, 'minionTasks', task.id), task);
              }
            }
          }
        }
        
        console.log('Data restored from Google Drive successfully!');
      } else {
        console.log('No backup file found on Google Drive.');
      }
    } catch (err) {
      console.error('Failed to load from Google Drive:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('invalid authentication credentials') || errorMessage.includes('insufficient authentication scopes')) {
        setGoogleDriveError('Session expired or permissions missing. Please re-authorize Google Drive.');
        setIsGoogleConnected(false);
        setGoogleAccessToken(null);
        localStorage.removeItem('google_access_token');
      } else {
        setGoogleDriveError(`Load failed: ${errorMessage}`);
      }
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      await fetch('/api/auth/google/disconnect', { method: 'POST' });
      setIsGoogleConnected(false);
      setGoogleAccessToken(null);
      localStorage.removeItem('google_access_token');
      localStorage.removeItem('last_google_sync');
      setLastGoogleSync(null);
    } catch (error) {
      console.error('Failed to disconnect Google:', error);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setGoogleDriveError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Extract Google Access Token for Drive sync
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        localStorage.setItem('google_access_token', credential.accessToken);
        setIsGoogleConnected(true);
        // Automatically restore data from Google Drive if it exists
        await loadFromGoogleDrive(credential.accessToken);
        await fetchData();
      }
      
      // Initialize user document if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL,
          displayCurrency: 'USD',
          plaidConnected: false,
          totalPurchasingPower: 0,
          wealthHealthScore: 0,
          completedDeadlines: []
        });

        // Seed initial accounts for demo
        const initialAccounts: any[] = [
          { name: 'Chase Sapphire', institution: 'Chase', balance: 12450.50, currency: 'USD', type: 'Checking', logo: getInstitutionLogo('Chase') },
          { name: 'Cathay United', institution: 'Cathay', balance: 350000, currency: 'TWD', type: 'Savings', logo: getInstitutionLogo('Cathay') },
          { name: 'Robinhood', institution: 'Robinhood', balance: 45200.00, currency: 'USD', type: 'Investment', logo: getInstitutionLogo('Robinhood') }
        ];

        for (const acc of initialAccounts) {
          await addDoc(collection(db, 'users', user.uid, 'accounts'), {
            ...acc,
            createdAt: new Date().toISOString()
          });
        }

        // Seed initial strategy
        await setDoc(doc(db, 'users', user.uid, 'strategy', 'current'), {
          title: 'q2LiquidityPlan',
          summary: 'q2StrategySummary',
          pillars: [
            {
              title: 'taxlossHarvesting',
              description: 'taxLossHarvestingLead',
              action: 'Minion: Execute 0050 Sell Order',
              impact: 'HIGH'
            },
            {
              title: 'currencyHedge',
              description: 'currencyHedgeLead',
              action: 'Minion: Convert $10k to TWD',
              impact: 'MEDIUM'
            }
          ],
          riskLevel: 'MEDIUM',
          nextReviewDate: '2026-07-01',
          generatedAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.log("Login popup was closed or another request was made.");
      } else {
        console.error("Login failed", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setGoogleAccessToken(null);
    setIsGoogleConnected(false);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('last_google_sync');
    setLastGoogleSync(null);
    setData(null);
    setFirestoreAccounts([]);
    setFirestoreTransactions([]);
    setMinionTasks([]);
  };

  const createLinkToken = async () => {
    const response = await fetch('/api/create_link_token', { method: 'POST' });
    const data = await response.json();
    setLinkToken(data.link_token);
  };

  useEffect(() => {
    if ((activeTab === 'settings' || activeTab === 'accounts' || activeTab === 'dashboard') && !linkToken) {
      createLinkToken();
    }
    if (user && (activeTab === 'accounts' || activeTab === 'dashboard' || activeTab === 'transactions')) {
      fetchData();
    }
  }, [activeTab]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      await fetch('/api/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      setPlaidConnected(true);
      fetchData();
    },
  });

  const disconnectPlaid = async () => {
    await fetch('/api/plaid_disconnect', { method: 'POST' });
    setPlaidConnected(false);
    fetchData();
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
    // Simulate a smart offer after 5 seconds
    const timer = setTimeout(() => setShowSmartOffer(true), 5000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('transactions');
        // Focus search input if possible
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [user]);

  const executeMinionCommand = async (instruction: string) => {
    try {
      const response = await fetch('/api/minion/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      const newTask = await response.json();
      setMinionTasks(prev => [newTask, ...prev]);
      
      // Poll for updates
      const pollInterval = setInterval(async () => {
        const res = await fetch('/api/minion/tasks');
        const tasks = await res.json();
        setMinionTasks(tasks);
        
        const updatedTask = tasks.find((t: any) => t.id === newTask.id);
        if (updatedTask && updatedTask.status === 'COMPLETED') {
          clearInterval(pollInterval);
          fetchData(); // Refresh dashboard data if needed
        }
      }, 2000);
    } catch (err) {
      console.error("Minion execution failed", err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      await fetchData();
    } finally {
      setSyncing(false);
    }
  };

  const executeMinion = async (instruction: string) => {
    if (!user) return;
    
    const taskId = Math.random().toString(36).substring(7);
    const taskRef = doc(db, 'users', user.uid, 'minionTasks', taskId);
    
    try {
      await setDoc(taskRef, {
        id: taskId,
        type: 'WEALTH_ACTION',
        status: 'EXECUTING',
        instruction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please seed demo data or connect your accounts first.");
      }

      // Prepare context for Gemini
      const context = {
        accounts: accounts.map(a => ({ institution: a.institution, name: a.name, balance: a.balance, currency: a.currency, type: a.type })),
        strategy: data?.strategy,
        taxHarvesting: data?.taxHarvesting,
        forexSignals: data?.forexSignals,
        totalPurchasingPower: data?.totalPurchasingPower
      };

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are the "Liminality" Autonomous Financial Agent. 
          Your goal is to execute the user's instruction based on their real financial data.
          The user might speak English or Traditional Chinese. Respond in English for the JSON fields.
          
          USER CONTEXT:
          ${JSON.stringify(context, null, 2)}

          USER INSTRUCTION: "${instruction}"

          DECISION GUIDELINES:
          1. If the user asks to "Move money", provide a recommendation on moving funds between accounts.
          2. If the user asks to "Optimize" or "Strategic advice", look at the strategy pillars and tax harvesting opportunities. provide a "Recommendation" not an "Execution".
          3. If the instruction is vague like "Optimize cash flow" or "幫我優化現金流", look at the accounts provided. Suggest a transfer from a checking/low-yield account (like Chase) to a savings/high-yield account (like SoFi).
          4. ALWAYS return a valid JSON object.
          5. This is a DECISION SUPPORT SYSTEM. DO NOT use words like "Executed", "Succesfully sold", etc. Use "Analysis complete", "Recommendation generated", "Strategy suggested".

          RETURN FORMAT:
          {
            "actionType": "ADVISE" | "SIMULATE" | "TAX_OPTIMIZE" | "STRATEGY_ANALYSIS" | "CATEGORIZE" | "UNKNOWN",
            "details": { 
              "fromAccount"?: "string (institution name)", 
              "toAccount"?: "string (institution name)", 
              "amount"?: number, 
              "currency"?: "USD" | "TWD",
              "pillarTitle"?: "string (if strategy execution)",
              "asset"?: "string (if tax optimize)"
            },
            "reasoning": "A professional, concise explanation of your recommendation based on the user's data.",
            "autonomousDecision": boolean
          }
        `,
      });
      
      const responseText = result.text || '';
      let parsed;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (e) {
        console.error("Failed to parse Gemini response", responseText);
        parsed = { actionType: 'UNKNOWN', reasoning: 'I encountered an error parsing the instruction. Please try again with more detail.' };
      }

      await updateDoc(taskRef, {
        reasoning: parsed.reasoning,
        autonomousDecision: parsed.autonomousDecision || false,
        updatedAt: new Date().toISOString()
      });

      // Advisory Logic
      if (parsed.actionType === 'CATEGORIZE') {
        await handleBulkCategorize();
        await updateDoc(taskRef, { 
          status: 'COMPLETED', 
          result: `Successfully categorized transactions using AI.`,
          updatedAt: new Date().toISOString() 
        });
        return;
      }

      if (parsed.actionType === 'ADVISE' || parsed.actionType === 'STRATEGY_ANALYSIS') {
        const { fromAccount, toAccount, amount, currency } = parsed.details || {};
        
        await updateDoc(taskRef, { 
          status: 'COMPLETED', 
          result: `Strategy Recommendation: ${parsed.reasoning}`,
          updatedAt: new Date().toISOString() 
        });
        
        // Optionally add an insight
        const insightsRef = collection(db, 'users', user.uid, 'minionInsights');
        await addDoc(insightsRef, {
          type: 'WEALTH',
          title: 'New Strategy Advice',
          description: parsed.reasoning,
          priority: 'MEDIUM',
          createdAt: new Date().toISOString()
        });
      } else if (parsed.actionType === 'SIMULATE') {
        // ... simulation logic
        await setDoc(doc(db, 'users', user.uid, 'sandboxState', 'current'), {
          isActive: true,
          lastReset: new Date().toISOString()
        });
        await updateDoc(taskRef, { status: 'COMPLETED', result: 'Sandbox environment activated.', updatedAt: new Date().toISOString() });
      } else if (parsed.actionType === 'TAX_OPTIMIZE') {
        // Simulate tax optimization
        await updateDoc(taskRef, { 
          status: 'COMPLETED', 
          result: `Tax optimization initiated for ${parsed.details?.asset || 'assets'}. Estimated savings: ${formatCurrency(data?.taxHarvesting?.estimatedSavings || 0)}`,
          updatedAt: new Date().toISOString() 
        });
      } else if (parsed.actionType === 'UNKNOWN') {
        await updateDoc(taskRef, { 
          status: 'COMPLETED', 
          result: parsed.reasoning || 'I heard you! How can I help with your wealth today?', 
          updatedAt: new Date().toISOString() 
        });
      } else {
        await updateDoc(taskRef, { status: 'FAILED', reasoning: parsed.reasoning || 'Instruction unclear or unsupported.', updatedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Minion execution failed", err);
      await updateDoc(taskRef, { 
        status: 'FAILED', 
        reasoning: err instanceof Error ? err.message : 'Execution error', 
        updatedAt: new Date().toISOString() 
      });
    }
  };

  const seedInitialData = async () => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        displayCurrency: 'USD',
        currency: 'USD',
        plaidConnected: false,
        totalPurchasingPower: 312000.00,
        wealthHealthScore: 84,
        lastUpdated: now
      }, { merge: true });

      // Seed initial accounts
      const initialAccounts: any[] = [
        { name: 'SoFi Savings', balance: 134709.09, currency: 'USD', type: 'Savings', institution: 'SoFi', updatedAt: now },
        { name: 'Fidelity 401k', balance: 84200.50, currency: 'USD', type: '401k', institution: 'Fidelity', updatedAt: now },
        { name: 'Vanguard Roth IRA', balance: 45000.00, currency: 'USD', type: 'Roth IRA', institution: 'Vanguard', updatedAt: now },
        { name: 'Fidelity Brokerage', balance: 174377.25, currency: 'USD', type: 'Investment', institution: 'Fidelity', updatedAt: now },
        { name: 'Cathay United', balance: 1432073, currency: 'TWD', type: 'Investment', institution: 'Cathay United', updatedAt: now },
        { name: 'Chase Sapphire', balance: -2450.20, currency: 'USD', type: 'Credit Card', institution: 'Chase', updatedAt: now }
      ];

      for (const acc of initialAccounts) {
        await addDoc(collection(db, 'users', user.uid, 'accounts'), acc);
      }

      // Seed initial transactions
      const initialTransactions: any[] = [
        { description: 'Apple Store', amount: -1299.00, currency: 'USD', date: now, category: 'Shopping', status: 'Completed', updatedAt: now },
        { description: 'Starbucks', amount: -5.50, currency: 'USD', date: now, category: 'Food & Drink', status: 'Completed', updatedAt: now },
        { description: 'Salary Deposit', amount: 8500.00, currency: 'USD', date: now, category: 'Transfer', status: 'Completed', updatedAt: now },
        { description: 'Cathay Dividend', amount: 12000, currency: 'TWD', date: now, category: 'Investment', status: 'Completed', updatedAt: now }
      ];

      for (const tx of initialTransactions) {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          ...tx,
          accountId: 'seed-account'
        });
      }

      // Seed initial strategy
      await setDoc(doc(db, 'users', user.uid, 'strategy', 'current'), {
        title: 'Q2 Cross-Border Strategy Advisor',
        summary: 'Your current position is strong but over-concentrated in US tech. We recommend a phased diversification into TWD-denominated yield assets. Consider a Roth conversion strategy for your Traditional IRA assets given your current tax residency.',
        pillars: [
          {
            title: 'Tax-Loss Harvesting Advice',
            description: 'Consider realizing $4,250 in losses from 0050 to offset upcoming US dividend taxes.',
            action: 'Review Advice',
            impact: 'HIGH'
          },
          {
            title: 'Currency Hedge Insight',
            description: 'USD/TWD is at a local peak. We recommend locking in 20% of your TWD needs for the next 6 months.',
            action: 'View Strategy',
            impact: 'MEDIUM'
          },
          {
            title: 'Roth Conversion Strategy',
            description: 'Strategic conversion of $10,000 from Traditional to Roth IRA to leverage current tax bracket.',
            action: 'Analyze Impact',
            impact: 'HIGH'
          }
        ],
        riskLevel: 'MEDIUM',
        nextReviewDate: '2026-04-15',
        generatedAt: new Date().toISOString()
      });
      
      console.log("Demo data seeded successfully!");
      fetchData();
    } catch (err) {
      console.error("Seeding failed", err);
    }
  };

  const resetSandbox = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'sandboxState', 'current'), {
        isActive: false,
        lastReset: new Date().toISOString()
      });
      // In a real app, we might reset the accounts to their original state
    } catch (err) {
      console.error("Sandbox reset failed", err);
    }
  };

  const [importText, setImportText] = useState('');
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  const handleImport = async () => {
    if (importText.trim()) {
      setIsProcessingImport(true);
      try {
        const prompt = `Parse the following financial holding data and extract assets. 
        Return a JSON array of accounts, where each account has:
        - name: account name
        - institution: bank or broker name
        - balance: total balance (number)
        - currency: USD or TWD
        - type: Checking, Savings, Investment, Credit Card, 401k, Roth IRA, or Traditional IRA
        - holdings: array of { symbol, quantity, currentPrice, costBasis }
        
        Data to parse:
        ${importText}`;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  balance: { type: Type.NUMBER },
                  currency: { type: Type.STRING, enum: ["USD", "TWD"] },
                  type: { type: Type.STRING, enum: ["Checking", "Savings", "Investment", "Credit Card", "401k", "Roth IRA", "Traditional IRA"] },
                  holdings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        symbol: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        currentPrice: { type: Type.NUMBER },
                        costBasis: { type: Type.NUMBER }
                      }
                    }
                  }
                },
                required: ["name", "institution", "balance", "currency", "type"]
              }
            }
          }
        });

        const parsed = JSON.parse(response.text || '[]');
        if (user && parsed.length > 0) {
          for (const acc of parsed) {
            await addDoc(collection(db, 'users', user.uid, 'accounts'), {
              ...acc,
              updatedAt: new Date().toISOString()
            });
          }
        }
        setImportText('');
        setShowImportModal(false);
      } catch (err) {
        console.error("Failed to parse import:", err);
      } finally {
        setIsProcessingImport(false);
      }
    } else {
      setSyncing(true);
      setShowImportModal(false);
      setTimeout(() => {
        handleSync();
      }, 1000);
    }
  };

  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [strategyNews, setStrategyNews] = useState([
    { 
      title: 'TSMC Q1 Earnings Outlook', 
      source: 'Minion: Market Scanner', 
      sentiment: 'POSITIVE' as 'POSITIVE' | 'NEUTRAL' | 'CAUTION',
      summary: 'Strong demand for AI chips expected to drive TWD strength. Consider holding TSM position.'
    },
    { 
      title: 'US Fed Interest Rate Update', 
      source: 'Minion: Macro Watch', 
      sentiment: 'NEUTRAL' as 'POSITIVE' | 'NEUTRAL' | 'CAUTION',
      summary: 'Rates likely to stay higher for longer. USD strength expected to persist against major currencies.'
    },
    { 
      title: 'Taiwan Tax Law Amendment', 
      source: 'Minion: Legal Scout', 
      sentiment: 'CAUTION' as 'POSITIVE' | 'NEUTRAL' | 'CAUTION',
      summary: 'New CFC rules might impact offshore holding structures. Reviewing your BVI entity.'
    }
  ]);

  const generateStrategyNews = async () => {
    if (!user) return;
    setIsGeneratingNews(true);
    try {
      const prompt = `Generate 4 real-time cross-border financial news items for a user with assets in both US and Taiwan.
      Current FX Rate: ${FX_RATE} TWD/USD.
      Focus on: TSMC, AI chips, Fed rates, TWD/USD trends, and cross-border tax compliance.
      Return JSON array of objects with: title, source (e.g., 'Minion: Market Scanner'), sentiment (POSITIVE, NEUTRAL, CAUTION), and summary.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "CAUTION"] },
                summary: { type: Type.STRING }
              },
              required: ["title", "source", "sentiment", "summary"]
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      setStrategyNews(result);
      setIsGeneratingNews(false);
    } catch (error) {
      console.error("Error generating strategy news:", error);
      setIsGeneratingNews(false);
    }
  };

  const [isCategorizing, setIsCategorizing] = useState(false);

  const handleBulkCategorize = async () => {
    if (!user || transactions.length === 0) return;
    setIsCategorizing(true);
    try {
      const uncategorized = transactions.filter(t => !t.category || t.category === 'General').slice(0, 15);
      if (uncategorized.length === 0) {
        setIsCategorizing(false);
        return;
      }

      const prompt = `Categorize these financial transactions into: 'Food & Drink', 'Travel', 'Transfer', 'Investment', 'Shopping', 'Utilities', or 'General'.
      Transactions: ${JSON.stringify(uncategorized.map(t => ({ id: t.id, description: t.description, amount: t.amount })))}
      Return a JSON object mapping transaction IDs to categories.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            additionalProperties: { type: Type.STRING }
          }
        }
      });

      const mapping = JSON.parse(response.text || '{}');
      
      for (const [id, category] of Object.entries(mapping)) {
        const txRef = doc(db, 'users', user.uid, 'transactions', id);
        await updateDoc(txRef, { category });
      }

      setIsCategorizing(false);
    } catch (error) {
      console.error("Bulk categorization failed:", error);
      setIsCategorizing(false);
    }
  };

  const [isScanningTax, setIsScanningTax] = useState(false);
  const handleDeepTaxScan = async () => {
    if (!user || accounts.length === 0) return;
    setIsScanningTax(true);
    try {
      const context = {
        accounts: accounts.map(a => ({ 
          name: a.name, 
          institution: a.institution, 
          balance: a.balance, 
          currency: a.currency, 
          type: a.type,
          annualYield: a.annualYield,
          holdings: a.holdings?.length || 0
        })),
        taxResidencyStatus,
        totalPurchasingPower: data.totalPurchasingPower,
        investmentLosses: data.investmentLosses,
        twdCash: data.twdCash,
        usCash: data.usCash
      };

      const prompt = `Perform a deep tax optimization scan for a global citizen with these assets:
      ${JSON.stringify(context, null, 2)}

      Analyze specifically:
      1. US-Taiwan Tax Treaty (Form 8833) optimization opportunities.
      2. Retirement strategy (401k, Roth IRA, Traditional IRA). If they have Traditional IRA balances, mention Pro-Rata rule for Backdoor Roth.
      3. Roth conversion benefits given current residency (${taxResidencyStatus}).
      4. Capital gains/loss harvesting (Wash Sale rules).
      5. FBAR/FATCA compliance risks.

      Return advice in TWO languages (English and Traditional Chinese).
      IMPORTANT: This is an ADIVSORY system. Do NOT suggest executing trades automatically. Use words like "Review", "Consider", "Strategic Insight".
      
      Return a JSON object:
      {
        "score": number (0-100),
        "insights": [
          { "title": "string", "description": "string", "impact": "HIGH" | "MEDIUM" | "LOW", "type": "TAX" | "RETIREMENT" | "COMPLIANCE" }
        ],
        "summary": "string (multilingual summary)"
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(result.text || '{}');
      
      // Update the strategy in Firestore
      const strategyRef = doc(db, 'users', user.uid, 'strategy', 'current');
      await setDoc(strategyRef, {
        title: t('deepScanResult') || 'Deep Tax Optimization Result',
        summary: parsed.summary,
        pillars: parsed.insights.map((ins: any) => ({
          title: ins.title,
          description: ins.description,
          impact: ins.impact,
          type: ins.type,
          action: 'Read Advice'
        })),
        taxOpportunityScore: parsed.score,
        generatedAt: new Date().toISOString()
      }, { merge: true });

      // Add a minion insight
      const insightsRef = collection(db, 'users', user.uid, 'minionInsights');
      await addDoc(insightsRef, {
        type: 'TAX',
        title: t('scanComplete') || 'Tax Scan Complete',
        description: parsed.summary.substring(0, 150) + '...',
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      });

      alert(t('scanCompleteMessage') || "Analysis complete. Review your new strategies in the strategy tab.");
    } catch (err) {
      console.error("Deep scan failed", err);
      alert("Analysis encountered an error. Please try again.");
    } finally {
      setIsScanningTax(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    setIsSavingSettings(true);
    try {
      if (masterKey) {
        localStorage.setItem('liminality_master_key', masterKey);
      } else {
        localStorage.removeItem('liminality_master_key');
      }
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        userName,
        displayName: userName,
        displayCurrency,
        currency: displayCurrency,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      localStorage.setItem('liminality_currency', displayCurrency);
      
      // Show success state briefly
      setTimeout(() => setIsSavingSettings(false), 1000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSavingSettings(false);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) return;
    
    const headers = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Currency'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(tx => {
        const accountName = accounts.find(a => a.id === tx.accountId)?.name || 'Unknown';
        return [
          new Date(tx.date).toISOString(),
          `"${tx.description.replace(/"/g, '""')}"`,
          tx.category || 'General',
          `"${accountName.replace(/"/g, '""')}"`,
          tx.amount,
          tx.currency
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOCRUpload = () => {
    document.getElementById('ocr-upload-input')?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsOCRProcessing(true);
    try {
      const reader = new FileReader();
      
      // Determine if it's a binary file Gemini can process via inlineData (images, PDF, Excel)
      const isBinary = file.type.startsWith('image/') || 
                       file.type === 'application/pdf' || 
                       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.type === 'application/vnd.ms-excel';
      
      reader.onload = async (event) => {
        let contents;
        
        const extractionPrompt = `Extract all financial accounts found in this document. 
        If multiple institutions (e.g., Chase, BOA, SoFi, Robinhood, Cathay United, CTBC, Fubon, E.SUN, Taishin) are listed, extract each one as a separate account entry. 
        For Taiwan institutions, identify if it is a Bank account or a Brokerage (Stock) account. 
        Be extremely precise with numbers. 
        
        For each account, also extract the detailed HOLDINGS (stocks, ETFs, mutual funds) if available.
        Include: name, symbol, quantity, costBasis, and currentPrice.
        
        Return a JSON array of objects, each containing: 
        name (account name, e.g., '國泰台股', '台新銀行'), 
        institution (full bank name), 
        balance (number), 
        currency (3-letter code), 
        type (Checking, Savings, Investment, Credit Card),
        annualYield (number, e.g., 4.5),
        riskProfile (Low, Moderate, High),
        holdings (array of objects: name, symbol, quantity, costBasis, currentPrice),
        and an array of recent transactions (description, amount, date in ISO format, category).`;

        if (isBinary) {
          const base64Data = event.target?.result?.toString().split(',')[1];
          if (!base64Data) return;
          contents = [
            {
              parts: [
                { text: extractionPrompt },
                { inlineData: { data: base64Data, mimeType: file.type } }
              ]
            }
          ];
        } else {
          // For text files (CSV, TXT, etc.), read as text and send as part
          const textData = event.target?.result?.toString();
          contents = [
            {
              parts: [
                { text: `${extractionPrompt}\n\nDATA:\n${textData}` }
              ]
            }
          ];
        }

        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  balance: { type: Type.NUMBER },
                  currency: { type: Type.STRING },
                  type: { type: Type.STRING },
                  annualYield: { type: Type.NUMBER },
                  riskProfile: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
                  holdings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        symbol: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        costBasis: { type: Type.NUMBER },
                        currentPrice: { type: Type.NUMBER }
                      }
                    }
                  },
                  transactions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        description: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        date: { type: Type.STRING },
                        category: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const results = JSON.parse(response.text);
        if (!Array.isArray(results)) return;

        for (const result of results) {
          const institutionLogo = getInstitutionLogo(result.institution || result.name || '');
          
          // Deduplication Logic: Check if account with same institution AND name already exists
          const existingAccount = firestoreAccounts.find(acc => 
            (acc.institution?.toLowerCase() === result.institution?.toLowerCase()) || 
            (acc.name?.toLowerCase() === result.name?.toLowerCase()) ||
            (acc.institution?.includes(result.institution) || result.institution?.includes(acc.institution))
          );

          let accountId;
          
          if (existingAccount) {
            // Update existing account - Merge holdings
            const mergedHoldings = [...(existingAccount.holdings || [])];
            if (result.holdings) {
              result.holdings.forEach((newH: any) => {
                const idx = mergedHoldings.findIndex(h => h.symbol === newH.symbol);
                if (idx > -1) {
                  mergedHoldings[idx] = { ...mergedHoldings[idx], ...newH, updatedAt: new Date().toISOString() };
                } else {
                  mergedHoldings.push({ ...newH, updatedAt: new Date().toISOString() });
                }
              });
            }

            await updateDoc(doc(db, 'users', user.uid, 'accounts', existingAccount.id), {
              balance: result.balance ?? existingAccount.balance ?? 0,
              currency: result.currency || existingAccount.currency || 'TWD',
              type: result.type || existingAccount.type || 'Investment',
              annualYield: result.annualYield ?? existingAccount.annualYield ?? 0,
              riskProfile: result.riskProfile || existingAccount.riskProfile || 'Low',
              holdings: mergedHoldings,
              logo: institutionLogo,
              updatedAt: new Date().toISOString(),
              lastImportSource: 'OCR_AI_UPDATE'
            });
            accountId = existingAccount.id;
          } else {
            // Save new account
            const accountRef = await addDoc(collection(db, 'users', user.uid, 'accounts'), {
              name: result.name || t('newAccount'),
              institution: result.institution || t('unknownInstitution'),
              balance: result.balance || 0,
              currency: result.currency || 'TWD',
              type: result.type || 'Investment',
              annualYield: result.annualYield || (result.type === 'Investment' ? 6.8 : result.type === 'Savings' ? 4.25 : 0.01),
              riskProfile: result.riskProfile || (result.type === 'Investment' ? 'Moderate' : 'Low'),
              holdings: result.holdings || [],
              logo: institutionLogo,
              createdAt: new Date().toISOString(),
              source: 'OCR_AI_IMPORT'
            });
            accountId = accountRef.id;
          }

          // Save transactions
          if (result.transactions && Array.isArray(result.transactions)) {
            for (const tx of result.transactions) {
              // Basic transaction deduplication
              const isDuplicateTx = transactions.some(t => 
                t.accountId === accountId &&
                t.date === tx.date &&
                t.amount === tx.amount &&
                t.description === tx.description
              );

              if (!isDuplicateTx) {
                await addDoc(collection(db, 'users', user.uid, 'transactions'), {
                  accountId: accountId,
                  description: tx.description || t('transaction'),
                  amount: tx.amount || 0,
                  date: tx.date || new Date().toISOString(),
                  category: tx.category || 'General',
                  currency: result.currency || 'TWD',
                  createdAt: new Date().toISOString(),
                  source: 'OCR_IMPORT'
                });
              }
            }
          }
        }

        setIsOCRProcessing(false);
        setShowOCRSuccess(true);
        setTimeout(() => setShowOCRSuccess(false), 3000);
      };

      if (isBinary) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("OCR Import failed", err);
      setIsOCRProcessing(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [accountChatHistory]);

  const handleExecuteTaxStrategy = () => {
    setShowTaxModal(false);
    setShowTaxExecutionModal(true);
    // In a real app, this would trigger a backend process
    setTimeout(() => {
      setShowTaxExecutionModal(false);
      // Update local state to reflect change (e.g., mark as done)
      alert(t('taxHarvestingInitiated') || 'Tax harvesting strategy initiated.');
    }, 3000);
  };

  const convertToUSD = (amount: number, currency: string) => {
    if (currency === 'USD') return amount;
    return amount / FX_RATE;
  };

  const handleDownloadFBAR = () => {
    const foreignAccounts = accounts.filter(a => a.currency === 'TWD');
    let content = `${t('fbarReportHeader')}\n`;
    content += "========================================================\n\n";
    content += `${t('generatedOn')}: ${new Date().toLocaleString()}\n`;
    content += `${t('filer')}: ${user?.displayName || userName}\n\n`;
    content += `${t('reportableAccounts')}:\n`;
    
    foreignAccounts.forEach((acc, i) => {
      content += `\n${t('account')} #${i+1}:\n`;
      content += `- ${t('institution')}: ${acc.institution}\n`;
      content += `- ${t('accountName')}: ${acc.name}\n`;
      content += `- ${t('type')}: ${acc.type}\n`;
      content += `- ${t('maxBalance')}: ${formatCurrency(acc.balance, acc.currency)} (${acc.currency})\n`;
      content += `- ${t('usValueEst')}: ${formatCurrency(convertToUSD(acc.balance, acc.currency), 'USD')}\n`;
    });
    
    content += `\n\n${t('instructions')}:\n`;
    content += `${t('fbarInstruction1')}\n`;
    content += `${t('fbarInstruction2')}\n`;
    content += `${t('fbarInstruction3')}\n`;
    
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "FBAR_Draft_2025.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCalendarSync = () => {
    if (!data?.taxDeadlines || data.taxDeadlines.length === 0) return;
    
    // Find next upcoming non-completed deadline
    const nextDeadline = data.taxDeadlines.find(d => d.status === 'Upcoming' && !completedDeadlines.includes(d.id));
    if (!nextDeadline) {
      alert(t('allDeadlinesDone'));
      return;
    }

    // Generate Google Calendar Event URL
    const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent(`${t('liminalityTaskPrefix')}: ${nextDeadline.title}`);
    
    // Format date for GCal (YYYYMMDD)
    let dateStr = "20260417";
    try {
      const d = new Date(nextDeadline.date);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().replace(/-|:|\.\d+/g, "").split("T")[0];
      }
    } catch (e) {}

    const details = encodeURIComponent(`${t('recommendationBasedOn')} Liminality Wealth Engine.\n\n${t('priority')}: ${nextDeadline.priority}\n${t('status')}: ${nextDeadline.status}\n\n${t('tagline')}`);
    const url = `${baseUrl}&text=${title}&dates=${dateStr}/${dateStr}&details=${details}`;
    
    const win = window.open(url, '_blank');
    if (!win) {
      // Fallback if popup blocked
      window.location.href = url;
    }
  };

  const handleDownloadReport = () => {
    if (!data) return;
    
    const lines = [
      t('reportTitle'),
      "===========================================",
      `${t('generatedOn')}: ${new Date().toLocaleString()}`,
      `${t('user')}: ${userName}`,
      `${t('primaryCurrency')}: ${displayCurrency}`,
      "",
      t('financialSummaryLabel'),
      "-----------------",
      `${t('totalAssetsUSD')}: ${formatCurrency(data.totalRaw, 'USD', 'USD')}`,
      `${t('realPurchasingPower')}: ${formatCurrency(data.totalPurchasingPower)}`,
      `${t('wealthHealthScore')}: ${data.wealthHealthScore}/100`,
      "",
      t('jurisdictionBreakdown'),
      "----------------------",
      `${t('unitedStates')}: ${formatCurrency(data.jurisdictionBreakdown?.us.total || 0, 'USD')}`,
      `${t('taiwan')}: ${formatCurrency(data.jurisdictionBreakdown?.tw.total || 0, 'USD')}`,
      "",
      t('taxCompliance'),
      "----------------",
      `${t('complianceScore')}: ${data.taxComplianceScore}/100`,
      `${t('estimatedSavings')}: ${formatCurrency(data.taxSavings || 0)}`,
      `${t('fbarRequired')}: ${data.taxReports?.fbar.status}`,
      "",
      t('activeDeadlines'),
      "----------------",
      ...(data.taxDeadlines?.map(d => `${d.date}: ${d.title} [${d.status}]`) || []),
      "",
      "UNAUTHORIZED USE PROHIBITED. DATA ENCRYPTED BY LIMINALITY."
    ];
    
    const blob = new Blob([lines.join('\n')], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `Liminality_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const BeforeAfterImpact = ({ data, t }: { data: DashboardData, t: any }) => {
    const noActionWorth = data.totalPurchasingPower;
    const strategicWorth = data.totalPurchasingPower + data.taxSavings;
    
    return (
      <div className="glass-card p-10 relative overflow-hidden bg-gradient-to-br from-cool-gray to-black text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">{t('strategicEdge')}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">{t('impactForecast')}</p>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-gray-400">{t('noActionLabel')}</span>
                    <span className="text-lg font-bold text-gray-400">{formatCurrency(noActionWorth)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="bg-gray-600 h-full w-[80%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-emerald-400">{t('withStrategicExecution')}</span>
                    <span className="text-2xl font-bold text-emerald-400">{formatCurrency(strategicWorth)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '80%' }}
                      animate={{ width: '100%' }}
                      className="bg-emerald-500 h-full" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('addedValue')}</p>
                  <p className="text-3xl font-bold text-emerald-500">+{formatCurrency(data.taxSavings)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "{t('strategicAdvantageDesc')}"
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>
    );
  };

  const ScenarioSimulator = ({ data, t }: { data: DashboardData, t: any }) => {
    const [scenarios, setScenarios] = useState([
      { id: 'baseline', name: t('waitAndSee'), impact: 0, color: '#94a3b8', active: true },
      { id: 'aggressive', name: t('aggressiveHarvest'), impact: data.harvestableLoss || 0, color: '#3b82f6', active: false },
      { id: 'fbar', name: t('fbarComplianceLabel'), impact: 0, color: '#10b981', active: false },
    ]);

    const toggleScenario = (id: string) => {
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, active: true } : { ...s, active: false }));
    };

    const activeScenario = scenarios.find(s => s.active);

    // Dynamic chart data for visualization
    const chartData = [
      { name: 'Q1', baseline: 100, projection: 100 },
      { name: 'Q2', baseline: 105, projection: 108 },
      { name: 'Q3', baseline: 103, projection: 112 },
      { name: 'Q4', baseline: 110, projection: 125 },
    ].map(point => ({
      ...point,
      baseline: (data.totalPurchasingPower || 0) * (point.baseline / 100),
      projection: ((data.totalPurchasingPower || 0) + (activeScenario?.impact || 0)) * (point.projection / 100)
    }));

    return (
      <div className="glass-card p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-bold text-cool-gray uppercase tracking-[0.2em]">{t('scenarioSimulator')}</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('strategicOutcomes')}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {t('highConfidence')}
          </div>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {scenarios.map(s => (
            <button 
              key={s.id}
              onClick={() => toggleScenario(s.id)}
              className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                s.active ? 'bg-white text-cool-gray border-cool-gray shadow-xl ring-1 ring-gray-100' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('projectedLiquidity')}</p>
              <p className="text-4xl font-bold text-cool-gray tracking-tighter">
                {formatCurrency((data.totalPurchasingPower || 0) + (activeScenario?.impact || 0))}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${activeScenario?.impact && activeScenario.impact > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                  {t('taxEfficiencyDelta')}: {activeScenario?.impact && activeScenario.impact > 0 ? `+${formatCurrency(activeScenario.impact)}` : '0.00'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{t('decisionMetrics')}</h5>
              {[
                { label: t('implementationRisk'), value: t('lowRisk'), color: 'text-emerald-500' },
                { label: t('irsExposure'), value: t('nominal'), color: 'text-blue-500' },
                { label: t('complianceLoad'), value: '+15 min', color: 'text-gray-400' }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">{m.label}</span>
                  <span className={`font-bold ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProjection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorBaseline)" 
                  strokeDasharray="5 5"
                />
                <Area 
                  type="monotone" 
                  dataKey="projection" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorProjection)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gray-400 border-dashed border-gray-400" />
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('statusQuo')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500" />
                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">{t('withStrategy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAccountChat = async () => {
    if (!accountChatInput.trim() || isAccountChatLoading) return;
    
    const userMessage = accountChatInput.trim();
    setAccountChatInput('');
    setAccountChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAccountChatLoading(true);
    
    try {
      const accountContext = accounts.map(a => `${a.institution} - ${a.name}: ${formatCurrency(a.balance, a.currency, a.currency)} (${a.currency})`).join('\n');
      const transactionContext = transactions.slice(0, 10).map(t => `${t.date}: ${t.description} ${formatCurrency(t.amount, t.currency, t.currency)} (${t.category})`).join('\n');
      
      const prompt = `You are a financial AI assistant for Liminality, a cross-border wealth management platform.
      
      SYSTEM INSTRUCTIONS:
      - You help users manage assets between the US and Taiwan.
      - You can explain how to use the app:
        * Dashboard: Overview of net worth and purchasing power.
        * Accounts: Detailed view of assets. Users can upload screenshots (OCR) to sync data automatically.
        * Transactions: Ledger of all activities.
        * Strategy: AI-driven tax optimization (FBAR, Wash Sale, etc.).
        * Simulator: Project future wealth based on lifestyle changes.
      - If users ask "How do I sync?", tell them to go to the Accounts page and drop a screenshot or CSV.
      - If users ask about tax, mention FBAR (Foreign Bank Account Report) for assets > $10,000 or FTC (Foreign Tax Credit).
      
      USER CONTEXT:
      - Current Language: ${language === 'en' ? 'English' : 'Traditional Chinese'}
      - Display Currency: ${displayCurrency}
      
      USER ACCOUNTS:
      ${accountContext}
      
      RECENT TRANSACTIONS:
      ${transactionContext}
      
      USER QUESTION: ${userMessage}
      
      Provide a structured, easy-to-read answer using Markdown. 
      Use bold text for key terms and bullet points for lists. 
      Keep it concise and professional.
      Always respond in the user's current language (${language === 'en' ? 'English' : 'Traditional Chinese'}).`;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      setAccountChatHistory(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error("Account Chat failed", error);
      setAccountChatHistory(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error while processing your request. Please try again later." }]);
    } finally {
      setIsAccountChatLoading(false);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    setDeleteConfirm({ id: accountId, type: 'single' });
  };

  const handleBulkDelete = () => {
    if (selectedAccountIds.length === 0) return;
    setDeleteConfirm({ id: selectedAccountIds, type: 'bulk' });
  };

  const handleUpdateAccount = async (accountId: string, updates: Partial<Account>) => {
    if (!user) return;
    try {
      const finalId = accountId || `manual_${Date.now()}`;
      if (updates.institution) {
        updates.logo = getInstitutionLogo(updates.institution);
      }
      // Use setDoc with merge: true to support "promoting" mock accounts to Firestore
      await setDoc(doc(db, 'users', user.uid, 'accounts', finalId), {
        ...updates,
        id: finalId,
        deleted: false, // Ensure it's not marked as deleted
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setEditingAccount(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/accounts/${accountId}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg-clean flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-plaid-blue rounded-2xl flex items-center justify-center text-white animate-pulse">
            <Globe className="w-10 h-10" />
          </div>
          <p className="text-sm font-bold text-cool-gray uppercase tracking-widest animate-pulse">Initializing Liminality...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <AuthPage 
          onLogin={handleLogin} 
          isLoggingIn={isLoggingIn} 
          onBack={() => setShowAuth(false)} 
          t={t}
        />
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} t={t} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-clean">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-plaid-blue animate-spin" />
          <p className="text-sm font-medium text-gray-500">Syncing your global assets...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-bg-clean flex flex-col md:flex-row">
      <SandboxBanner isActive={sandbox?.isActive || false} onReset={resetSandbox} t={t} />
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <h1 className="text-lg font-bold tracking-tight text-cool-gray flex items-center gap-2.5">
          <div className="w-9 h-9 bg-plaid-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-plaid-blue/20">
            <Globe className="w-5 h-5" />
          </div>
          <span className="font-display tracking-tight">Liminality</span>
        </h1>
        <div className="flex items-center gap-2">
          {user && <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-gray-100" alt="" />}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold tracking-tight text-cool-gray flex items-center gap-2">
                  <div className="w-8 h-8 bg-plaid-blue rounded-lg flex items-center justify-center text-white">
                    <Globe className="w-5 h-5" />
                  </div>
                  Liminality
                </h1>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                <NavItem 
                  icon={<LayoutDashboard className="w-4 h-4" />} 
                  label={t('dashboard')} 
                  active={activeTab === 'dashboard'} 
                  onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<Wallet className="w-4 h-4" />} 
                  label={t('accounts')} 
                  active={activeTab === 'accounts'} 
                  onClick={() => { setActiveTab('accounts'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<History className="w-4 h-4" />} 
                  label={t('transactions')} 
                  active={activeTab === 'transactions'} 
                  onClick={() => { setActiveTab('transactions'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<ShieldCheck className="w-4 h-4" />} 
                  label={t('tax')} 
                  active={activeTab === 'tax'} 
                  onClick={() => { setActiveTab('tax'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<Zap className="w-4 h-4" />} 
                  label={t('simulator')} 
                  active={activeTab === 'simulator'} 
                  onClick={() => { setActiveTab('simulator'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<Compass className="w-4 h-4" />} 
                  label={t('strategy')} 
                  active={activeTab === 'strategy'} 
                  onClick={() => { setActiveTab('strategy'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<MessageSquare className="w-4 h-4" />} 
                  label={t('history')} 
                  active={activeTab === 'history'} 
                  onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }}
                />
              </nav>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2 px-4 py-2 mb-2">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${language === 'en' ? 'bg-cool-gray text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('zh')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${language === 'zh' ? 'bg-cool-gray text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                  >
                    繁中
                  </button>
                </div>
                <NavItem 
                  icon={<Settings className="w-4 h-4" />} 
                  label={t('settings')} 
                  active={activeTab === 'settings'}
                  onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                />
                <NavItem 
                  icon={<LogOut className="w-4 h-4" />} 
                  label={t('signOut')} 
                  active={false}
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="text-red-500 hover:bg-red-50"
                />
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className={`${isCollapsed ? 'w-24' : 'w-72'} hidden md:flex border-r border-gray-100 bg-white flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out`}>
        <div className={`p-8 border-b border-gray-50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <h1 className="text-xl font-bold tracking-tighter text-cool-gray flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="w-10 h-10 bg-plaid-blue rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-plaid-blue/10">
                <Globe className="w-6 h-6" />
              </div>
              <span className="font-display">Liminality</span>
            </h1>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-plaid-blue rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-plaid-blue/10 transition-transform hover:scale-105 cursor-pointer">
              <Globe className="w-6 h-6" />
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label={t('dashboard')} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<Wallet className="w-4 h-4" />} 
            label={t('accounts')} 
            active={activeTab === 'accounts'} 
            onClick={() => setActiveTab('accounts')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<History className="w-4 h-4" />} 
            label={t('transactions')} 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<ShieldCheck className="w-4 h-4" />} 
            label={t('tax')} 
            active={activeTab === 'tax'} 
            onClick={() => setActiveTab('tax')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<Zap className="w-4 h-4" />} 
            label={t('simulator')} 
            active={activeTab === 'simulator'} 
            onClick={() => setActiveTab('simulator')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<Compass className="w-4 h-4" />} 
            label={t('strategy')} 
            active={activeTab === 'strategy'} 
            onClick={() => setActiveTab('strategy')}
            collapsed={isCollapsed}
          />
          <NavItem 
            icon={<MessageSquare className="w-4 h-4" />} 
            label={t('history')} 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            collapsed={isCollapsed}
          />
        </nav>

        <div className="mt-auto px-4 py-6 space-y-6">
          {!isCollapsed && (
            <div className="px-4 py-5 bg-gray-50/50 border border-gray-100 rounded-3xl group hover:border-plaid-blue/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('daemonStatus')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{t('active')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-medium">{t('icloudSync')}</span>
                  <span className="text-cool-gray font-bold">{t('synced')}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400 font-medium uppercase tracking-tight">Locale / FX</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                      className="text-plaid-blue font-bold cursor-pointer hover:underline uppercase"
                    >
                      {language === 'en' ? 'EN' : '繁中'}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span 
                      onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'TWD' : 'USD')}
                      className="text-prism-teal font-bold cursor-pointer hover:underline"
                    >
                      {displayCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <NavItem 
              icon={<Settings className="w-4 h-4" />} 
              label={t('settings')} 
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              collapsed={isCollapsed}
            />
            <NavItem 
              icon={<LogOut className="w-4 h-4" />} 
              label={t('signOut')} 
              active={false}
              onClick={handleLogout}
              collapsed={isCollapsed}
              className="text-red-500/80 hover:bg-red-50 hover:text-red-600"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 bg-gray-50/30">
        <div className="max-w-7xl mx-auto space-y-10 pb-20 md:pb-0">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-cool-gray capitalize">{t(activeTab as any)}</h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {user && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-full shadow-sm hover:border-gray-300 transition-all cursor-pointer group">
                <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white shadow-inner flex items-center justify-center bg-gray-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-cool-gray hidden sm:inline tracking-tight group-hover:text-plaid-blue transition-colors">
                  {user.displayName}
                </span>
              </div>
            )}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${sandbox?.isActive ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              <Lock className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">{sandbox?.isActive ? 'Sandbox Mode' : t('localFirstEncrypted')}</span>
            </div>
            <div className="flex gap-2 ml-1">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-cool-gray hover:bg-gray-50 transition-all shadow-sm flex items-center gap-1.5"
                title={language === 'en' ? 'Switch to Traditional Chinese' : '切換至英文'}
              >
                <Languages className="w-3.5 h-3.5 text-plaid-blue" />
                <span>{language === 'en' ? '繁中' : 'EN'}</span>
              </button>
            </div>
            <div className="flex p-1 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-xl">
              <button 
                onClick={() => setDisplayCurrency('USD')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${displayCurrency === 'USD' ? 'bg-cool-gray text-white shadow-lg shadow-cool-gray/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                USD
              </button>
              <button 
                onClick={() => setDisplayCurrency('TWD')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${displayCurrency === 'TWD' ? 'bg-cool-gray text-white shadow-lg shadow-cool-gray/20' : 'text-gray-400 hover:text-gray-600'}`}
              >
                TWD
              </button>
            </div>
            <span className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ${syncing ? 'opacity-50' : ''}`}>
              {syncing ? <RefreshCw className="w-3 h-3 animate-spin text-plaid-blue" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              <span className="hidden lg:inline">{t('lastSynced')}:</span> {data?.lastSync ? new Date(data.lastSync).toLocaleTimeString() : 'Never'}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowImportModal(true)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="hidden xs:inline">{t('importCsv')}</span>
              </button>
              <button 
                onClick={handleSync}
                disabled={syncing}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{syncing ? t('syncing') : t('syncAll')}</span>
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && dashboardData && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Top Row: Main Stats & Health */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title={t('realPurchasingPower')} 
                    value={formatCurrency(dashboardData.totalPurchasingPower)}
                    trend={(() => {
                      const trend = dashboardData.totalPurchasingPowerTrend || [];
                      if (trend.length < 2) return '+0.0%';
                      const first = trend[0];
                      const last = trend[trend.length - 1];
                      const growth = first !== 0 ? ((last - first) / first) * 100 : 0;
                      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
                    })()}
                    isPositive={(() => {
                      const trend = dashboardData.totalPurchasingPowerTrend || [];
                      if (trend.length < 2) return true;
                      return trend[trend.length - 1] >= trend[0];
                    })()}
                    subtitle={`${t('afterTaxLiquidity')} (${displayCurrency})`}
                    tooltip={t('purchasingPowerTooltip')}
                    t={t}
                    onClick={() => setActiveTab('strategy')}
                  />
                  <StatCard 
                    title={t('usdCash')} 
                    value={formatCurrency(dashboardData.usdCash, 'USD')}
                    subtitle="SoFi, Chase, Fidelity"
                    percentage={dashboardData.totalRaw > 0 ? Math.round((dashboardData.usdCash / dashboardData.totalRaw) * 100) : 0}
                    t={t}
                    onClick={() => setActiveTab('accounts')}
                  />
                  <StatCard 
                    title={t('twdCash')} 
                    value={formatCurrency(dashboardData.twdCash, 'TWD')}
                    subtitle="Cathay United Bank"
                    percentage={dashboardData.totalRaw > 0 ? Math.round(((dashboardData.twdCash / FX_RATE) / dashboardData.totalRaw) * 100) : 0}
                    t={t}
                    onClick={() => setActiveTab('accounts')}
                  />
                </div>
                {dashboardData.wealthHealthScore && dashboardData.wealthHealthFactors && (
                  <div onClick={() => setActiveTab('strategy')} className="cursor-pointer">
                    <WealthHealthScore score={dashboardData.wealthHealthScore} factors={dashboardData.wealthHealthFactors} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 glass-card p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-cool-gray">{t('historicalWealth')}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('performance30Day')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-plaid-blue" />
                        <span className="text-xs font-bold text-gray-500">{t('usdBasis')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.totalPurchasingPowerTrend?.map((val, i) => ({ day: i, value: val })) || []}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052CC" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          tickFormatter={(val) => val % 7 === 0 ? `Day ${val}` : ''}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '12px' }}
                          formatter={(value: number) => [formatCurrency(value), t('realPurchasingPower')]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0052CC" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Minion Insights */}
                {dashboardData.minionInsights && (
                  <MinionInsights 
                    insights={dashboardData.minionInsights} 
                    onGenerate={generateNewInsights}
                    isLoading={isGeneratingInsights}
                  />
                )}
              </div>

              {/* Net Worth Breakdown Section */}
              <div className="glass-card p-8">
                {showSmartOffer && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-cool-gray">{t('smartYieldOpportunity')}</p>
                        <p className="text-[10px] text-gray-500">
                          {dashboardData.usdCash > 1000 ? t('smartYieldOfferDesc') : t('smartYieldOfferNoData')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open('https://www.sofi.com/banking/', '_blank')}
                      className="px-3 py-1.5 bg-cool-gray text-white text-[10px] font-bold rounded-lg hover:bg-black transition-colors uppercase tracking-wider"
                    >
                      {t('viewOffer')}
                    </button>
                  </motion.div>
                )}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-cool-gray">{t('netWorthBreakdown')}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('netWorthByJurisdiction')}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('crossBorderView')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-cool-gray">{t('usAssets')}</span>
                        <span className="text-sm font-bold text-plaid-blue">{formatCurrency(dashboardData?.jurisdictionBreakdown?.us?.total || 0, 'USD')}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-plaid-blue h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${((dashboardData?.jurisdictionBreakdown?.us?.total || 0) / (dashboardData?.totalRaw || 1) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('liquid')}: {formatCurrency(dashboardData?.jurisdictionBreakdown?.us?.liquid || 0, 'USD')}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('invested')}: {formatCurrency(dashboardData?.jurisdictionBreakdown?.us?.invested || 0, 'USD')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-cool-gray">{t('twAssets')}</span>
                        <span className="text-sm font-bold text-prism-teal">{formatCurrency(dashboardData?.jurisdictionBreakdown?.tw?.total || 0, 'USD')}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-prism-teal h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${((dashboardData?.jurisdictionBreakdown?.tw?.total || 0) / (dashboardData?.totalRaw || 1) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Liquid: {formatCurrency(dashboardData?.jurisdictionBreakdown?.tw?.liquid || 0, 'USD')}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Invested: {formatCurrency(dashboardData?.jurisdictionBreakdown?.tw?.invested || 0, 'USD')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Info className="w-4 h-4 text-amber-600" />
                      </div>
                      <h4 className="text-sm font-bold text-cool-gray">{t('jurisdictionInsightLabel')}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {dashboardData?.jurisdictionInsight?.recommendation || t('analyzingPortfolio')}
                    </p>
                    <button 
                      onClick={() => setActiveTab('tax')}
                      className="text-[10px] font-bold text-plaid-blue uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      {t('viewOptimization')} <ArrowRightLeft className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* NYC Stress Test & Referrals Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* NYC Stress Test Card */}
                {dashboardData.stressTest && (
                  <div className="glass-card p-8 border-l-4 border-prism-teal">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-prism-teal/10 rounded-xl">
                          <Zap className="w-6 h-6 text-prism-teal" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-cool-gray">{t('nycStressTest')}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('manhattanSimulation')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        dashboardData.stressTest.status === 'Safe' ? 'bg-green-100 text-green-700' :
                        dashboardData.stressTest.status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {dashboardData.stressTest.status === 'Safe' ? t('excellent') : dashboardData.stressTest.status === 'Warning' ? t('needsWork') : t('cautional')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('projectedRunway')}</p>
                        <p className="text-3xl font-bold text-cool-gray">{dashboardData.stressTest.runwayMonths} <span className="text-sm font-medium text-gray-400">{t('months')}</span></p>
                      </div>
                      <div className="group relative">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          {t('soulDepreciation')}
                          <Info className="w-3 h-3 cursor-help" />
                        </p>
                        <p className="text-3xl font-bold text-prism-teal">-{ (dashboardData.stressTest.soulDepreciationRate * 100).toFixed(0) }%</p>
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-cool-gray text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                          {t('soulDepreciationDesc')}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-cool-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm text-cool-gray leading-relaxed italic">
                        "{dashboardData.stressTest.recommendation}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Privacy-Safe Referrals */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('privacySafeOpportunities')}</h3>
                  {dashboardData.offers?.map(offer => (
                    <div key={offer.id} className="glass-card p-6 flex items-start gap-5 hover:border-plaid-blue transition-all cursor-pointer group">
                      <div className="p-3.5 bg-plaid-blue/5 rounded-2xl group-hover:bg-plaid-blue/10 transition-colors">
                        <ArrowUpRight className="w-6 h-6 text-plaid-blue" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-cool-gray">{offer.title}</h4>
                          <span className="text-[10px] font-bold text-prism-teal uppercase tracking-widest">{t('earn')} ${offer.commissionEstimate}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 leading-snug">{offer.description}</p>
                        <a 
                          href={offer.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-plaid-blue hover:underline inline-flex items-center gap-1.5 uppercase tracking-wider"
                        >
                          {t('claimOffer')} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InsightCard 
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title={t('taxlossHarvesting')}
                  description={dashboardData.taxHarvesting.description}
                  color="prism-teal"
                  badge="ACTIVE"
                  footer={
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl w-full">
                      <div className="text-xs">
                        <span className="text-gray-400 block uppercase tracking-wider font-bold mb-0.5">{t('estimatedSavings')}</span>
                        <span className="text-xl font-bold text-cool-gray">{formatCurrency(dashboardData.taxHarvesting.estimatedSavings)}</span>
                      </div>
                      <button 
                        onClick={() => setShowTaxModal(true)}
                        className="px-4 py-2 bg-cool-gray text-white text-xs font-bold rounded-lg hover:bg-black transition-colors uppercase tracking-wider"
                      >
                        {t('reviewStrategy')}
                      </button>
                    </div>
                  }
                />
                <div className="glass-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-cool-gray uppercase tracking-widest">{t('recentTransactions')}</h3>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs font-bold text-plaid-blue hover:underline uppercase tracking-wider"
                    >
                      {t('viewAll')}
                    </button>
                  </div>
                  <div className="space-y-4">
                    {transactions.slice(0, 4).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-cool-gray truncate max-w-[150px]">{tx.description}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{tx.date} • {tx.category || t('general')}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </span>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-center py-6 opacity-40">
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t('noRecentTransactions')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Forex Signals Section */}
              {dashboardData.forexSignals && (
                <div className="glass-card p-8 mt-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-cool-gray">{t('forexIntelligence')}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('forexSignalEngine')}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-prism-teal/5 rounded-lg border border-prism-teal/10">
                      <TrendingUp className="w-3 h-3 text-prism-teal" />
                      <span className="text-[10px] font-bold text-prism-teal uppercase tracking-widest">{t('realTime')}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardData.forexSignals?.map((signal, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{signal.pair}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            signal.signal === 'BUY' ? 'bg-emerald-50 text-emerald-600' :
                            signal.signal === 'SELL' ? 'bg-red-50 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {signal.signal}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xl font-bold text-cool-gray">{signal.rate}</span>
                          <span className={`text-[10px] font-bold ${signal.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {signal.trend === 'up' ? '↑' : '↓'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">{signal.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                <div className="grid grid-cols-1 gap-8">
                  <MinionCommandCenter tasks={minionTasks} onExecute={executeMinion} accountsCount={accounts.length} t={t} />
                </div>
              </motion.div>
            )}

          {activeTab === 'accounts' && (
            <motion.div 
              key="accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex flex-col gap-4 px-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('globalAssets')}</h3>
                      <div className="flex items-center gap-2">
                        {selectedAccountIds.length > 0 && (
                          <button 
                            onClick={handleBulkDelete}
                            className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t('deleteSelected')} ({selectedAccountIds.length})
                          </button>
                        )}
                        {!ready && linkToken && <span className="text-[8px] text-amber-500 font-bold uppercase animate-pulse">{t('initializing')}</span>}
                        {accountMode === 'hybrid' && (
                          <button 
                            onClick={() => ready && open()}
                            disabled={!ready}
                            className="text-[10px] font-bold text-plaid-blue hover:underline uppercase tracking-widest disabled:opacity-50"
                          >
                            {t('connectPlaid')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button 
                        onClick={() => setAccountMode('hybrid')}
                        className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest rounded-lg transition-all ${accountMode === 'hybrid' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400'}`}
                      >
                        {t('hybridMode')}
                      </button>
                      <button 
                        onClick={() => setAccountMode('manual')}
                        className={`flex-1 py-2 text-[8px] font-bold uppercase tracking-widest rounded-lg transition-all ${accountMode === 'manual' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400'}`}
                      >
                        {t('manualMode')}
                      </button>
                    </div>

                    <button 
                      onClick={() => setEditingAccount({ id: '', name: '', balance: 0, currency: displayCurrency, type: 'Checking', institution: '', updatedAt: new Date().toISOString() })}
                      className="w-full py-3 bg-white border border-gray-200 text-cool-gray text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('addManual')}
                    </button>
                  </div>

                  <input 
                    type="file" 
                    id="ocr-upload-input" 
                    className="hidden" 
                    accept="image/*,application/pdf,text/csv,text/plain,.csv,.txt,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
                    onChange={onFileChange}
                  />
                  <div className="glass-card p-6 border-dashed border-2 border-gray-200 hover:border-prism-teal transition-all group cursor-pointer bg-gray-50/30" onClick={handleOCRUpload}>
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      {isOCRProcessing ? (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-prism-teal border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-[10px] font-bold text-prism-teal uppercase tracking-widest animate-pulse">{t('parsingStatement')}</p>
                        </div>
                      ) : showOCRSuccess ? (
                        <div className="flex flex-col items-center">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Asset Synced to Local DB</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-prism-teal group-hover:text-white transition-all duration-300 shadow-sm mb-4">
                            <Camera className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold text-cool-gray mb-1">Import Global Assets</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-relaxed">Drop Screenshot, CSV, or PDF<br/>for Local-First Sync</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder={t('searchAccounts')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-plaid-blue/10 focus:border-plaid-blue transition-all outline-none shadow-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {['All', 'Checking', 'Savings', 'Investment', 'Credit Card'].map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedCategory(type === 'All' ? 'All Categories' : type)}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                            (type === 'All' && selectedCategory === 'All Categories') || selectedCategory === type
                              ? 'bg-plaid-blue text-white shadow-md'
                              : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                    <Reorder.Group axis="y" values={accountOrder} onReorder={setAccountOrder} className="space-y-3">
                      {accounts
                        .filter(acc => {
                          const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                               acc.institution.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesType = selectedCategory === 'All Categories' || acc.type === selectedCategory;
                          return matchesSearch && matchesType;
                        })
                        .map(account => (
                          <AccountListItem
                            key={account.id}
                            account={account}
                            selectedAccount={selectedAccount}
                            setSelectedAccount={setSelectedAccount}
                            selectedAccountIds={selectedAccountIds}
                            handleToggleSelectAccount={handleToggleSelectAccount}
                            displayCurrency={displayCurrency}
                            formatCurrency={formatCurrency}
                            t={t}
                          />
                        ))}
                    </Reorder.Group>
                    {accounts.length === 0 && (
                      <div className="text-center py-10 opacity-40">
                        <Building2 className="w-8 h-8 mx-auto mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{t('noAccounts')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <AnimatePresence mode="wait">
                    {selectedAccount ? (
                      <motion.div 
                        key={selectedAccount}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-8 relative overflow-hidden"
                      >
                        {(() => {
                          const account = accounts.find(a => a.id === selectedAccount);
                          if (!account) return null;
                          return (
                            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <InstitutionLogo 
                        src={account.logo} 
                        name={account.institution} 
                        className="w-14 h-14" 
                      />
                      <div>
                        {account.currency === 'TWD' && account.type === 'Investment' && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-prism-teal/10 text-prism-teal text-[8px] font-bold rounded uppercase tracking-widest">{t('taiwanSecurities')}</span>
                          </div>
                        )}
                        <h3 className="text-2xl font-bold text-cool-gray tracking-tight">{account.name}</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{account.institution} • {account.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingAccount(account)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-plaid-blue hover:border-plaid-blue/20 rounded-xl transition-all shadow-sm"
                        title={t('editAccount')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all shadow-sm"
                        title={t('deleteAccount')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">{t('availableBalance')} ({displayCurrency})</p>
                  <p className="text-4xl font-bold text-plaid-blue tracking-tighter hover:scale-105 transition-transform cursor-pointer">{formatCurrency(account.balance, account.currency)}</p>
                </div>
              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{t('monthlyGrowth')}</p>
                                  <p className="text-xl font-bold text-emerald-700">
                                    {(() => {
                                      const txs = transactions.filter(t => t.accountId === account.id);
                                      if (txs.length < 2) return '+0.0%';
                                      const totalIn = txs.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
                                      const growth = account.balance > 0 ? (totalIn / account.balance) * 100 : 0;
                                      return `+${growth.toFixed(1)}%`;
                                    })()}
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{t('annualYield')}</p>
                                  <p className="text-xl font-bold text-blue-700">
                                    {account.annualYield ? `${account.annualYield.toFixed(2)}%` : (account.type === 'Investment' ? '6.80%' : account.type === 'Savings' ? '4.25%' : '0.01%')}
                                  </p>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{t('riskProfile')}</p>
                                  <p className="text-xl font-bold text-indigo-700">
                                    {account.riskProfile ? t(account.riskProfile.toLowerCase() as any) : (account.type === 'Investment' ? t('moderate') : t('low'))}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('historicalPerformance')}</h4>
                                  <div className="flex gap-2">
                                    {['1W', '1M', '3M', '1Y', 'ALL'].map(tRange => (
                                      <button 
                                        key={tRange} 
                                        onClick={() => setAccountTimeRange(tRange as any)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${tRange === accountTimeRange ? 'bg-cool-gray text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                                      >
                                        {tRange}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="h-72 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={(() => {
                                      const base = account.balance;
                                      const txs = transactions.filter(t => t.accountId === account.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                      
                                      // Determine number of days based on timeRange
                                      let days = 30;
                                      if (accountTimeRange === '1W') days = 7;
                                      if (accountTimeRange === '3M') days = 90;
                                      if (accountTimeRange === '1Y') days = 365;
                                      if (accountTimeRange === 'ALL') days = 730;

                                      const data = [];
                                      let currentBalance = base;
                                      for (let i = days; i >= 0; i--) {
                                        const date = new Date();
                                        date.setDate(date.getDate() - i);
                                        const dateStr = date.toISOString().split('T')[0];
                                        
                                        const dayTxs = txs.filter(t => t.date.startsWith(dateStr));
                                        const dayChange = dayTxs.reduce((sum, t) => sum + t.amount, 0);
                                        const noise = dayChange === 0 ? (Math.random() - 0.5) * (base * 0.005) : 0;
                                        
                                        currentBalance += dayChange + noise;
                                        data.push({
                                          day: days > 30 
                                            ? date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-TW', { month: 'short', year: '2-digit' })
                                            : date.toLocaleDateString(language === 'en' ? 'en-US' : 'zh-TW', { month: 'short', day: 'numeric' }),
                                          balance: Math.max(0, currentBalance)
                                        });
                                      }
                                      return data;
                                    })()}>
                                      <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#0052CC" stopOpacity={0.15}/>
                                          <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} interval={6} />
                                      <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', padding: '12px' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
                                        formatter={(value: number) => [formatCurrency(value, account.currency), t('balance')]}
                                      />
                                      <Area 
                                        type="monotone" 
                                        dataKey="balance" 
                                        stroke="#0052CC" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorBalance)" 
                                        animationDuration={2000}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              <div className="space-y-4 mb-10">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('holdings')}</h4>
                                  <button 
                                    onClick={() => setActiveTab('accounts')}
                                    className="text-[10px] font-bold text-plaid-blue hover:underline uppercase tracking-widest">{t('manageAssets')}</button>
                                </div>
                                <div className="glass-card overflow-hidden border border-gray-100">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('assetName')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('quantity')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('costBasis')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('currentPrice')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('totalValue')}</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">{t('gainLoss')}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {(!account.holdings || account.holdings.length === 0) ? (
                                        <tr>
                                          <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center opacity-30">
                                              <Target className="w-8 h-8 mb-2" />
                                              <p className="text-[10px] font-bold uppercase tracking-widest">{t('noHoldingsDetected')}</p>
                                              <p className="text-[8px] mt-1">{t('uploadStatementToSync')}</p>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        account.holdings.map((holding, i) => {
                                          const totalValue = holding.quantity * holding.currentPrice;
                                          const totalCost = holding.quantity * holding.costBasis;
                                          const gainLoss = totalValue - totalCost;
                                          const gainLossPercent = totalCost !== 0 ? (gainLoss / totalCost) * 100 : 0;
                                          
                                          return (
                                            <tr key={holding.id || i} className="hover:bg-gray-50/50 transition-colors">
                                              <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-cool-gray">{holding.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{holding.symbol}</p>
                                              </td>
                                              <td className="px-6 py-4 text-right text-sm font-bold text-cool-gray">{holding.quantity}</td>
                                              <td className="px-6 py-4 text-right text-sm font-bold text-cool-gray">{formatCurrency(holding.costBasis, holding.currency || account.currency)}</td>
                                              <td className="px-6 py-4 text-right text-sm font-bold text-cool-gray">{formatCurrency(holding.currentPrice, holding.currency || account.currency)}</td>
                                              <td className="px-6 py-4 text-right text-sm font-bold text-cool-gray">{formatCurrency(totalValue, holding.currency || account.currency)}</td>
                                              <td className="px-6 py-4 text-right">
                                                <div className={`flex flex-col items-end ${gainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                  <span className="text-sm font-bold">{gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss, holding.currency || account.currency)}</span>
                                                  <span className="text-[10px] font-bold uppercase tracking-widest">{gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%</span>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('recentActivity')}</h4>
                                  <button 
                                    onClick={() => setActiveTab('transactions')}
                                    className="text-[10px] font-bold text-plaid-blue hover:underline uppercase tracking-widest">{t('viewLedger')}</button>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                  {transactions.filter(t => t.accountId === account.id).slice(0, 4).map((tx, i) => (
                                    <motion.div 
                                      key={tx.id + i} 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: i * 0.1 }}
                                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                                          <ArrowUpRight className={`w-5 h-5 ${tx.amount < 0 ? 'text-cool-gray' : 'text-emerald-500'}`} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-cool-gray">{tx.description}</p>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric' })} • {tx.category}</p>
                                        </div>
                                      </div>
                                      <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-cool-gray' : 'text-emerald-500'}`}>
                                        {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    ) : (
                      <div className="glass-card p-12 h-full flex flex-col items-center justify-center text-center space-y-6 bg-gray-50/30 border-dashed border-2">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm">
                          <Building2 className="w-12 h-12" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-cool-gray tracking-tight">{t('selectAccount')}</h3>
                          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{t('selectAccountDesc')}</p>
                        </div>
                        <button 
                          onClick={() => ready && open()}
                          disabled={!ready}
                          className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-cool-gray uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                          {!ready && linkToken && <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />}
                          {ready ? t('connectMore') : t('plaidInitializing')}
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                  <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-plaid-blue transition-colors" />
                    <input 
                      type="text" 
                      placeholder={t('searchTransactions')} 
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-plaid-blue/5 focus:bg-white focus:border-plaid-blue transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl group hover:bg-white hover:border-gray-300 transition-all cursor-pointer">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select 
                        className="bg-transparent text-[10px] font-bold text-cool-gray focus:outline-none uppercase tracking-[0.15em] cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="All Categories">{t('allCategories')}</option>
                        <option value="Food & Drink">{t('foodDrink')}</option>
                        <option value="Travel">{t('travel')}</option>
                        <option value="Transfer">{t('transfer')}</option>
                        <option value="Investment">{t('investment')}</option>
                        <option value="General">{t('general')}</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleBulkCategorize}
                      disabled={isCategorizing}
                      className="flex items-center gap-2 px-6 py-3 bg-prism-teal text-white text-[10px] font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-prism-teal/10 uppercase tracking-[0.15em] disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isCategorizing ? 'animate-pulse' : ''}`} />
                      {isCategorizing ? t('categorizing') : t('aiCategorize')}
                    </button>
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 px-6 py-3 bg-cool-gray text-white text-[10px] font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-cool-gray/10 uppercase tracking-[0.15em]"
                    >
                      <Download className="w-4 h-4" />
                      {t('export')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card overflow-hidden border border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('date')}</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('merchantDescription')}</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('category')}</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t('account')}</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">{t('amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions
                        .filter(tx => {
                          const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesCategory = selectedCategory === 'All Categories' || tx.category === selectedCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map((tx, i) => (
                        <motion.tr 
                          key={tx.id} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.5) }}
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <p className="text-sm font-bold text-cool-gray">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <ArrowUpRight className={`w-5 h-5 ${tx.amount < 0 ? 'text-cool-gray' : 'text-emerald-500'}`} />
                              </div>
                              <p className="text-sm font-bold text-cool-gray tracking-tight">{tx.description}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                              tx.category === 'Food & Drink' ? 'bg-orange-50 text-orange-600' :
                              tx.category === 'Travel' ? 'bg-blue-50 text-blue-600' :
                              tx.category === 'Transfer' ? 'bg-purple-50 text-purple-600' :
                              tx.category === 'Investment' ? 'bg-indigo-50 text-indigo-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {tx.category || 'General'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-gray-300" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {accounts.find(a => a.id === tx.accountId)?.name || t('unknown')}
                              </span>
                            </div>
                          </td>
                          <td className={`px-8 py-5 text-right`}>
                            <div className="flex flex-col items-end">
                              <span className={`text-base font-bold tracking-tight ${tx.amount < 0 ? 'text-cool-gray' : 'text-emerald-500'}`}>
                                {tx.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{displayCurrency}</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {transactions.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-cool-gray">{t('noTransactionsFound')}</h3>
                    <p className="text-sm text-gray-500">{t('adjustSearchFilters')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tax' && data && (
            <motion.div 
              key="tax"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 max-w-7xl mx-auto"
            >
              {/* Decision Engine Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('engineStatus')} — {t('engineVersion')} 2.4.1</span>
                  </div>
                  <h2 className="text-3xl font-bold text-cool-gray tracking-tighter sm:text-4xl">{t('taxDecisionEngine')}</h2>
                  <p className="text-sm text-gray-500 mt-2 max-w-xl">
                    {t('strategicSummary')}: {taxResidencyStatus === 'H1B' ? t('h1bStrategySummary') : t('defaultStrategySummary')} 
                    {t('nextReview')}: {new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end mr-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{t('currentStatus')}</span>
                    <span className="text-sm font-bold text-plaid-blue tracking-tight">{taxResidencyStatus}</span>
                  </div>
                  <button 
                    onClick={handleDeepTaxScan}
                    disabled={isScanningTax}
                    className="relative group px-8 py-4 bg-black text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-prism-teal/20 to-plaid-blue/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    <div className="relative flex items-center gap-3">
                      {isScanningTax ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          {t('scanningSystem')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          {t('scanSystem')}
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Bento Grid: Vital Signs & Priorities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Efficiency Score Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="glass-card p-8 aspect-square flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
                    <div className="relative z-10">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">{t('taxEfficiencyScore')}</h4>
                      <div className="relative inline-block">
                        <svg className="w-48 h-48 transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                          <motion.circle 
                            initial={{ strokeDasharray: "0, 1000" }}
                            animate={{ strokeDasharray: `${(data.taxComplianceScore || 0) * 5.5}, 1000` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="transparent" className="text-plaid-blue" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-bold text-cool-gray tracking-tighter">{data.taxComplianceScore || 0}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">/ 100</span>
                        </div>
                      </div>
                      <p className="mt-8 text-xs font-bold text-emerald-600 uppercase tracking-widest">{t('optimalTaxHealth')}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-plaid-blue/5 rounded-full blur-3xl" />
                  </div>

                  {/* Savings Summary */}
                  <div className="glass-card p-6 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('estimatedSavings')}</p>
                      <p className="text-2xl font-bold text-cool-gray tracking-tight">{formatCurrency(data.taxSavings)}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Priority Action Feed Column */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t('priorityActions')}</h3>
                    <div className="h-px flex-1 bg-gray-100 mx-6" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {taxTopActions.map((action, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 border-l-4 border-l-plaid-blue group hover:shadow-xl transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                            action.type === 'COMPLIANCE' ? 'bg-rose-50 text-rose-600' :
                            action.type === 'STRATEGY' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {action.type === 'COMPLIANCE' ? t('compliance') : action.type === 'STRATEGY' ? t('strategy') : action.type}
                          </span>
                          {action.impact === 'HIGH' && (
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <h5 className="text-sm font-bold text-cool-gray mb-2 group-hover:text-black transition-colors">{action.title}</h5>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-4 line-clamp-2">{action.reason}</p>
                        <button 
                          onClick={() => {
                            if (action.type === 'COMPLIANCE' && action.title.includes('FBAR')) setShowFBARModal(true);
                            else if (action.type === 'STRATEGY' && (action.title.includes('Wash Sale') || action.action === 'tax_loss_harvesting')) setShowTaxExecutionModal(true);
                            else if (action.type === 'STRATEGY' && action.action === 'ftc_optimization') window.open('https://www.irs.gov/individuals/international-taxpayers/foreign-tax-credit', '_blank');
                            else if (action.type === 'STRATEGY' && (action.action === 'Apply Credit' || action.title.includes('Foreign Tax Credit'))) window.open('https://www.irs.gov/individuals/international-taxpayers/foreign-tax-credit', '_blank');
                            else if (action.type === 'STRATEGY' && (action.action === 'Read Guide' || action.title.includes('8833'))) window.open('https://www.irs.gov/forms-pubs/about-form-8833', '_blank');
                            else if (action.type === 'ALLOCATION' || action.title.includes('Rebalancing')) setActiveTab('dashboard');
                            else if (action.title.includes('W-8BEN')) window.open('https://www.irs.gov/forms-pubs/about-form-w-8-ben', '_blank');
                            else if (action.action === 'Analyze Yield') setActiveTab('accounts');
                            else if (action.type === 'STRATEGY' && action.action === 'exit_tax_planning') window.open('https://www.irs.gov/individuals/international-taxpayers/expatriation-tax', '_blank');
                            else if (action.type === 'STRATEGY' && action.action === 'amt_optimization') window.open('https://www.ntbsa.gov.tw/english/multiplehtml/6763e9f85d3b4b88aeb78f6f59c0496d', '_blank');
                            else alert(t('executionInitiated').replace('{{title}}', action.title));
                          }}
                          className="flex items-center gap-2 text-[9px] font-bold text-plaid-blue uppercase tracking-widest hover:gap-3 transition-all"
                        >
                          {action.action || t('reviewAndExecute')} <ArrowRight className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}

                    {/* FBAR Hook */}
                    {data.taxReports?.fbar && (
                      <div className="glass-card p-6 border-l-4 border-l-emerald-500 bg-emerald-50/30">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded uppercase tracking-widest">
                            {t('compliance')}
                          </span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h5 className="text-sm font-bold text-cool-gray mb-2">{t('fbarComplianceLong')}</h5>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-4">{t('fbarComplianceDesc')}</p>
                        <button 
                          onClick={() => setShowFBARModal(true)}
                          className="flex items-center gap-2 text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:gap-3 transition-all"
                        >
                          {t('generateDraftForm')} <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optimization Pillars */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-cool-gray uppercase tracking-[0.2em]">{t('optimizationPillars')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1: Asset Mastery */}
                  <div className="glass-card p-8 flex flex-col h-full">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-cool-gray mb-2">{t('pillarAsset')}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-grow">{t('washSaleAvoidanceDesc')}</p>
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('harvestableLoss')}</p>
                        <p className="text-sm font-bold text-cool-gray">{formatCurrency(data.harvestableLoss)}</p>
                      </div>
                      <button 
                        onClick={() => setShowTaxExecutionModal(true)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        {t('review')}
                      </button>
                    </div>
                  </div>

                  {/* Pillar 2: Future Planning */}
                  <div className="glass-card p-8 flex flex-col h-full bg-gradient-to-br from-indigo-50/20 to-transparent">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                      <History className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-cool-gray mb-2">{t('pillarRetirement')}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-grow">{t('rothConversionDesc').substring(0, 120)}...</p>
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('retirementOptimization')}</p>
                        <p className="text-sm font-bold text-purple-600 uppercase tracking-widest">{t('activeInsight')}</p>
                      </div>
                      <button className="px-4 py-2 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                        {t('readAdvice')}
                      </button>
                    </div>
                  </div>

                  {/* Pillar 3: Cross-Border Integrity */}
                  <div className="glass-card p-8 flex flex-col h-full">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-cool-gray mb-2">{t('pillarCompliance')}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-grow">{t('complianceScoreDesc')} ({taxResidencyStatus}).</p>
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('liabilityBuffer')}</p>
                        <p className="text-sm font-bold text-cool-gray">{formatCurrency(Math.max(0, 210000 - (data.twAssetsUSD || 0)))}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{t('nominal')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Tools Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <BeforeAfterImpact data={data} t={t} />
                  <ScenarioSimulator data={data} t={t} />
                </div>
                
                <div className="lg:col-span-4 space-y-6">
                  {/* Calendar/Deadlines */}
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('taxDeadlines')}</h4>
                       <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <TaxDeadlineTimeline 
                      deadlines={data.taxDeadlines || []} 
                      onToggle={handleToggleDeadline}
                      onSync={handleCalendarSync}
                      t={t}
                    />
                  </div>

                  {/* Quick Checklist */}
                  <div className="glass-card p-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('complianceChecklist')}</h4>
                    <div className="space-y-4">
                      {[
                        { label: t('fbarComplianceLong') || 'FBAR (FinCEN 114)', status: t('ready') },
                        { label: t('fatcaCompliance') || 'FATCA (Form 8938)', status: t('required') },
                        { label: t('twIncomeTax') || 'Taiwan Income Tax', status: t('upcoming') },
                        { label: t('w8benRenewal') || 'W-8BEN Renewal', status: t('valid') },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{item.label}</span>
                          <span className={`text-[9px] font-bold px-2 py-1 rounded ${
                            item.status === t('required') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulator' && data && (
            <motion.div 
              key="simulator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8 bg-cool-gray text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t('trueGlobalPurchasingPower')}</h3>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-5xl font-bold tracking-tighter">{formatCurrency(data.totalPurchasingPower * 0.92)}</span>
                        <span className="text-sm font-medium text-gray-400">{t('afterTaxUSD')}</span>
                      </div>
                      <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                        {t('sovereignLiquidityDesc')}
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Globe className="w-32 h-32" />
                    </div>
                  </div>

                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-bold text-cool-gray">{t('nycStressTest')}</h3>
                      <span className="px-3 py-1 bg-prism-teal/10 text-prism-teal text-[10px] font-bold rounded-full uppercase tracking-widest">{t('simulationActive')}</span>
                    </div>
                    
                    <div className="h-[300px] w-full mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={simulationData}>
                          <defs>
                            <linearGradient id="colorRunway" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00A3C4" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#00A3C4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                          />
                          <Area type="monotone" dataKey="balance" stroke="#00A3C4" fillOpacity={1} fill="url(#colorRunway)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('projectedRunway')}</p>
                        <div className="flex items-baseline gap-2">
                          <p className={`text-3xl font-bold ${isSustainable ? 'text-emerald-600' : 'text-cool-gray'}`}>
                            {isSustainable ? '∞' : calculatedRunway}
                          </p>
                          <span className="text-xs text-gray-400 font-medium">{isSustainable ? t('sustainable') : t('months')}</span>
                        </div>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('soulDepreciation')}</p>
                        <p className="text-3xl font-bold text-prism-teal">
                          {soulDepreciation}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Hardware-style Controls */}
                  <div className="glass-card p-6 bg-cool-gray text-white">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('simulationEngine')} v1.0</h4>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('monthlyRentNYC')}</label>
                          <span className="text-sm font-mono text-prism-teal">${simRent}</span>
                        </div>
                        <input 
                          type="range" min="2000" max="10000" step="100"
                          value={simRent} onChange={(e) => setSimRent(parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-prism-teal"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('lifestyleMultiplier')}</label>
                          <span className="text-sm font-mono text-prism-teal">{simLifestyle}x</span>
                        </div>
                        <input 
                          type="range" min="1" max="3" step="0.1"
                          value={simLifestyle}
                          onChange={(e) => setSimLifestyle(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-prism-teal"
                        />
                        <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">1.0 = {t('frugal')} | 3.0 = {t('lavish')}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('postTaxSalary')}</label>
                          <span className="text-sm font-mono text-prism-teal">${simSalary}</span>
                        </div>
                        <input 
                          type="range" min="0" max="25000" step="500"
                          value={simSalary} onChange={(e) => setSimSalary(parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-prism-teal"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('investmentReturn')}</label>
                          <span className="text-sm font-mono text-prism-teal">{(simReturn * 100).toFixed(1)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="0.2" step="0.01"
                          value={simReturn} onChange={(e) => setSimReturn(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-prism-teal"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-700 flex items-center justify-between">
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest w-full">
                        <div className="flex gap-4">
                          <span>{t('status')}: {isSustainable ? t('stable') : t('depleting')}</span>
                          <span>{t('mode')}: {t('manual')}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSimRent(4500);
                            setSimSalary(12000);
                            setSimReturn(0.07);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {t('resetToDefault')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-cool-gray">{t('riskAlert')}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      {isSustainable 
                        ? t('sustainablePathDesc') || "Your current simulation shows a sustainable path. Consider increasing your investment return target to accelerate wealth growth."
                        : t('depletedPathDesc') || "At this burn rate, your liquid assets will be depleted. Consider a lower rent target or increasing your post-tax income."}
                    </p>
                    <button 
                      onClick={() => setActiveTab('strategy')}
                      className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:underline"
                    >
                      {t('viewHedgeStrategy')} →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'strategy' && data && data.strategy && (
            <motion.div 
              key="strategy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="glass-card p-10 bg-cool-gray text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-prism-teal/20 rounded-2xl text-prism-teal group-hover:scale-110 transition-transform">
                      <Compass className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{t(data.strategy.title)}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{t('activePortfolioManagement')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 max-w-2xl leading-relaxed mb-8">
                    {t(data.strategy.summary)}
                  </p>
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('riskLevel')}</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((level) => (
                          <div 
                            key={level}
                            className={`w-4 h-1.5 rounded-full ${
                              level === 1 ? 'bg-emerald-500' :
                              level === 2 ? (data.strategy.riskLevel === 'MEDIUM' || data.strategy.riskLevel === 'HIGH' ? 'bg-amber-500' : 'bg-gray-700') :
                              (data.strategy.riskLevel === 'HIGH' ? 'bg-red-500' : 'bg-gray-700')
                            }`}
                          />
                        ))}
                        <span className={`text-[10px] font-bold ml-2 uppercase ${
                          data.strategy.riskLevel === 'LOW' ? 'text-emerald-400' :
                          data.strategy.riskLevel === 'MEDIUM' ? 'text-amber-400' :
                          'text-red-400'
                        }`}>{t(data.strategy.riskLevel.toLowerCase() as any)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('nextReview')}</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                        <Calendar className="w-3 h-3 text-prism-teal" />
                        <span className="text-[10px] font-bold text-white uppercase">{data.strategy.nextReviewDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target className="w-64 h-64" />
                </div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-prism-teal/10 rounded-full blur-3xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {data.strategy.pillars.map((pillar, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-8 flex flex-col h-full hover:shadow-2xl hover:bg-white transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${
                        pillar.impact === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                        pillar.impact === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {t(pillar.impact.toLowerCase() as any)} {t('impact')}
                      </span>
                      <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-cool-gray group-hover:text-white transition-colors">
                        <span className="text-xs font-bold">0{idx + 1}</span>
                      </div>
                    </div>
                    <h4 className="text-base font-bold text-cool-gray mb-3 group-hover:text-black transition-colors">{t(pillar.title as any)}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-8 flex-1">
                      {t(pillar.description as any)}
                    </p>
                    <button 
                      onClick={() => executeMinion(pillar.action)}
                      className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold text-cool-gray uppercase tracking-[0.2em] hover:bg-cool-gray hover:text-white hover:border-cool-gray transition-all flex items-center justify-center gap-3 shadow-sm"
                    >
                      <Zap className="w-4 h-4 text-prism-teal" />
                      {t('executeMinion')}
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="glass-card p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-bold text-cool-gray tracking-tight">{t('minionIntelligenceFeed')}</h3>
                     <p className="text-xs text-gray-400 font-medium">{t('marketSentimentNews')}</p>
                  </div>
                  <button 
                    onClick={generateStrategyNews}
                    disabled={isGeneratingNews}
                    className="p-3 hover:bg-gray-50 rounded-2xl transition-all border border-gray-100 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${isGeneratingNews ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {strategyNews.map((news, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 4 }}
                      className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{news.source}</span>
                        <span className={`text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest ${
                          news.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-600' :
                          news.sentiment === 'NEUTRAL' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>{news.sentiment}</span>
                      </div>
                      <h5 className="text-sm font-bold text-cool-gray mb-3">{news.title}</h5>
                      <p className="text-xs text-gray-500 leading-relaxed">{news.summary}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-cool-gray tracking-tight">{t('aiConversationHistory')}</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('wealthTaxExpertAssistant')}</p>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(t('clearHistory') + '?')) {
                      setAccountChatHistory([]);
                    }
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 text-red-500 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('clearHistory')}
                </button>
              </div>

              <div className="glass-card p-8 md:p-12 min-h-[60vh] flex flex-col">
                <div className="flex-1 space-y-8">
                  {accountChatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-24">
                      <MessageSquare className="w-16 h-16 mb-6" />
                      <p className="text-sm font-bold uppercase tracking-widest">{t('noConversationHistory')}</p>
                      <p className="text-xs mt-2 max-w-xs mx-auto">Start a chat with the AI Assistant in the bottom right corner to see your history here.</p>
                    </div>
                  ) : (
                    <>
                      {/* Threads Sidebar / Selector */}
                      {accountChatHistory.length > 0 && (
                        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                          <button className="flex-shrink-0 px-6 py-3 bg-plaid-blue text-white text-[10px] font-bold rounded-xl uppercase tracking-widest shadow-lg shadow-plaid-blue/20">
                            Current Strategy Session
                          </button>
                          <button className="flex-shrink-0 px-6 py-3 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all opacity-50 cursor-not-allowed">
                            Past Optimization (Archived)
                          </button>
                          <button className="flex-shrink-0 px-6 py-3 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all opacity-50 cursor-not-allowed">
                            Tax Compliance Q1 (Archived)
                          </button>
                        </div>
                      )}

                      {paginatedHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-8 rounded-3xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-plaid-blue text-white rounded-tr-none' 
                              : 'bg-white border border-gray-100 text-cool-gray rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-2 mb-3 opacity-60">
                              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                              <span className="text-[10px] font-bold uppercase tracking-widest">{msg.role === 'user' ? t('you') : t('aiAssistant')}</span>
                            </div>
                            {msg.role === 'user' ? (
                              msg.content
                            ) : (
                              <div className="markdown-body prose prose-sm max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-50">
                          <button 
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {t('page')} {currentPage + 1} {t('of')} {totalPages}
                          </span>
                          <button 
                            disabled={currentPage === totalPages - 1}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                            className="p-2 bg-white border border-gray-100 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-cool-gray">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-cool-gray tracking-tight">{t('profileSettings')}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('personalInformation')}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('fullName')}</label>
                      <input 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-plaid-blue/5 focus:bg-white focus:border-plaid-blue transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('masterKey')}</label>
                      <div className="relative">
                        <input 
                          type="password" 
                          value={masterKey} 
                          onChange={(e) => setMasterKey(e.target.value)}
                          placeholder={t('masterKeyPlaceholder')}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-plaid-blue/5 focus:bg-white focus:border-plaid-blue transition-all" 
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2">{t('masterKeyDesc')}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('primaryCurrency')}</label>
                      <select 
                        value={displayCurrency}
                        onChange={(e) => setDisplayCurrency(e.target.value as 'USD' | 'TWD')}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-plaid-blue/5 focus:bg-white focus:border-plaid-blue transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">{t('usdFull')}</option>
                        <option value="TWD">{t('twdFull')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('language')}</label>
                      <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button 
                          onClick={() => setLanguage('en')}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          English
                        </button>
                        <button 
                          onClick={() => setLanguage('zh')}
                          className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${language === 'zh' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          繁體中文
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('taxResidency')}</label>
                      <select 
                        value={taxResidencyStatus}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setTaxResidencyStatus(val);
                          localStorage.setItem('tax_residency_status', val);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-plaid-blue/5 focus:bg-white focus:border-plaid-blue transition-all appearance-none cursor-pointer mb-2"
                      >
                        <option value="H1B">{t('h1bStatusLabel')}</option>
                        <option value="NRA">{t('nraStatusLabel')}</option>
                        <option value="RA">{t('raStatusLabel')}</option>
                        <option value="F1_OPT">{t('f1OptStatusLabel')}</option>
                        <option value="Dual_Status">{t('dualStatusLabel')}</option>
                      </select>
                      <p className="text-[9px] text-gray-400 font-medium">{t('taxResidencyLabelDesc')}</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('emailAddress')}</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || ''} 
                        disabled
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full mt-10 py-4 bg-cool-gray text-white text-[10px] font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-cool-gray/10 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingSettings ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t('saving')}
                      </>
                    ) : t('saveChanges')}
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-plaid-blue/10 rounded-2xl flex items-center justify-center text-plaid-blue">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-cool-gray tracking-tight">{t('securityApi')}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('externalIntegrations')}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg shadow-sm border border-indigo-100">
                              <Building2 className="w-4 h-4 text-plaid-blue" />
                            </div>
                            <h4 className="text-sm font-bold text-cool-gray">{t('financialNetwork')}</h4>
                          </div>
                          {plaidConnected ? (
                            <span className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('connected')}
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-widest">{t('disconnected')}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
                          {plaidConnected ? 'Your US bank accounts are securely synced via Plaid.' : 'Connect your US bank accounts to enable autonomous rebalancing.'}
                        </p>
                        {plaidConnected ? (
                          <button 
                            onClick={disconnectPlaid}
                            className="w-full py-3 bg-white border border-red-100 text-red-600 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                            {t('disconnectPlaid')}
                          </button>
                        ) : (
                          <button 
                            onClick={() => open()}
                            disabled={!ready}
                            className="w-full py-3 bg-plaid-blue text-white text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-plaid-blue/20 disabled:opacity-50"
                          >
                            {t('connectPlaid')}
                          </button>
                        )}
                      </div>

                      <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Cloud className="w-4 h-4 text-blue-500" />
                            </div>
                            <h4 className="text-sm font-bold text-cool-gray">{t('googleDriveSync')}</h4>
                          </div>
                          {isGoogleConnected ? (
                            <span className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('connected')}
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-widest">{t('disconnected')}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
                          {isGoogleConnected 
                            ? `${t('lastSyncedAt')}: ${lastGoogleSync || t('never')}` 
                            : t('googleDriveSyncDesc')}
                        </p>

                        {googleDriveError && (
                          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-medium flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            {googleDriveError}
                          </div>
                        )}

                        <div className="flex gap-3">
                          {isGoogleConnected ? (
                            <>
                              <button 
                                onClick={() => syncWithGoogleDrive()}
                                disabled={isGoogleSyncing}
                                title={t('syncDrive')}
                                className="flex-1 py-3 bg-cool-gray text-white text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <RefreshCw className={`w-3 h-3 ${isGoogleSyncing ? 'animate-spin' : ''}`} />
                                {t('syncNow')}
                              </button>
                              <button 
                                onClick={() => loadFromGoogleDrive()}
                                disabled={isGoogleSyncing}
                                title={t('restoreDrive')}
                                className="flex-1 py-3 bg-white border border-gray-200 text-cool-gray text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                <Download className="w-3 h-3" />
                                {t('restoreNow')}
                              </button>
                              <button 
                                onClick={disconnectGoogle}
                                className="px-4 py-3 bg-white border border-gray-200 text-gray-400 text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={handleLogin}
                              className="w-full py-3 bg-white border border-gray-200 text-cool-gray text-[10px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Cloud className="w-3 h-3 text-blue-500" />
                              {t('authorizeGoogleDrive')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-10 bg-red-50/30 border-red-100">
                    <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-6">{t('dangerZone')}</h3>
                    <button 
                      onClick={() => auth.signOut()}
                      className="w-full py-4 bg-white border border-red-200 text-red-600 text-[10px] font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white hover:border-red-600 transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('signOutProject')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tax Simulation Modal */}
        <AnimatePresence>
          {showSimulateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSimulateModal(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-cool-gray">{t('taxImpactSimulation')}</h3>
                    <button onClick={() => setShowSimulateModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                    <button 
                      onClick={() => setSimScenario('US_TO_TW')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${simScenario === 'US_TO_TW' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400'}`}
                    >
                      {t('usToTaiwan')}
                    </button>
                    <button 
                      onClick={() => setSimScenario('TW_TO_US')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${simScenario === 'TW_TO_US' ? 'bg-white text-cool-gray shadow-sm' : 'text-gray-400'}`}
                    >
                      {t('taiwanToUs')}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('expectedMonthlyIncome')}</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input type="number" defaultValue="8500" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-prism-teal/20" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{t('projectedMonthlyRent')}</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input type="number" defaultValue="3500" className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-prism-teal/20" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-prism-teal/5 rounded-2xl border border-prism-teal/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('projectedTaxDrag')}</span>
                        <span className="text-lg font-bold text-prism-teal">{simScenario === 'US_TO_TW' ? '-15.2%' : '-28.4%'}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {simScenario === 'US_TO_TW' 
                          ? t('usToTaiwanDesc')
                          : t('taiwanToUsDesc')
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('monthlyNetChange')}</p>
                        <p className="text-xl font-bold text-cool-gray">{simScenario === 'US_TO_TW' ? '+$1,250' : '-$840'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('complianceRisk')}</p>
                        <p className="text-xl font-bold text-amber-600">{t('medium')}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownloadReport}
                    className="w-full mt-8 py-4 bg-cool-gray text-white font-bold rounded-2xl hover:bg-black transition-all uppercase tracking-widest text-xs"
                  >
                    {t('downloadFullReportPDF')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <ConfirmationModal
              title={deleteConfirm.type === 'single' ? t('deleteAccount') : `${t('delete')} ${deleteConfirm.id.length} ${t('accountsSuffix')}`}
              message={t('deleteMessage')}
              onConfirm={handleDeleteConfirmed}
              onCancel={() => setDeleteConfirm(null)}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              isDestructive={true}
            />
          )}
        </AnimatePresence>

        {/* Tax Modal */}
        <AnimatePresence>
          {showTaxModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTaxModal(false)}
                className="absolute inset-0 bg-cool-gray/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cool-gray flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-prism-teal" />
                    {t('taxHarvestingStrategy')}
                  </h3>
                  <button onClick={() => setShowTaxModal(false)} className="text-gray-400 hover:text-cool-gray">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-prism-teal/5 rounded-xl border border-prism-teal/10">
                      <p className="text-sm text-cool-gray leading-relaxed">
                        {dashboardData?.taxHarvesting?.description || t('taxHarvestingDesc')}
                      </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-100 rounded-lg">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{t('targetAsset')}</span>
                      <span className="text-sm font-bold text-rose-600">{dashboardData?.taxHarvesting?.targetAsset || "N/A"}</span>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-lg">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{t('offsetStrategy')}</span>
                      <span className="text-sm font-bold text-emerald-600">{dashboardData?.taxHarvesting?.offsetAsset || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="text-xs text-gray-500 block">{t('projectedTaxSavings')}</span>
                      <span className="text-xl font-bold text-cool-gray">{formatCurrency(dashboardData?.taxHarvesting?.estimatedSavings || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button 
                    onClick={handleExecuteTaxStrategy}
                    className="flex-1 py-2.5 bg-cool-gray text-white rounded-lg font-medium hover:bg-black transition-colors"
                  >
                    Execute Now
                  </button>
                  <button onClick={() => setShowTaxModal(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-cool-gray rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showTaxExecutionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTaxExecutionModal(false)}
                className="absolute inset-0 bg-cool-gray/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cool-gray flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Wash Sale Execution Plan
                  </h3>
                  <button onClick={() => setShowTaxExecutionModal(false)} className="text-gray-400 hover:text-cool-gray">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {t('washSalePlanDesc')}
                      </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('proposedActions')}</h4>
                    {[
                      { action: t('sell'), asset: 'VTI (US Total Stock Market)', amount: '$8,200', reason: t('taxlossHarvesting') },
                      { action: t('sell'), asset: 'QQQ (Nasdaq 100)', amount: '$4,200', reason: t('taxlossHarvesting') },
                      { action: t('hold'), asset: t('cash'), amount: '$12,400', reason: t('washSaleWindow') }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                            item.action === t('sell') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>{item.action}</span>
                          <span className="text-xs font-bold text-cool-gray">{item.asset}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-cool-gray">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button className="flex-1 py-3 bg-cool-gray text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                    {t('confirmAndExecute')}
                  </button>
                  <button onClick={() => setShowTaxExecutionModal(false)} className="flex-1 py-3 bg-white border border-gray-200 text-cool-gray rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                    {t('cancel')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showFBARModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFBARModal(false)}
                className="absolute inset-0 bg-cool-gray/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cool-gray flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    FBAR Draft Generation
                  </h3>
                  <button onClick={() => setShowFBARModal(false)} className="text-gray-400 hover:text-cool-gray">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-900">FBAR_Draft_2025.txt</p>
                      <p className="text-[10px] text-blue-700">Pre-filled with your Taiwan-based account data.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('includedAccounts')}</h4>
                    <div className="space-y-2">
                      {accounts.filter(a => a.currency === 'TWD').map((acc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-xs font-bold text-cool-gray">{acc.institution} - {acc.name}</span>
                          <span className="text-xs font-mono text-gray-500">{formatCurrency(acc.balance, acc.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button 
                    onClick={handleDownloadFBAR}
                    className="flex-1 py-3 bg-plaid-blue text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all"
                  >
                    Download Draft (.txt)
                  </button>
                  <button onClick={() => setShowFBARModal(false)} className="flex-1 py-3 bg-white border border-gray-200 text-cool-gray rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowImportModal(false)}
                className="absolute inset-0 bg-cool-gray/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-cool-gray">{t('importCsvData')}</h3>
                  <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-cool-gray">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-plaid-blue transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-plaid-blue/5 group-hover:text-plaid-blue transition-colors mb-4">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-cool-gray mb-1">{t('clickToUpload')}</p>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('csvOrExcel')}</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                      <span className="bg-white px-3 text-gray-400">Or Smart Paste</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">Paste holding data / portfolio summary</label>
                    <textarea 
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="e.g. Robinhood Portfolio: 10 shares of AAPL at $150, 5 shares of TSLA..."
                      className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs focus:ring-2 focus:ring-plaid-blue/10 focus:border-plaid-blue outline-none transition-all resize-none font-mono"
                    />
                  </div>
                  
                  <div className="mt-6 flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl text-plaid-blue border border-plaid-blue/5">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <p className="text-[10px] font-medium leading-relaxed">
                      AI will automatically parse institutions, balances, and individual stock holdings from your pasted text.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex gap-3">
                  <button 
                    onClick={handleImport}
                    disabled={isProcessingImport}
                    className="flex-1 py-3 bg-plaid-blue text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-plaid-blue/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingImport ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Execute Smart Import'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Account Modal */}
        <AnimatePresence>
          {editingAccount && (
            <EditAccountModal 
              account={editingAccount} 
              onUpdate={handleUpdateAccount} 
              onClose={() => setEditingAccount(null)} 
              t={t}
            />
          )}
        </AnimatePresence>
        </div>

        {/* Global AI Assistant */}
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-3 md:gap-4">
          <AnimatePresence>
            {!isChatMinimized && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] h-[500px] md:h-[600px] max-h-[calc(100vh-8rem)] glass-card overflow-hidden flex flex-col bg-white shadow-2xl border border-gray-100 rounded-3xl"
              >
                <div className="p-4 bg-cool-gray text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('aiAssistant')}</h4>
                      <p className="text-[8px] text-white/60 uppercase font-medium">{t('wealthTaxExpert')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        setActiveTab('history');
                        setIsChatMinimized(true);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Full History"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(t('checkHistoryConfirm'))) {
                          setAccountChatHistory([]);
                        }
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Clear History"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setIsChatMinimized(true)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50 scrollbar-hide">
                  {accountChatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cool-gray">{t('howCanIHelp')}</p>
                      <p className="text-[10px] mt-2 max-w-[200px] text-gray-500 leading-relaxed font-medium">{t('askAIExpert')}</p>
                    </div>
                  ) : (
                    accountChatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] md:text-xs leading-relaxed transition-all ${
                          msg.role === 'user' 
                            ? 'bg-plaid-blue text-white rounded-tr-none shadow-lg shadow-plaid-blue/10' 
                            : 'bg-white border border-gray-100 text-cool-gray rounded-tl-none shadow-sm'
                        }`}>
                          <div className="flex items-center gap-2 mb-1.5 opacity-50">
                            {msg.role === 'user' ? <User className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                            <span className="text-[8px] font-bold uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'Liminality AI'}</span>
                          </div>
                          {msg.role === 'user' ? (
                            <p className="font-medium">{msg.content}</p>
                          ) : (
                            <div className="markdown-body prose prose-xs max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-li:my-0.5">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                  {isAccountChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-plaid-blue/40 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-plaid-blue/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-plaid-blue/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-white">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAccountChat();
                    }}
                    className="relative"
                  >
                    <input 
                      type="text"
                      value={accountChatInput}
                      onChange={(e) => setAccountChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          // Form onSubmit will handle it
                        }
                      }}
                      placeholder="Ask anything..."
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-plaid-blue/10 focus:border-plaid-blue transition-all outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={!accountChatInput.trim() || isAccountChatLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-plaid-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatMinimized(!isChatMinimized)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isChatMinimized ? 'bg-plaid-blue text-white' : 'bg-white text-plaid-blue border border-gray-100'
            }`}
          >
            {isChatMinimized ? (
              <MessageSquare className="w-6 h-6" />
            ) : (
              <ChevronLeft className="w-6 h-6 rotate-[-90deg]" />
            )}
            {isChatMinimized && accountChatHistory.length === 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, collapsed = false, className = '' }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-bold transition-all relative group ${
        active 
          ? 'bg-plaid-blue text-white shadow-lg shadow-plaid-blue/20' 
          : 'text-gray-400 hover:bg-gray-50 hover:text-cool-gray'
      } ${className}`}
      title={collapsed ? label : undefined}
    >
      <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      {!collapsed && <span className="truncate uppercase tracking-widest text-[10px]">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="nav-active"
          className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function WealthHealthScore({ score, factors }: { score: number; factors: any[] }) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="relative z-10 w-full">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Wealth Health Score</h3>
        <div className="relative w-40 h-40 flex items-center justify-center mb-6 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="8"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="transparent"
              stroke={score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold tracking-tighter text-cool-gray"
            >
              {score}
            </motion.span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optimal</span>
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 w-full">
          {factors.map((f) => (
            <div key={f.label} className="text-left p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{f.label}</span>
                <span className={`text-[8px] font-bold ${f.score > 80 ? 'text-emerald-500' : f.score > 60 ? 'text-amber-500' : 'text-red-500'}`}>{f.score}%</span>
              </div>
              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${f.score}%` }}
                  className={`h-full rounded-full ${f.score > 80 ? 'bg-emerald-500' : f.score > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
    </div>
  );
}

function MinionInsights({ insights, onGenerate, isLoading }: { insights: any[]; onGenerate: () => void; isLoading: boolean }) {
  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-cool-gray">Minion Intelligence</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Insights & Alerts</p>
        </div>
        <div className="p-2 bg-cool-gray text-white rounded-lg">
          <Zap className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
      </div>
      <div className="space-y-4">
        {insights.map((insight) => (
          <motion.div 
            key={insight.id}
            whileHover={{ x: 4 }}
            className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-plaid-blue transition-all group cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-xl ${
                insight.type === 'TAX' ? 'bg-emerald-50 text-emerald-600' :
                insight.type === 'FOREX' ? 'bg-blue-50 text-blue-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {insight.type === 'TAX' ? <ShieldCheck className="w-4 h-4" /> :
                 insight.type === 'FOREX' ? <ArrowRightLeft className="w-4 h-4" /> :
                 <TrendingUp className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-cool-gray">{insight.title}</h4>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    insight.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                    insight.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>{insight.priority}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{insight.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-plaid-blue transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>
      <button 
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-plaid-blue hover:text-plaid-blue transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-3 h-3 animate-spin" />
            Analyzing Data...
          </>
        ) : (
          'Generate New Insights'
        )}
      </button>
    </div>
  );
}

function TaxComplianceGauge({ score }: { score: number }) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 flex items-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="transparent"
            stroke="#f3f4f6"
            strokeWidth="6"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="transparent"
            stroke={score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444'}
            strokeWidth="6"
            strokeDasharray={251}
            initial={{ strokeDashoffset: 251 }}
            animate={{ strokeDashoffset: 251 - (251 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-cool-gray">{score}%</span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-cool-gray mb-1">Compliance Score</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your cross-border compliance is <span className="font-bold text-cool-gray">{score > 80 ? 'Excellent' : 'Good'}</span>. 2 items pending for full coverage.
        </p>
      </div>
    </div>
  );
}

function TaxDeadlineTimeline({ deadlines, onToggle, onSync, t }: { deadlines: any[], onToggle: (id: string) => void, onSync: () => void, t: (key: string) => string }) {
  return (
    <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
      {deadlines.map((d, i) => {
        const isCompleted = d.status === 'COMPLETED';
        const isOverdue = d.status === 'OVERDUE';
        
        return (
          <div key={d.id || i} className="relative pl-10 group">
            <button 
              onClick={() => onToggle(d.id)}
              className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all ${
                isCompleted ? 'bg-emerald-500 scale-110' :
                isOverdue ? 'bg-rose-500' :
                d.priority === 'CRITICAL' ? 'bg-red-500' :
                d.priority === 'HIGH' ? 'bg-amber-500' :
                'bg-blue-500'
              }`}
            >
              {isCompleted && <Check className="w-3 h-3 text-white" />}
            </button>
            <div className="flex items-center justify-between mb-1">
              <h5 className={`text-sm font-bold transition-all ${isCompleted ? 'text-gray-400 line-through' : 'text-cool-gray'}`}>
                {d.title}
              </h5>
              <span className="text-[10px] font-mono text-gray-400">{d.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                isCompleted ? 'bg-emerald-50 text-emerald-600' :
                isOverdue ? 'bg-rose-50 text-rose-600 animate-pulse' :
                d.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' : 
                'bg-gray-50 text-gray-600'
              }`}>
                {isCompleted ? t('completed') : isOverdue ? t('overdue') : t('upcomingStat')}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{t('priority')}: {d.priority === 'CRITICAL' ? t('critical') : d.priority === 'HIGH' ? t('high') : d.priority}</span>
            </div>
          </div>
        );
      })}
      
      <button 
        onClick={onSync}
        className="w-full mt-4 py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-white hover:border-plaid-blue hover:text-plaid-blue transition-all flex items-center justify-center gap-2 group"
      >
        <Calendar className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        {t('syncGoogleCalendar')}
      </button>
    </div>
  );
}

function ConfirmationModal({ title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", isDestructive = true }: { 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  confirmText?: string,
  cancelText?: string,
  isDestructive?: boolean
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-cool-gray/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {isDestructive ? <Trash2 className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          <h3 className="text-xl font-bold text-cool-gray mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="p-6 bg-gray-50 flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 bg-white border border-gray-200 text-cool-gray text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 text-white text-xs font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg ${isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-plaid-blue hover:bg-plaid-blue/90 shadow-plaid-blue/20'}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, trend, isPositive, subtitle, tooltip, percentage, t, onClick }: { 
  title: string, 
  value: string, 
  trend?: string, 
  isPositive?: boolean,
  subtitle?: string,
  tooltip?: string,
  percentage?: number,
  t: (key: string) => string,
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className={`glass-card p-6 relative group transition-all duration-300 border-b-2 border-transparent hover:border-plaid-blue overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-1.5">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</h4>
          {tooltip && (
            <div className="relative group/tooltip">
              <Info className="w-3 h-3 text-gray-300 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-cool-gray text-[10px] text-white rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-cool-gray mb-1 tracking-tight">{value}</div>
      {subtitle && <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{subtitle}</div>}
      
      {percentage !== undefined && (
        <div className="mt-4">
            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase mb-1">
              <span>{t('allocation')}</span>
              <span>{percentage}%</span>
            </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full bg-plaid-blue rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InsightCard({ icon, title, description, color, badge, footer }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  color: string, 
  badge: string,
  footer: React.ReactNode
}) {
  const colorClass = color === 'prism-teal' ? 'border-l-prism-teal text-prism-teal' : 'border-l-plaid-blue text-plaid-blue';
  const badgeClass = color === 'prism-teal' ? 'bg-prism-teal/10 text-prism-teal' : 'bg-plaid-blue/10 text-plaid-blue';

  return (
    <div className={`glass-card p-6 border-l-4 ${colorClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className={`px-2 py-1 ${badgeClass} text-[10px] font-bold rounded uppercase tracking-wider`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-cool-gray mb-6 leading-relaxed">
        {description}
      </p>
      {footer}
    </div>
  );
}

const TAIWAN_INSTITUTIONS = [
  { name: 'Cathay United 國泰世華', logo: 'cathaybk.com.tw' },
  { name: 'CTBC 中國信託', logo: 'ctbcbank.com' },
  { name: 'Fubon 富邦銀行', logo: 'fubon.com' },
  { name: 'E.SUN 玉山銀行', logo: 'esunbank.com.tw' },
  { name: 'Taishin 台新銀行', logo: 'taishinbank.com.tw' },
  { name: 'SinoPac 永豐銀行', logo: 'sinopac.com' },
  { name: 'Mega Bank 兆豐銀行', logo: 'megabank.com.tw' },
  { name: 'Yuanta 元大銀行', logo: 'yuantabank.com.tw' },
  { name: 'First Bank 第一銀行', logo: 'firstbank.com.tw' },
  { name: 'Hua Nan 華南銀行', logo: 'hncb.com.tw' },
  { name: 'Land Bank 土地銀行', logo: 'landbank.com.tw' },
  { name: 'Taiwan Cooperative 合作金庫', logo: 'tcb-bank.com.tw' },
  { name: 'Bank of Taiwan 臺灣銀行', logo: 'bot.com.tw' },
  { name: 'Chang Hwa 彰化銀行', logo: 'chb.com.tw' },
  { name: 'Taiwan Business Bank 臺灣企銀', logo: 'tbb.com.tw' },
  { name: 'Shanghai Commercial 上海商業儲蓄銀行', logo: 'scsb.com.tw' },
  { name: 'Far Eastern 遠東商銀', logo: 'feib.com.tw' },
  { name: 'TCB 合作金庫', logo: 'tcb-bank.com.tw' },
  { name: 'Post 中華郵政', logo: 'post.gov.tw' },
];

const US_INSTITUTIONS = [
  { name: 'Chase', logo: 'chase.com' },
  { name: 'BOA', logo: 'bofa.com' },
  { name: 'SoFi', logo: 'sofi.com' },
  { name: 'Robinhood', logo: 'robinhood.com' },
  { name: 'Fidelity', logo: 'fidelity.com' },
  { name: 'Schwab', logo: 'schwab.com' },
  { name: 'Vanguard', logo: 'vanguard.com' },
  { name: 'Interactive Brokers', logo: 'interactivebrokers.com' },
  { name: 'Citi', logo: 'citibank.com' },
  { name: 'Wells Fargo', logo: 'wellsfargo.com' },
];

function EditAccountModal({ account, onUpdate, onClose, t }: { account: Account, onUpdate: (id: string, updates: Partial<Account>) => void, onClose: () => void, t: (key: string) => string }) {
  const [name, setName] = useState(account.name);
  const [institution, setInstitution] = useState(account.institution);
  const [balance, setBalance] = useState(account.balance.toString());
  const [currency, setCurrency] = useState(account.currency);
  const [type, setType] = useState<Account['type']>(account.type);
  const [annualYield, setAnnualYield] = useState(account.annualYield?.toString() || '');
  const [riskProfile, setRiskProfile] = useState(account.riskProfile || 'Low');
  const [error, setError] = useState<string | null>(null);
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);
  const [institutionRegion, setInstitutionRegion] = useState<'TW' | 'US'>('TW');
  const [institutionSearch, setInstitutionSearch] = useState('');

  const isNew = !account.id;

  const handleSelectInstitution = (inst: string) => {
    setInstitution(inst);
    setShowInstitutionDropdown(false);
    setInstitutionSearch('');
  };

  const filteredInstitutions = (institutionRegion === 'TW' ? TAIWAN_INSTITUTIONS : US_INSTITUTIONS)
    .filter(inst => inst.name.toLowerCase().includes(institutionSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-cool-gray/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-cool-gray">{isNew ? t('addManual') : t('editAccount')}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('accountName')}</label>
            <input 
              type="text" 
              placeholder="e.g. Main Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none"
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('institution')}</label>
            <div 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setShowInstitutionDropdown(!showInstitutionDropdown)}
            >
              <div className="flex items-center gap-2">
                {institution ? (
                  <>
                    <InstitutionLogo src={(institutionRegion === 'TW' ? TAIWAN_INSTITUTIONS : US_INSTITUTIONS).find(i => i.name === institution)?.logo} name={institution} className="w-5 h-5" />
                    <span className="font-medium text-cool-gray">{institution}</span>
                  </>
                ) : (
                  <span className="text-gray-400">{t('selectInstitution')}</span>
                )}
              </div>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showInstitutionDropdown ? 'rotate-90' : ''}`} />
            </div>

            <AnimatePresence>
              {showInstitutionDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[210] left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-1">
                    <button 
                      onClick={() => setInstitutionRegion('TW')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${institutionRegion === 'TW' ? 'bg-white text-plaid-blue shadow-sm' : 'text-gray-400 hover:text-cool-gray'}`}
                    >
                      {t('taiwan')}
                    </button>
                    <button 
                      onClick={() => setInstitutionRegion('US')}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${institutionRegion === 'US' ? 'bg-white text-plaid-blue shadow-sm' : 'text-gray-400 hover:text-cool-gray'}`}
                    >
                      {t('unitedStates')}
                    </button>
                  </div>
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder={t('searchInstitutions')}
                        value={institutionSearch}
                        onChange={(e) => setInstitutionSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredInstitutions.length > 0 ? (
                      <div className="grid grid-cols-1">
                        {filteredInstitutions.map(inst => (
                          <button 
                            key={inst.name}
                            onClick={() => handleSelectInstitution(inst.name)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <InstitutionLogo src={inst.logo} name={inst.name} className="w-6 h-6" />
                            <span className="text-xs font-bold text-cool-gray">{inst.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('noMatchingInstitutions')}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('customName')}</p>
                    <input 
                      type="text" 
                      placeholder="Press Enter to add..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-plaid-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSelectInstitution((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('balance')}</label>
              <input 
                type="number" 
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('currency')}</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none appearance-none cursor-pointer"
              >
                <option value="TWD">TWD (NTD)</option>
                <option value="USD">USD ($)</option>
                <option value="HKD">HKD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('accountType')}</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as Account['type'])}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none"
            >
              <option value="Checking">{t('checking')}</option>
              <option value="Savings">{t('savings')}</option>
              <option value="Investment">{t('investment')}</option>
              <option value="401k">{t('fortyOneK')}</option>
              <option value="Roth IRA">{t('rothIra')}</option>
              <option value="Traditional IRA">{t('traditionalIra')}</option>
              <option value="Credit Card">{t('creditCard')}</option>
              <option value="Cash">{t('cash') || 'Cash'}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('annualYield')} (%)</label>
              <input 
                type="number" 
                step="0.01"
                value={annualYield}
                onChange={(e) => setAnnualYield(e.target.value)}
                placeholder="e.g. 4.25"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('riskProfile')}</label>
              <select 
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-plaid-blue/10 outline-none appearance-none cursor-pointer"
              >
                <option value="Low">{t('low')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="High">{t('high')}</option>
                <option value="Aggressive">{t('aggressive')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-cool-gray transition-colors"
          >
            {t('cancel')}
          </button>
          <button 
            onClick={() => {
              const parsedBalance = parseFloat(balance);
              if (!name.trim()) {
                setError(t('accountNameRequired'));
                return;
              }
              if (!institution.trim()) {
                setError(t('institutionRequired'));
                return;
              }
              if (isNaN(parsedBalance)) {
                setError(t('validBalanceRequired'));
                return;
              }
              onUpdate(account.id, { 
                name, 
                institution, 
                balance: parsedBalance, 
                currency, 
                type,
                annualYield: parseFloat(annualYield) || 0,
                riskProfile,
                logo: (institutionRegion === 'TW' ? TAIWAN_INSTITUTIONS : US_INSTITUTIONS).find(i => i.name === institution)?.logo || getInstitutionLogo(institution)
              });
            }}
            className="flex-1 py-3 bg-plaid-blue text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-plaid-blue/20 hover:bg-blue-700 transition-all"
          >
            {isNew ? t('addAsset') : t('saveChanges')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

