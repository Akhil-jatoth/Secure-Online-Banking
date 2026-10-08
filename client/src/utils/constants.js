export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
};

export const BILL_CATEGORIES = [
  { id: 'Electricity', name: 'Electricity', icon: 'Zap' },
  { id: 'Water', name: 'Water & Sewage', icon: 'Droplets' },
  { id: 'Internet', name: 'Internet & Broadband', icon: 'Wifi' },
  { id: 'Mobile', name: 'Mobile Postpaid', icon: 'Smartphone' },
  { id: 'Credit Card', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'Insurance', name: 'Health & Life Insurance', icon: 'Shield' },
];

export const POPULAR_BILLERS = {
  Electricity: ['Metropolis Power & Light', 'Pacific Electric Co', 'National Grid Power'],
  Water: ['Metropolis Water Board', 'Aqua Pure Utilities', 'County Clean Water'],
  Internet: ['Gigabit Fiber Net', 'Skyline Broadband', 'Infinity Telecom'],
  Mobile: ['Verizon Wireless (Simulated)', 'AT&T Mobility (Simulated)', 'T-Mobile US (Simulated)'],
  'Credit Card': ['Aegis Platinum Rewards', 'Aegis Sapphire Reserve', 'Apex Gold Card'],
  Insurance: ['Aegis Life & Health', 'Prudential Financial (Sim)', 'MetLife Coverage (Sim)'],
};
