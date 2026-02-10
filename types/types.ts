
export type Platform = 'Instagram' | 'TikTok' | 'Twitter (X)' | 'Facebook' | 'YouTube';

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

export interface Job {
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



