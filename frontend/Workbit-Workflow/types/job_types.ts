// types/trust_types.ts

export interface WorkerTrustScore {
      worker_id: string;
      overall_score: number;              // 0-100 composite score
      trust_level: TrustLevel;            // Badge/tier system
      total_jobs_completed: number;
      success_rate: number;               // % of approved submissions
      verification_speed: number;         // Avg hours to get verified
      consistency_score: number;          // How consistent their quality is
      reliability_score: number;          // Do they unfollow? Cheat?
      platform_tenure_days: number;
      last_updated: Date;

      // Detailed breakdown
      metrics: TrustMetrics;
      badges: TrustBadge[];
      violations: Violation[];
      reputation_history: ReputationEvent[];
}

export type TrustLevel = 
      | 'NEW'           // 0-20: New worker, unproven
      | 'BRONZE'        // 21-40: Basic trust
      | 'SILVER'        // 41-60: Reliable worker
      | 'GOLD'          // 61-80: Highly trusted
      | 'PLATINUM'      // 81-95: Elite worker
      | 'DIAMOND';      // 96-100: Top 1% workers

export interface TrustMetrics {
      // Completion metrics
      jobs_applied: number;
      jobs_completed: number;
      jobs_rejected: number;
      jobs_pending: number;
      
      // Quality metrics
      first_time_approval_rate: number;   // % approved without revision
      average_rating: number;             // From employers (1-5 stars)
      resubmission_rate: number;          // How often they need to resubmit
      
      // Speed metrics
      avg_completion_time_hours: number;
      on_time_completion_rate: number;
      
      // Reliability metrics
      unfollow_incidents: number;         // Caught unfollowing
      fraud_flags: number;                // Times flagged for suspicious activity
      account_warnings: number;
      days_since_last_violation: number;
      
      // Engagement metrics
      response_time_hours: number;        // How fast they respond to messages
      dispute_rate: number;               // % of jobs disputed
      profile_completeness: number;       // % of profile filled out
}

export interface TrustBadge {
      id: string;
      type: BadgeType;
      name: string;
      description: string;
      earned_at: Date;
      icon: string;
}

export type BadgeType =
      | 'FAST_COMPLETER'      // Completes jobs under 1 hour
      | 'PERFECT_RECORD'      // 100% approval rate (min 20 jobs)
      | 'SPEED_DEMON'         // Top 10% completion speed
      | 'VETERAN'             // 6+ months on platform
      | 'VOLUME_KING'         // 100+ completed jobs
      | 'FIVE_STAR'           // 4.8+ average rating
      | 'SPECIALIST'          // Expert in specific platform
      | 'EARLY_ADOPTER'       // Joined in first month
      | 'CONSISTENT'          // 30+ jobs, <5% rejection rate
      | 'VERIFIED_PROFILE';   // ID/phone verified

export interface Violation {
      id: string;
      type: ViolationType;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      description: string;
      penalty_points: number;
      occurred_at: Date;
      resolved: boolean;
}

export type ViolationType =
      | 'UNFOLLOWED_AFTER_PAYMENT'
      | 'FAKE_SCREENSHOT'
      | 'WRONG_ACCOUNT'
      | 'DUPLICATE_SUBMISSION'
      | 'LATE_SUBMISSION'
      | 'POOR_QUALITY'
      | 'UNRESPONSIVE'
      | 'SPAM';

export interface ReputationEvent {
      id: string;
      type: 'INCREASE' | 'DECREASE';
      points: number;
      reason: string;
      old_score: number;
      new_score: number;
      created_at: Date;
}