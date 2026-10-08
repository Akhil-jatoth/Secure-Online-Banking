export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
};

export const BANK_NAME = 'Suraksha Bank';
export const BANK_TAGLINE = "India's Trusted Digital Banking Portal";
export const DEFAULT_IFSC = 'SURB0001008';

export const INDIAN_BANKS = [
  'Suraksha Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'HDFC Bank',
  'Indian Bank',
  'Punjab National Bank (PNB)',
  'Axis Bank',
  'Bank of Baroda (BOB)',
  'Kotak Mahindra Bank',
  'Canara Bank',
  'Union Bank of India',
];

export const BILL_CATEGORIES = [
  { id: 'Electricity', name: 'Electricity', icon: 'Zap' },
  { id: 'Water', name: 'Water & Municipal', icon: 'Droplets' },
  { id: 'Internet', name: 'Broadband & Fiber', icon: 'Wifi' },
  { id: 'Mobile', name: 'Mobile Recharge/Postpaid', icon: 'Smartphone' },
  { id: 'Credit Card', name: 'Credit Card Bill', icon: 'CreditCard' },
  { id: 'Insurance', name: 'Insurance Premium', icon: 'Shield' },
  { id: 'Fastag', name: 'FASTag / Toll Recharge', icon: 'Car' },
];

export const POPULAR_BILLERS = {
  Electricity: [
    'BESCOM - Bengaluru Electricity',
    'Tata Power - Mumbai & Delhi',
    'MSEDCL - Mahavitaran Maharashtra',
    'BSES Rajdhani Power Limited (Delhi)',
    'Adani Electricity Mumbai',
    'TSSPDCL - Telangana Southern Power',
  ],
  Water: [
    'Bangalore Water Supply (BWSSB)',
    'Delhi Jal Board (DJB)',
    'Hyderabad Metro Water (HMWSSB)',
    'Municipal Corporation of Greater Mumbai (MCGM)',
    'Chennai Metro Water (CMWSSB)',
  ],
  Internet: [
    'JioFiber Broadband',
    'Airtel Xstream Fiber',
    'ACT Fibernet',
    'BSNL Bharat Fiber',
    'Tata Play Fiber',
  ],
  Mobile: [
    'Reliance Jio Prepaid/Postpaid',
    'Bharti Airtel Mobile',
    'Vodafone Idea (Vi)',
    'BSNL Mobile Prepaid',
  ],
  'Credit Card': [
    'SBI Card Payment',
    'ICICI Bank Credit Card',
    'HDFC Bank Card Payment',
    'Axis Bank Credit Card',
    'Suraksha Platinum RuPay Card',
  ],
  Insurance: [
    'Life Insurance Corporation of India (LIC)',
    'SBI Life Insurance',
    'HDFC Life Insurance',
    'ICICI Prudential Life Insurance',
    'Max Life Insurance',
  ],
  Fastag: [
    'NHAI FASTag Recharge',
    'SBI FASTag',
    'ICICI Bank FASTag',
    'Paytm Payments Bank FASTag (Sim)',
  ],
};
