
export type Platform = 'Instagram' | 'TikTok' | 'X' | 'Facebook' | 'YouTube';
export type UserType = 'employer' | 'worker' | 'admin' | 'both';

export interface User {
  id: string; // Used for frontend state
  uuid: string;
  user_type: UserType;
  email: string;
  username: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  rating: number;
  completed_jobs: number;
  is_verified: boolean;
  isSubscribed: boolean; // Keep for existing subscription logic
  referralCode: string;
  referralCount: number;
  wallet: { // Keep for compatibility with existing components
    balance: number;
    earnings: number;
    referralEarnings: number;
  };
  created_at: string;
}

export interface Job {
  id: string;
  creatorId: string;
  title: string;
  platform: Platform;
  description: string;
  payoutPerTask: number;
  workersNeeded: number;
  workersCompleted: number;
  instructions: string;
  proofRequired: string;
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
}

export interface Submission {
  id: string;
  jobId: string;
  workerId: string;
  workerUsername: string;
  proofData: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earning' | 'withdrawal' | 'referral' | 'subscription' | 'job_post';
  description: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}
