
export type Platform = 'Instagram' | 'TikTok' | 'Twitter (X)' | 'Facebook' | 'YouTube';

export type Email = string & { readonly __brand: unique symbol }

export type Gender = 'Male' | 'Female';

export type Status = 'ACTIVE' | 'PENDING' | 'PAUSED' | 'COMPLETED' | 'DRAFT' | 'CANCELLED';

export type NigerianState = 
  | 'Abia' | 'Adamawa' | 'Akwa Ibom' | 'Anambra' | 'Bauchi' 
  | 'Bayelsa' | 'Benue' | 'Borno' | 'Cross River' | 'Delta' 
  | 'Ebonyi' | 'Edo' | 'Ekiti' | 'Enugu' | 'FCT' | 'Gombe' 
  | 'Imo' | 'Jigawa' | 'Kaduna' | 'Kano' | 'Katsina' 
  | 'Kebbi' | 'Kogi' | 'Kwara' | 'Lagos' | 'Nasarawa' 
  | 'Niger' | 'Ogun' | 'Ondo' | 'Osun' | 'Oyo' 
  | 'Plateau' | 'Rivers' | 'Sokoto' | 'Taraba' | 'Yobe' 
  | 'Zamfara';

interface AuthSignup {
      email?: string,
      p_phone: string,
      p_gender: Gender,
      p_state: NigerianState,
      ref_code?: string,
      p_user_type: 'EMPLOYER' | 'WORKER' | 'BOTH',
}

export interface UserProfile {
      first_name: string,
      last_name: string,
      username: string,
      email?: Email,
      phone: string,
      gender: Gender,
      state: NigerianState,
      user_id: string,
      is_profiled: boolean,
      is_verified: boolean,
      user_type: 'EMPLOYER' | 'WORKER' | 'BOTH',
      created_at: string,
      updated_at: string,
      ref_code?: string,
      referred_by?: string,
      completed_jobs?: number,
      total_earned?: number,
      total_spent?: number,
      balance?: number,
}

export interface EmailAuthSignup extends AuthSignup {
      p_first_name: string,
      p_last_name: string,
      p_username: string,
}

export interface EmailAuthProps {
      email: string,
      password: string
}

export interface AuthLogin {
      username: string,
      password: string
}

export interface GoogleOAuthSignup extends AuthSignup {}

export interface Platform_ {
      id: string;
      name: Platform;
      owner: string;
      domain: string;
      base_url: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
}

type Task = 'FOLLOW' | 'LIKE' | 'RETWEET' | 'COMMENT' | 'WATCH' | 'SHARE' | 'SUBSCRIBE' | 'OTHER';

interface Job {
      title: string,
      user_id: string,
      platform_id: Platform_['id'],
      target_url: string,
      task_type: Task,
      total_slots: number,
      payout_amount: number,
      description?: string,
      requires_screenshot: boolean,
      auto_approve: boolean,
      is_public: boolean,
      status: Status,
      proof_instructions: string,
}

export interface JobData extends Job {
      id: string,
      user_id: string,
      payout_currency: 'NGN',
      filled_slots: number,
      available_slots: number,
      posted_at: Date,
      expires_at: Date,
      completed_at: Date,
      view_count: number,
      applications_count: number
      platforms: Platform_
}

export type UIPlatform = { name: Platform; icon: React.ReactNode; color: string; }

export interface JobSubmission extends Job {}

export type VerificationFlag = 
  | 'SUSPICIOUS_TIMING'
  | 'DUPLICATE_SCREENSHOT'
  | 'ACCOUNT_TOO_NEW'
  | 'MULTIPLE_SUBMISSIONS'
  | 'API_VERIFICATION_FAILED'
  | 'UNFOLLOWED_AFTER_SUBMISSION';








export interface User {
      id: string;
      username: string;
      email: string;
      isSubscribed: boolean;
      wallet: {
            balance: number;
            earnings: number;
            referralEarnings: number;
      };
      referralCode: string;
      referredBy?: string;
      referralCount: number;
}

export interface Jobs {
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