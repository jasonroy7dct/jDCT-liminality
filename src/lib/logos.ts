export const getInstitutionLogo = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  
  // Mapping of common institutions to domains for Google Favicon API
  const domainMap: { [key: string]: string } = {
    'chase': 'chase.com',
    'hsbc': 'hsbc.com',
    'cathay': 'cathaybk.com.tw',
    '國泰': 'cathaybk.com.tw',
    'ctbc': 'ctbcbank.com',
    '中信': 'ctbcbank.com',
    '中國信託': 'ctbcbank.com',
    'fubon': 'fubon.com',
    '富邦': 'fubon.com',
    'e.sun': 'esunbank.com.tw',
    '玉山': 'esunbank.com.tw',
    'taishin': 'taishinbank.com.tw',
    '台新': 'taishinbank.com.tw',
    'sinopac': 'sinopac.com',
    '永豐': 'sinopac.com',
    'megabank': 'megabank.com.tw',
    '兆豐': 'megabank.com.tw',
    'yuanta': 'yuantabank.com.tw',
    '元大': 'yuantabank.com.tw',
    'first bank': 'firstbank.com.tw',
    '第一銀行': 'firstbank.com.tw',
    'hua nan': 'hncb.com.tw',
    '華南': 'hncb.com.tw',
    'land bank': 'landbank.com.tw',
    '土地銀行': 'landbank.com.tw',
    'taiwan cooperative': 'tcb-bank.com.tw',
    '合作金庫': 'tcb-bank.com.tw',
    'bank of taiwan': 'bot.com.tw',
    '臺灣銀行': 'bot.com.tw',
    '台灣銀行': 'bot.com.tw',
    'chang hwa': 'chb.com.tw',
    '彰化銀行': 'chb.com.tw',
    'taiwan business bank': 'tbb.com.tw',
    '臺灣企銀': 'tbb.com.tw',
    'shanghai commercial': 'scsb.com.tw',
    '上海商業': 'scsb.com.tw',
    'far eastern': 'feib.com.tw',
    '遠東商銀': 'feib.com.tw',
    'post': 'post.gov.tw',
    '中華郵政': 'post.gov.tw',
    'bank of america': 'bofa.com',
    'boa': 'bofa.com',
    'wells fargo': 'wellsfargo.com',
    'citi': 'citibank.com',
    'goldman sachs': 'gs.com',
    'morgan stanley': 'morganstanley.com',
    'fidelity': 'fidelity.com',
    'schwab': 'schwab.com',
    'vanguard': 'vanguard.com',
    'robinhood': 'robinhood.com',
    'binance': 'binance.com',
    'coinbase': 'coinbase.com',
    'wise': 'wise.com',
    'revolut': 'revolut.com',
    'standard chartered': 'sc.com',
    'dbs': 'dbs.com',
    'uob': 'uobgroup.com',
    'ocbc': 'ocbc.com',
    'sofi': 'sofi.com',
    'ibkr': 'interactivebrokers.com',
    'interactive brokers': 'interactivebrokers.com',
    'td ameritrade': 'tdameritrade.com',
    'e*trade': 'etrade.com',
    'etrade': 'etrade.com',
    'ally': 'ally.com',
    'capital one': 'capitalone.com',
    'american express': 'americanexpress.com',
    'amex': 'americanexpress.com',
    'barclays': 'barclays.com',
    'pnc': 'pnc.com',
    'us bank': 'usbank.com',
    'u.s. bank': 'usbank.com',
    'merrill lynch': 'ml.com',
    'merrill edge': 'merrilledge.com',
    'taiwan stock': 'twse.com.tw',
  };

  let domain = '';
  for (const [key, value] of Object.entries(domainMap)) {
    if (normalized.includes(key)) {
      domain = value;
      break;
    }
  }

  if (!domain) {
    // Fallback: Clean up name to guess domain
    domain = normalized
      .replace(/\s+(bank|institution|financial|group|corp|corporation|ltd|limited|inc|incorporated)$/g, '')
      .replace(/\s+/g, '') + '.com';
  }

  // Use Google Favicon API which is much more reliable and handles redirects better
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};
