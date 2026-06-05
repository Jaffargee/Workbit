-- User Type
create type user_type_enum as enum('EMPLOYER', 'WORKER', 'BOTH')

-- Nigerian States
create type nigerian_state_enum as enum (
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
);

-- Gender
create type gender_enum as enum ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY')

-- Reward Status
create type referral_reward_status_enum as enum ('PENDING', 'CREDITED')

-- Wallet Transaction Status
create type wallet_tx_type_enum as enum ('DEBIT', 'CREDIT')

-- Wallet Transaction Source
create type wallet_tx_source_enum as enum ('JOB_PAYMENT', 'WITHDRAWAL', 'WITHDRAWAL_REVERSAL', 'REFERRAL_BONUS', 'MANUAL_ADJUSTMENT', 'DEPOSIT', 'JOB_FUNDING')

-- Wallet Deposit Status
create type deposit_status_enum as enum ('PENDING', 'CONFIRMED', 'FAILED')

-- Payment Type
create type payment_type as enum ('bank_transfer', 'card', 'ussd', 'account')

-- Withdrawal Status
create type withdrawal_status_enum as enum ('PENDING', 'PROCESSING', 'PAID', 'FAILED')

-- Job Type
create type job_type_enum as enum ('LIKE', 'FOLLOW', 'COMMENT', 'RETWEET', 'SAVE', 'SHARE')

-- Job Status
create type job_status_enum as enum ('DRAFT', 'PENDING_FUNDING', 'FUNDED', 'PAUSED', 'COMPLETED', 'EXPIRED', 'CANCELLED')

-- Funding Status
create type funding_status_enum as enum ('FUNDED', 'DEPLETED', 'REFUNDED')

-- Funding Transaction Type
create type funding_tx_type as enum ('FUND', 'RESERVE', 'RELEASE', 'UNRESERVE', 'REFUND')

-- Job Application Status
create type application_status_enum as enum ('APPLIED', 'WORKING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')

-- Proof Type
create type proof_type_enum as enum ('SCREENSHOT', 'LINK', 'USERNAME', 'COMMENT_TEXT')

-- Flag Type
create type flag_type_enum as enum ('SUBMISSION_TOO_FAST', 'DUPLICATE_SOCIAL_URL', 'REUSED_SCREENSHOT', 'SOCIAL_URL_MISMATCH', 'EXPIRED_PROOF', 'MISSING_BEFORE_PROOF', 'UNFOLLOW_DETECTED', 'UNLIKE_DETECTED', 'COMMENT_DELETED', 'MULTIPLE_ACCOUNTS_SAME_URL')

-- Flag Severity
create type flag_severity_enum as enum ('LOW', 'MEDIUM', 'HIGH')

-- Dispute Status
create type dispute_status_enum as enum ('OPEN', 'RESOLVED', 'ESCALATED')

-- Recheck Status
create type recheck_status_enum as enum ('ACTIVE', 'INACTIVE')

-- Payment Status
create type payment_status_enum as enum ('PENDING', 'PROCESSING', 'PAID', 'FAILED')

-- Notification Type
create type notification_type_enum as enum ('JOB_APPROVED', 'JOB_REJECTED', 'JOB_PAID', 'PROOF_SUBMITTED', 'DISPUTE_UPDATED', 'WITHDRAWAL_PROCESSED', 'WITHDRAWAL_FAILED', 'REFERRAL_REWARD', 'SYSTEM')






















