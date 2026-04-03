
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Job, Submission, Transaction } from './types';
import { MOCK_JOBS } from './constants';

interface AppState {
  user: User | null;
  jobs: Job[];
  submissions: Submission[];
  transactions: Transaction[];
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
  register: (data: any) => void;
  postJob: (jobData: Partial<Job>) => void;
  submitProof: (submission: Partial<Submission>) => void;
  approveSubmission: (submissionId: string) => void;
  rejectSubmission: (submissionId: string) => void;
  subscribe: () => void;
  withdraw: (amount: number) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('workbit_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (email: string) => {
    const mockUser: User = {
      id: '1',
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      user_type: 'both',
      email: email,
      username: 'WorkerBee',
      balance: 1200.50,
      total_earned: 5400.00,
      total_spent: 4200.00,
      rating: 4.85,
      completed_jobs: 142,
      is_verified: true,
      isSubscribed: true,
      referralCode: 'WB-BEE123',
      referralCount: 4,
      wallet: { balance: 1200.50, earnings: 5400, referralEarnings: 700 },
      created_at: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('workbit_user', JSON.stringify(mockUser));
  };

  const register = (data: any) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      uuid: Math.random().toString(36).substr(2, 9),
      user_type: 'worker',
      username: data.username,
      email: data.email,
      balance: 0,
      total_earned: 0,
      total_spent: 0,
      rating: 0,
      completed_jobs: 0,
      is_verified: false,
      isSubscribed: false,
      referralCode: 'WB-' + data.username.toUpperCase(),
      referralCount: 0,
      wallet: { balance: 0, earnings: 0, referralEarnings: 0 },
      created_at: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('workbit_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('workbit_user');
  };

  const postJob = (jobData: Partial<Job>) => {
    if (!user) return;
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      creatorId: user.id,
      title: jobData.title || '',
      platform: jobData.platform || 'Instagram',
      description: jobData.description || '',
      payoutPerTask: jobData.payoutPerTask || 0,
      workersNeeded: jobData.workersNeeded || 0,
      workersCompleted: 0,
      instructions: jobData.instructions || '',
      proofRequired: jobData.proofRequired || '',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setJobs(prev => [newJob, ...prev]);
    
    const totalCost = newJob.payoutPerTask * newJob.workersNeeded;
    const commission = totalCost * 0.1;
    const finalDebit = totalCost + commission;

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: prev.balance - finalDebit,
        total_spent: prev.total_spent + finalDebit,
        wallet: { ...prev.wallet, balance: prev.wallet.balance - finalDebit }
      };
    });
  };

  const submitProof = (sub: Partial<Submission>) => {
    if (!user) return;
    const newSub: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: sub.jobId!,
      workerId: user.id,
      workerUsername: user.username,
      proofData: sub.proofData || '',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setSubmissions(prev => [...prev, newSub]);
  };

  const approveSubmission = (subId: string) => {
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'approved' } : s));
  };

  const rejectSubmission = (subId: string) => {
    setSubmissions(prev => prev.map(s => s.id === subId ? { ...s, status: 'rejected' } : s));
  };

  const subscribe = () => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, isSubscribed: true };
    });
  };

  const withdraw = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        balance: prev.balance - amount,
        wallet: { ...prev.wallet, balance: prev.wallet.balance - amount }
      };
    });
  };

  return (
    <AppContext.Provider value={{
      user, jobs, submissions, transactions, loading,
      login, logout, register, postJob, submitProof, 
      approveSubmission, rejectSubmission, subscribe, withdraw
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
