
export type Platform = 'Instagram' | 'TikTok' | 'X (Twitter)' | 'Facebook' | 'YouTube';

export type Email = string & { readonly __brand: unique symbol }

export type Gender = 'Male' | 'Female';

export type Status = 'ACTIVE' | 'PENDING' | 'PAUSED' | 'COMPLETED' | 'DRAFT' | 'CANCELLED';

export type Task = 'FOLLOW' | 'LIKE' | 'RETWEET' | 'COMMENT' | 'WATCH' | 'SHARE' | 'SUBSCRIBE' | 'OTHER';

export type NigerianState = 
| 'Abia' | 'Adamawa' | 'Akwa Ibom' | 'Anambra' | 'Bauchi' 
| 'Bayelsa' | 'Benue' | 'Borno' | 'Cross River' | 'Delta' 
| 'Ebonyi' | 'Edo' | 'Ekiti' | 'Enugu' | 'FCT' | 'Gombe' 
| 'Imo' | 'Jigawa' | 'Kaduna' | 'Kano' | 'Katsina' 
| 'Kebbi' | 'Kogi' | 'Kwara' | 'Lagos' | 'Nasarawa'
| 'Niger' | 'Ogun' | 'Ondo' | 'Osun' | 'Oyo' 
| 'Plateau' | 'Rivers' | 'Sokoto' | 'Taraba' | 'Yobe' 
| 'Zamfara';

export interface AppError extends Error {
      code?: string;
      status?: number;
}

export interface Platform_ {
      id: string;
      name: Platform;
      owner: string;
      domain: string;
      base_url: string;
      logo_url: string;
      is_active: boolean;
      created_at: string;
      updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS — aligned exactly to schema enums
// ─────────────────────────────────────────────────────────────────────────────

export type JobType = 'LIKE' | 'FOLLOW' | 'COMMENT' | 'RETWEET' | 'SAVE' | 'SHARE';

export type JobStatus =
| 'DRAFT'
| 'ACTIVE'
| 'PAUSED'
| 'COMPLETED'
| 'EXPIRED'
| 'CANCELLED';

export type ApplicationStatus =
| 'APPLIED'
| 'WORKING'
| 'SUBMITTED'
| 'APPROVED'
| 'REJECTED'
| 'PAID';

export type ProofType = 'SCREENSHOT' | 'LINK' | 'USERNAME' | 'COMMENT_TEXT';

export type UserType = 'WORKER' | 'EMPLOYER' | 'BOTH';


// ─────────────────────────────────────────────────────────────────────────────
// DATABASE ROW TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfile {
      id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      state: NigerianState;
      gender: Gender;
      date_of_birth: string | null;
      metadata: Record<string, unknown> | null;
      user_contacts: { email: string; phone?: string; }[]
      referral_rewards: { referrer_id: string, reward_amount: number, status: string, referred_user_id: string }[] | null;
      user_bank_accounts: UserBankAccount[];
      wallet: Wallet;
      wallet_balance_summary: any
      jobs: Job[] | null;
      created_at: string;
      updated_at: string;
      is_subscribed: boolean;
}

export interface UserBankAccount {
      id: string;
      user_id: string;
      bank_name: string;
      account_number: string;
      account_name: string;
      is_verified: boolean;
      is_default: boolean;
      created_at: string;
}

export interface Job {
      id: string;
      user_id: string;
      platform_id: string;
      job_type: JobType;
      status: JobStatus;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string | null;
      title: string;
      description: string;
      views_count: number;
      total_slots: number;
      filled_slots: number;
      applications_count: number;
      posted_at: string | null;
      completed_at: string | null;
      expires_at: string | null;
      created_at: string;
      // joined
      platforms: Platform_;
}

export interface JobApplication {
      id: string;
      job_id: string;
      worker_id: string;
      status: ApplicationStatus;
      applied_at: string;
      updated_at: string;
}

export interface JobProof {
      id: string;
      application_id: string;
      worker_social_url: string;
      instructions_seen: boolean;
      is_late: boolean;
      submission_gap_secs: number | null;
      submitted_at: string;
}

export interface JobProofItem {
      id: string;
      proof_id: string;
      proof_type: ProofType;
      value: string;
      is_before: boolean;
      display_order: number;
      captured_at: string | null;
      created_at: string;
}

export interface Wallet {
      id: string;
      user_id: string;
      balance: number;
      currency: string;
      is_frozen: boolean;
      created_at: string;
      wallet_deposits?: WalletDeposit[];
      wallet_transactions?: WalletTransaction[];
}

export interface WalletDeposit {
      id: string;
      user_id: string;
      wallet_id: string;
      wallet_tx_id: string;
      status: 'CONFIRMED' | 'PENDING' | 'FAILED';
      currency: 'NGN'
      amount: number;
      flw_status: string;
      flw_ref: string;
      tx_ref: string;
      payment_type: 'bank_transfer' | 'ussd' | 'account' | 'card'
      transaction_id: number;
      flw_created_at: string;
      created_at: string;

}

export interface WalletTransaction {
      id: string;
      wallet_id: string;
      type: 'CREDIT' | 'DEBIT';
      amount: number;
      balance_before: number;
      balance_after: number;
      source: string;
      reference: string | null;
      note: string | null;
      created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM / PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Payload for the insert_user_profile RPC — creates profile + bank account atomically */
export interface ProfileSetupPayload {
      // user_profiles fields
      p_first_name: string;
      p_last_name: string;
      p_phone: string;
      p_email: string;
      p_dob: string;
      p_gender: Gender;
      p_state: NigerianState | '';
      p_user_type: UserType;
      // user_bank_accounts fields
      p_bank_name: string;
      p_account_number: string;
      p_account_name: string;
}

/** Fields needed to post a job */
export interface JobPostPayload {
      user_id: string;
      platform_id: string;
      job_type: JobType;
      status: JobStatus;
      target_url: string;
      payout_amount: number;
      payout_currency: string;
      auto_approve: boolean;
      requires_screenshot: boolean;
      requires_before_proof: boolean;
      proof_instructions: string;
      title: string;
      description: string;
      total_slots: number;
      expires_at: string | null;
      posted_at: string;
}

/** Proof submission from the worker */
export interface ProofSubmissionPayload {
      application_id: string;
      worker_social_url: string;
      instructions_seen: boolean;
      items: ProofItemPayload[];
}

export interface ProofItemPayload {
      proof_type: ProofType;
      value: string;
      is_before: boolean;
      display_order: number;
}

export interface AuthCredentials {
      email: Email;
      password: string;
}

export interface ValidationError {
      field: string;
      message: string;
}