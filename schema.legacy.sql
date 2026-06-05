-- ============================================================
-- PLATFORM SCHEMA — Supabase PostgreSQL
-- ============================================================
-- Run this in Supabase SQL Editor in order.
-- Each section is idempotent: safe to re-run.
-- ============================================================


-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

CREATE TYPE job_type_enum AS ENUM (
    'LIKE', 'FOLLOW', 'COMMENT', 'RETWEET', 'SAVE', 'SHARE'
);

CREATE TYPE job_status_enum AS ENUM (
    'DRAFT', 'PENDING_FUNDING', 'ACTIVE', 'PAUSED',
    'COMPLETED', 'EXPIRED', 'CANCELLED'
);

CREATE TYPE application_status_enum AS ENUM (
    'APPLIED', 'WORKING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'
);

CREATE TYPE proof_type_enum AS ENUM (
    'SCREENSHOT', 'LINK', 'USERNAME', 'COMMENT_TEXT'
);

CREATE TYPE flag_type_enum AS ENUM (
    'SUBMISSION_TOO_FAST',
    'DUPLICATE_SOCIAL_URL',
    'REUSED_SCREENSHOT',
    'SOCIAL_URL_MISMATCH',
    'EXPIRED_PROOF',
    'MISSING_BEFORE_PROOF',
    'UNFOLLOW_DETECTED',
    'UNLIKE_DETECTED',
    'COMMENT_DELETED',
    'MULTIPLE_ACCOUNTS_SAME_URL'
);

CREATE TYPE flag_severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TYPE recheck_status_enum AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE payment_status_enum AS ENUM (
    'PENDING', 'PROCESSING', 'PAID', 'FAILED'
);

CREATE TYPE wallet_tx_type_enum AS ENUM ('CREDIT', 'DEBIT');

CREATE TYPE wallet_tx_source_enum AS ENUM (
    'JOB_PAYMENT', 'WITHDRAWAL', 'WITHDRAWAL_REVERSAL',
    'REFERRAL_BONUS', 'MANUAL_ADJUSTMENT', 'DEPOSIT'
);

CREATE TYPE dispute_status_enum AS ENUM (
    'OPEN', 'RESOLVED', 'ESCALATED'
);

CREATE TYPE funding_status_enum AS ENUM (
    'FUNDED', 'DEPLETED', 'REFUNDED'
);

CREATE TYPE referral_reward_status_enum AS ENUM (
    'PENDING', 'CREDITED'
);

CREATE TYPE nigerian_state_enum AS ENUM (
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
);

CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

CREATE TYPE withdrawal_status_enum AS ENUM (
    'PENDING', 'PROCESSING', 'PAID', 'FAILED'
);

CREATE TYPE notification_type_enum AS ENUM (
    'JOB_APPROVED', 'JOB_REJECTED', 'JOB_PAID',
    'PROOF_SUBMITTED', 'DISPUTE_UPDATED',
    'WITHDRAWAL_PROCESSED', 'WITHDRAWAL_FAILED',
    'REFERRAL_REWARD', 'SYSTEM'
);


-- ============================================================
-- SECTION 1: IDENTITY
-- ============================================================

-- Note: Identity.User extends Supabase's auth.users.
-- We store a mirror in public schema for FK references.

CREATE TABLE IF NOT EXISTS identity_users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE identity_users IS
    'Mirror of auth.users. Extended by user_profiles, user_contacts etc.';


-- ============================================================
-- SECTION 2: USER SCHEMAS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES identity_users(id) ON DELETE CASCADE,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    state           nigerian_state_enum,
    gender          gender_enum,
    date_of_birth   DATE,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_contacts (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL REFERENCES identity_users(id) ON DELETE CASCADE,
      phone       TEXT NULL,
      email       TEXT NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_bank_accounts (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id         UUID NOT NULL REFERENCES identity_users(id) ON DELETE CASCADE,
      bank_name       TEXT NOT NULL,
      account_number  TEXT NOT NULL,
      account_name    TEXT NOT NULL,
      is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
      is_default      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      -- Only one default bank account per user
      CONSTRAINT uq_user_default_bank EXCLUDE USING btree (
            user_id WITH =, is_default WITH =
      ) WHERE (is_default = TRUE)
);

CREATE TABLE IF NOT EXISTS user_referrals (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id         UUID NOT NULL UNIQUE REFERENCES identity_users(id) ON DELETE CASCADE,
      ref_code        TEXT NOT NULL UNIQUE,
      referred_by     UUID REFERENCES identity_users(id) ON DELETE SET NULL,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_rewards (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      referrer_id         UUID NOT NULL REFERENCES identity_users(id),
      referred_user_id    UUID NOT NULL UNIQUE REFERENCES identity_users(id),
      reward_amount       NUMERIC(12, 2) NOT NULL CHECK (reward_amount > 0),
      status              referral_reward_status_enum NOT NULL DEFAULT 'PENDING',
      credited_at         TIMESTAMPTZ,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 3: PLATFORMS
-- ============================================================

CREATE TABLE IF NOT EXISTS platforms (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        TEXT NOT NULL,
      owner       TEXT NOT NULL,
      domain      TEXT NOT NULL UNIQUE,
      base_url    TEXT NOT NULL,
      logo_url    TEXT,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 4: JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
      id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id                 UUID NOT NULL REFERENCES identity_users(id),
      platform_id             UUID NOT NULL REFERENCES platforms(id),

      job_type                job_type_enum NOT NULL,
      status                  job_status_enum NOT NULL DEFAULT 'DRAFT',

      target_url              TEXT NOT NULL,
      payout_amount           NUMERIC(12, 2) NOT NULL CHECK (payout_amount > 0),
      payout_currency         TEXT NOT NULL DEFAULT 'NGN',
      auto_approve            BOOLEAN NOT NULL DEFAULT FALSE,
      requires_screenshot     BOOLEAN NOT NULL DEFAULT TRUE,
      requires_before_proof   BOOLEAN NOT NULL DEFAULT FALSE,
      proof_instructions      TEXT,

      title                   TEXT NOT NULL,
      description             TEXT NOT NULL,

      views_count             INTEGER NOT NULL DEFAULT 0,
      total_slots             INTEGER NOT NULL CHECK (total_slots > 0),
      filled_slots            INTEGER NOT NULL DEFAULT 0,
      applications_count      INTEGER NOT NULL DEFAULT 0,

      posted_at               TIMESTAMPTZ,
      completed_at            TIMESTAMPTZ,
      expires_at              TIMESTAMPTZ,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT chk_filled_slots CHECK (filled_slots <= total_slots)
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_expires ON jobs(expires_at) WHERE status = 'ACTIVE';


-- Job cannot go ACTIVE without funding — enforced at app layer + trigger
CREATE TABLE IF NOT EXISTS job_funding (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id              UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
      funded_amount       NUMERIC(12, 2) NOT NULL CHECK (funded_amount > 0),
      reserved_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
      released_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
      status              funding_status_enum NOT NULL DEFAULT 'FUNDED',
      funded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT chk_funding_reserved CHECK (reserved_amount <= funded_amount),
      CONSTRAINT chk_funding_released CHECK (released_amount <= funded_amount)
);


-- ============================================================
-- SECTION 5: JOB APPLICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS job_applications (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      job_id      UUID NOT NULL REFERENCES jobs(id),
      worker_id   UUID NOT NULL REFERENCES identity_users(id),
      status      application_status_enum NOT NULL DEFAULT 'APPLIED',
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      -- A worker can only apply once per job
      CONSTRAINT uq_job_worker UNIQUE (job_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);


-- ============================================================
-- SECTION 6: JOB PROOF  (redesigned: container + items + flags)
-- ============================================================

CREATE TABLE IF NOT EXISTS job_proofs (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id      UUID NOT NULL UNIQUE REFERENCES job_applications(id) ON DELETE CASCADE,

      -- Locked on first submission — cannot change
      worker_social_url   TEXT NOT NULL,

      instructions_seen   BOOLEAN NOT NULL DEFAULT FALSE,
      is_late             BOOLEAN NOT NULL DEFAULT FALSE,

      -- Time gap in seconds between applied_at and submitted_at
      -- Used for SUBMISSION_TOO_FAST flag detection
      submission_gap_secs INTEGER,

      submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proofs_social_url ON job_proofs(worker_social_url);


CREATE TABLE IF NOT EXISTS job_proof_items (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      proof_id        UUID NOT NULL REFERENCES job_proofs(id) ON DELETE CASCADE,
      proof_type      proof_type_enum NOT NULL,
      value           TEXT NOT NULL,         -- URL, username, comment text, or storage path
      is_before       BOOLEAN NOT NULL DEFAULT FALSE,  -- TRUE = before proof, FALSE = after
      display_order   INTEGER NOT NULL DEFAULT 0,
      captured_at     TIMESTAMPTZ,           -- When the screenshot/evidence was created, if known
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proof_items_proof ON job_proof_items(proof_id);

CREATE TABLE IF NOT EXISTS job_proof_flags (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      proof_id    UUID NOT NULL REFERENCES job_proofs(id) ON DELETE CASCADE,
      flag_type   flag_type_enum NOT NULL,
      severity    flag_severity_enum NOT NULL,
      detail      TEXT,
      flagged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved    BOOLEAN NOT NULL DEFAULT FALSE,
      resolved_at TIMESTAMPTZ,
      resolved_by UUID REFERENCES identity_users(id)
);

CREATE INDEX IF NOT EXISTS idx_flags_proof ON job_proof_flags(proof_id);
CREATE INDEX IF NOT EXISTS idx_flags_severity ON job_proof_flags(severity) WHERE resolved = FALSE;


-- ============================================================
-- SECTION 7: VERIFICATION
-- ============================================================

CREATE TABLE IF NOT EXISTS job_verifications (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id      UUID NOT NULL UNIQUE REFERENCES job_applications(id) ON DELETE CASCADE,
      verified_by         UUID REFERENCES identity_users(id),   -- NULL = auto-approved

      recheck_status      recheck_status_enum NOT NULL DEFAULT 'INACTIVE',
      is_verified         BOOLEAN NOT NULL,
      rejection_reason    TEXT,

      verified_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_recheck_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verifications_recheck
    ON job_verifications(recheck_status)
    WHERE recheck_status = 'ACTIVE';


-- ============================================================
-- SECTION 8: DISPUTES
-- ============================================================

CREATE TABLE IF NOT EXISTS job_disputes (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id      UUID NOT NULL REFERENCES job_applications(id),
      raised_by           UUID NOT NULL REFERENCES identity_users(id),
      reason              TEXT NOT NULL,
      status              dispute_status_enum NOT NULL DEFAULT 'OPEN',
      resolution_notes    TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at         TIMESTAMPTZ
);


-- ============================================================
-- SECTION 9: WALLET & PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS wallet (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL UNIQUE REFERENCES identity_users(id) ON DELETE CASCADE,
      balance     NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
      currency    TEXT NOT NULL DEFAULT 'NGN',
      is_frozen   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS wallet_transactions (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      wallet_id       UUID NOT NULL REFERENCES wallet(id),
      type            wallet_tx_type_enum NOT NULL,
      amount          NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      balance_before  NUMERIC(12, 2) NOT NULL,
      balance_after   NUMERIC(12, 2) NOT NULL,
      source          wallet_tx_source_enum NOT NULL,
      reference       TEXT,
      note            TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_txns ON wallet_transactions(wallet_id, created_at DESC);


CREATE TABLE IF NOT EXISTS job_payments (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      application_id      UUID NOT NULL UNIQUE REFERENCES job_applications(id),
      wallet_tx_id        UUID REFERENCES wallet_transactions(id),
      amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      currency            TEXT NOT NULL DEFAULT 'NGN',
      payment_status      payment_status_enum NOT NULL DEFAULT 'PENDING',
      payment_reference   TEXT,
      paid_at             TIMESTAMPTZ,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id             UUID NOT NULL REFERENCES identity_users(id),
      bank_account_id     UUID NOT NULL REFERENCES user_bank_accounts(id),
      wallet_tx_id        UUID REFERENCES wallet_transactions(id),
      amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      status              withdrawal_status_enum NOT NULL DEFAULT 'PENDING',
      payment_reference   TEXT,
      requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at        TIMESTAMPTZ
);


-- ============================================================
-- SECTION 10: NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES identity_users(id) ON DELETE CASCADE,
    type            notification_type_enum NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    entity_type     TEXT,    -- 'job_application', 'withdrawal_request', etc.
    entity_id       UUID,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
    ON notifications(user_id, created_at DESC)
    WHERE is_read = FALSE;


-- ============================================================
-- SECTION 11: FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on user_profiles
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- Auto-compute submission_gap_secs when proof is submitted
CREATE OR REPLACE FUNCTION fn_compute_proof_gap()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_applied_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT ja.applied_at, j.expires_at
    INTO v_applied_at, v_expires_at
    FROM job_applications ja
    JOIN jobs j ON j.id = ja.job_id
    WHERE ja.id = NEW.application_id;

    NEW.submission_gap_secs := EXTRACT(
        EPOCH FROM (NEW.submitted_at - v_applied_at)
    )::INTEGER;

    NEW.is_late := NEW.submitted_at > v_expires_at;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_proof_gap
    BEFORE INSERT ON job_proofs
    FOR EACH ROW EXECUTE FUNCTION fn_compute_proof_gap();


-- Auto-flag SUBMISSION_TOO_FAST after proof insert
CREATE OR REPLACE FUNCTION fn_auto_flag_proof()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
      v_job_type job_type_enum;
      v_min_gap  INTEGER;
      v_dup_count INTEGER;
BEGIN
      -- Resolve job type for this proof
      SELECT j.job_type INTO v_job_type
      FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      WHERE ja.id = NEW.application_id;

      -- Per-type minimum gap thresholds (seconds)
      v_min_gap := CASE v_job_type
            WHEN 'FOLLOW'  THEN 30
            WHEN 'LIKE'    THEN 15
            WHEN 'COMMENT' THEN 90
            WHEN 'RETWEET' THEN 20
            WHEN 'SHARE'   THEN 20
            WHEN 'SAVE'    THEN 15
            ELSE 20
      END;

      -- Flag if submitted too fast
      IF NEW.submission_gap_secs IS NOT NULL AND
            NEW.submission_gap_secs < v_min_gap THEN
            INSERT INTO job_proof_flags (proof_id, flag_type, severity, detail)
            VALUES (
                  NEW.id, 'SUBMISSION_TOO_FAST', 'HIGH',
                  format('Submitted %s seconds after applying. Minimum for %s is %s seconds.',
                        NEW.submission_gap_secs, v_job_type, v_min_gap)
            );
      END IF;

      -- Flag if worker_social_url seen on another worker account
      SELECT COUNT(DISTINCT ja.worker_id) INTO v_dup_count
      FROM job_proofs jp
      JOIN job_applications ja ON ja.id = jp.application_id
      WHERE jp.worker_social_url = NEW.worker_social_url
            AND jp.id != NEW.id;

      IF v_dup_count > 0 THEN
            INSERT INTO job_proof_flags (proof_id, flag_type, severity, detail)
            VALUES (
                  NEW.id, 'DUPLICATE_SOCIAL_URL', 'HIGH',
                  format('Social URL "%s" appears on %s other worker account(s).',
                        NEW.worker_social_url, v_dup_count)
            );
      END IF;

    -- Flag expired proof
    IF NEW.is_late THEN
        INSERT INTO job_proof_flags (proof_id, flag_type, severity, detail)
        VALUES (
            NEW.id, 'EXPIRED_PROOF', 'LOW',
            'Proof was submitted after the job expiry time.'
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_flag_proof
    AFTER INSERT ON job_proofs
    FOR EACH ROW EXECUTE FUNCTION fn_auto_flag_proof();


-- Credit wallet atomically when a JobPayment is approved
CREATE OR REPLACE FUNCTION fn_credit_wallet_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
      v_worker_id UUID;
      v_wallet    wallet%ROWTYPE;
      v_tx_id     UUID;
BEGIN
      -- Only act when status transitions to PAID
      IF NEW.payment_status = 'PAID' AND
            (OLD.payment_status IS NULL OR OLD.payment_status != 'PAID') THEN

            SELECT ja.worker_id INTO v_worker_id
            FROM job_applications ja
            WHERE ja.id = NEW.application_id;

            SELECT * INTO v_wallet FROM wallet WHERE user_id = v_worker_id FOR UPDATE;

            IF v_wallet.is_frozen THEN
                  RAISE EXCEPTION 'Wallet is frozen for user %', v_worker_id;
            END IF;

            INSERT INTO wallet_transactions (
                  wallet_id, type, amount,
                  balance_before, balance_after,
                  source, reference
            ) VALUES (
                  v_wallet.id, 'CREDIT', NEW.amount,
                  v_wallet.balance, v_wallet.balance + NEW.amount,
                  'JOB_PAYMENT', NEW.payment_reference
            ) RETURNING id INTO v_tx_id;

            UPDATE wallet
            SET balance = balance + NEW.amount
            WHERE id = v_wallet.id;

            NEW.wallet_tx_id := v_tx_id;
            NEW.paid_at := NOW();
      END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_wallet_on_payment
    BEFORE UPDATE ON job_payments
    FOR EACH ROW EXECUTE FUNCTION fn_credit_wallet_on_payment();


-- Auto-create wallet when identity_user is created
CREATE OR REPLACE FUNCTION fn_create_wallet_for_user()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
      INSERT INTO wallet (user_id) VALUES (NEW.id)
      ON CONFLICT (user_id) DO NOTHING;
      RETURN NEW;
END;
$$;

CREATE TRIGGER trg_create_wallet_for_user
    AFTER INSERT ON identity_users
    FOR EACH ROW EXECUTE FUNCTION fn_create_wallet_for_user();


-- Auto-increment jobs.filled_slots when application is APPROVED
CREATE OR REPLACE FUNCTION fn_update_filled_slots()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
      IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
            UPDATE jobs
            SET filled_slots = filled_slots + 1
            WHERE id = NEW.job_id;
      END IF;
      RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_filled_slots
    AFTER UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION fn_update_filled_slots();


-- ============================================================
-- SECTION 12: ROW LEVEL SECURITY (Supabase)
-- ============================================================

ALTER TABLE identity_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bank_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet                ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proofs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proof_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_proof_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;

-- Users see only their own profile
CREATE POLICY "own profile" ON user_profiles
    FOR ALL USING (user_id = auth.uid());

-- Users see only their own wallet
CREATE POLICY "own wallet" ON wallet
    FOR ALL USING (user_id = auth.uid());

-- Workers see only their own applications
CREATE POLICY "own applications" ON job_applications
    FOR ALL USING (worker_id = auth.uid());

-- Workers see only their own notifications
CREATE POLICY "own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Jobs are publicly readable when ACTIVE
CREATE POLICY "active jobs public read" ON jobs
    FOR SELECT USING (status = 'ACTIVE');

-- Platforms are publicly readable
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platforms public read" ON platforms
    FOR SELECT USING (is_active = TRUE);


-- ============================================================
-- SECTION 13: SEED DATA (minimal, for testing)
-- ============================================================

INSERT INTO platforms (id, name, owner, domain, base_url, logo_url)
VALUES
    ('00000000-0000-0000-0000-000000000001',
     'X (Twitter)', 'X Corp', 'x.com',
     'https://x.com', 'https://abs.twimg.com/favicons/twitter.3.ico'),
    ('00000000-0000-0000-0000-000000000002',
     'Instagram', 'Meta', 'instagram.com',
     'https://www.instagram.com', 'https://www.instagram.com/favicon.ico'),
    ('00000000-0000-0000-0000-000000000003',
     'TikTok', 'ByteDance', 'tiktok.com',
     'https://www.tiktok.com', 'https://www.tiktok.com/favicon.ico')
ON CONFLICT DO NOTHING;




-- ============================================================
-- JOB FUNDING — HYBRID LEDGER SYSTEM
-- ============================================================
-- Architecture:
--   job_funding_ledger  → immutable append-only transaction log
--                         (source of truth for all money movement)
--   job_funding         → denormalized summary cache
--                         (kept in sync by trigger, used for display)
--   Views               → real-time derived summaries for reporting
--   Auth queries        → always recompute from ledger (never trust cache)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE funding_tx_type AS ENUM (
    'FUND',        -- poster deposits into job escrow (job creation)
    'RESERVE',     -- slot reserved when worker is approved (pending payment)
    'RELEASE',     -- reserved funds released to worker (payment confirmed)
    'UNRESERVE',   -- reservation reversed (rejection, timeout, dispute)
    'REFUND'       -- remaining balance returned to poster wallet (cancel/expire)
);

CREATE TYPE funding_status_enum AS ENUM (
    'ACTIVE',      -- job is live, funds in escrow
    'DEPLETED',    -- all slots filled and paid
    'REFUNDED',    -- job cancelled, remainder returned
    'PARTIAL'      -- job ended with some slots unused, partial refund issued
);

CREATE TYPE deposit_status_enum AS ENUM (
    'PENDING',     -- awaiting Paystack confirmation
    'CONFIRMED',   -- payment verified and wallet credited
    'FAILED'       -- payment failed or expired
);


-- ─────────────────────────────────────────────────────────────
-- WALLET DEPOSITS
-- Tracks inbound money from Paystack/Flutterwave
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallet_deposits (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES identity_users(id),
    wallet_id           UUID NOT NULL REFERENCES wallet(id),
    amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency            TEXT NOT NULL DEFAULT 'NGN',
    status              deposit_status_enum NOT NULL DEFAULT 'PENDING',
    -- Paystack fields
    paystack_reference  TEXT UNIQUE,
    paystack_access_code TEXT,
    -- Lifecycle
    initiated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    -- The wallet_transaction created on confirmation
    wallet_tx_id        UUID REFERENCES wallet_transactions(id)
);

CREATE INDEX IF NOT EXISTS idx_deposits_user
    ON wallet_deposits(user_id, initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_reference
    ON wallet_deposits(paystack_reference) WHERE paystack_reference IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- JOB FUNDING SUMMARY (cache table)
-- Denormalized. Kept in sync by trigger from ledger.
-- Read for display. Never trust for authorization.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_funding (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id              UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,

    -- Immutable after creation
    funded_amount       NUMERIC(12,2) NOT NULL CHECK (funded_amount > 0),

    -- These three are maintained by trigger from job_funding_ledger
    -- funded = reserved + released + available
    reserved_amount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (reserved_amount >= 0),
    released_amount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (released_amount >= 0),
    refunded_amount     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),

    -- Derived: funded - reserved - released - refunded
    -- Stored for fast reads (display only)
    available_amount    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (available_amount >= 0),

    status              funding_status_enum NOT NULL DEFAULT 'ACTIVE',
    funded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at           TIMESTAMPTZ,

    CONSTRAINT chk_funding_totals CHECK (
        reserved_amount + released_amount + refunded_amount + available_amount
        = funded_amount
    )
);

COMMENT ON TABLE job_funding IS
    'Denormalized summary cache. Source of truth is job_funding_ledger.
     Read for display. Always recompute from ledger for authorization.';

COMMENT ON COLUMN job_funding.reserved_amount IS
    'Money committed to approved workers whose payment is still being processed.
     Increases on RESERVE, decreases on RELEASE or UNRESERVE.
     Prevents double-spending during async payment processing.';

COMMENT ON COLUMN job_funding.available_amount IS
    'Money still available for new slot approvals.
     = funded - reserved - released - refunded.
     Computed by trigger. Never manually updated.';


-- ─────────────────────────────────────────────────────────────
-- JOB FUNDING LEDGER (source of truth)
-- Immutable. Every money movement produces a row here.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_funding_ledger (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID NOT NULL REFERENCES jobs(id),
    application_id  UUID REFERENCES job_applications(id),

    tx_type         funding_tx_type NOT NULL,
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),

    -- Running balance snapshot at the time of this entry
    -- Allows point-in-time reconstruction without full scan
    balance_after_available  NUMERIC(12,2) NOT NULL,
    balance_after_reserved   NUMERIC(12,2) NOT NULL,
    balance_after_released   NUMERIC(12,2) NOT NULL,

    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ledger is append-only. No updates or deletes ever.
    CONSTRAINT chk_ledger_amounts CHECK (
        balance_after_available >= 0 AND
        balance_after_reserved  >= 0 AND
        balance_after_released  >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_ledger_job
    ON job_funding_ledger(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_application
    ON job_funding_ledger(application_id) WHERE application_id IS NOT NULL;

COMMENT ON TABLE job_funding_ledger IS
    'Immutable append-only ledger. Never UPDATE or DELETE rows here.
     This is the single source of truth for all job escrow movement.
     The job_funding table is a cache derived from this.';


-- ─────────────────────────────────────────────────────────────
-- VIEW: Real-time funding summary (always fresh from ledger)
-- Use this for reconciliation and auditing, not display.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_job_funding_live AS
SELECT
    jf.job_id,
    jf.funded_amount,

    -- Recomputed live from ledger — always accurate
    COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE'),   0) AS reserved_live,
    COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE'),   0) AS released_live,
    COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND'),    0) AS refunded_live,
    COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'UNRESERVE'), 0) AS unreserved_live,

    -- True available = funded - released - refunded - (reserves not yet released)
    jf.funded_amount
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE'),   0)
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND'),    0)
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE'),   0)
        + COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'UNRESERVE'), 0)
    AS available_live,

    -- Cache comparison for drift detection
    jf.reserved_amount  AS cached_reserved,
    jf.released_amount  AS cached_released,
    jf.available_amount AS cached_available,

    -- Drift flag: if cache disagrees with ledger, something is wrong
    (
        jf.available_amount != (
            jf.funded_amount
            - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE'),   0)
            - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND'),    0)
            - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE'),   0)
            + COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'UNRESERVE'), 0)
        )
    ) AS cache_drifted

FROM job_funding jf
LEFT JOIN job_funding_ledger l ON l.job_id = jf.job_id
GROUP BY jf.job_id, jf.funded_amount,
         jf.reserved_amount, jf.released_amount,
         jf.available_amount, jf.refunded_amount;

COMMENT ON VIEW v_job_funding_live IS
    'Always recomputed from ledger. Use for reconciliation and auth checks.
     cache_drifted = TRUE means the job_funding cache is out of sync — investigate.';


-- ─────────────────────────────────────────────────────────────
-- MATERIALIZED VIEW: Platform-wide escrow summary
-- Heavy aggregation — refresh on a schedule, not per-request.
-- ─────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_escrow_summary AS
SELECT
    DATE_TRUNC('day', l.created_at)     AS day,
    j.platform_id,
    p.name                              AS platform_name,
    COUNT(DISTINCT l.job_id)            AS jobs_with_activity,
    SUM(l.amount) FILTER (WHERE l.tx_type = 'FUND')      AS total_funded,
    SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE')   AS total_released,
    SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND')    AS total_refunded,
    SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE')   AS total_reserved,
    COUNT(*) FILTER (WHERE l.tx_type = 'FUND')           AS fund_events,
    COUNT(*) FILTER (WHERE l.tx_type = 'RELEASE')        AS release_events
FROM job_funding_ledger l
JOIN jobs j ON j.id = l.job_id
JOIN platforms p ON p.id = j.platform_id
GROUP BY DATE_TRUNC('day', l.created_at), j.platform_id, p.name
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_escrow_summary
    ON mv_platform_escrow_summary(day, platform_id);

COMMENT ON MATERIALIZED VIEW mv_platform_escrow_summary IS
    'Heavy aggregation. Refresh daily via pg_cron or Supabase edge function.
     REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_escrow_summary;';


-- ─────────────────────────────────────────────────────────────
-- TRIGGER: Sync job_funding cache from ledger
-- Every ledger insert updates the summary table atomically.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_sync_funding_cache()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE job_funding SET
        reserved_amount  = (
            SELECT COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RESERVE'),   0)
                 - COALESCE(SUM(amount) FILTER (WHERE tx_type = 'UNRESERVE'), 0)
            FROM job_funding_ledger WHERE job_id = NEW.job_id
        ),
        released_amount  = (
            SELECT COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RELEASE'), 0)
            FROM job_funding_ledger WHERE job_id = NEW.job_id
        ),
        refunded_amount  = (
            SELECT COALESCE(SUM(amount) FILTER (WHERE tx_type = 'REFUND'), 0)
            FROM job_funding_ledger WHERE job_id = NEW.job_id
        ),
        available_amount = (
            SELECT
                jf.funded_amount
                - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE'),   0)
                - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND'),    0)
                - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE'),   0)
                + COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'UNRESERVE'), 0)
            FROM job_funding jf
            LEFT JOIN job_funding_ledger l ON l.job_id = jf.job_id
            WHERE jf.job_id = NEW.job_id
            GROUP BY jf.funded_amount
        )
    WHERE job_id = NEW.job_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_funding_cache
    AFTER INSERT ON job_funding_ledger
    FOR EACH ROW EXECUTE FUNCTION fn_sync_funding_cache();


-- ─────────────────────────────────────────────────────────────
-- RPC: create_job_with_funding
-- Deducts from poster wallet → creates job → creates funding
-- → writes first ledger entry. All atomic.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_job_with_funding(
    p_platform_id           UUID,
    p_job_type              job_type_enum,
    p_target_url            TEXT,
    p_payout_amount         NUMERIC,
    p_payout_currency       TEXT,
    p_auto_approve          BOOLEAN,
    p_requires_screenshot   BOOLEAN,
    p_requires_before_proof BOOLEAN,
    p_proof_instructions    TEXT,
    p_title                 TEXT,
    p_description           TEXT,
    p_total_slots           INTEGER,
    p_expires_at            TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poster_id     UUID;
    v_wallet        wallet%ROWTYPE;
    v_total_cost    NUMERIC;
    v_platform_fee  NUMERIC;
    v_escrow_amount NUMERIC;
    v_job           jobs%ROWTYPE;
    v_funding       job_funding%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    v_poster_id := auth.uid();
    IF v_poster_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- ── Cost calculation ───────────────────────────────────────────────────
    v_total_cost    := p_payout_amount * p_total_slots;
    v_platform_fee  := ROUND(v_total_cost * 0.10, 2);
    v_escrow_amount := v_total_cost;   -- platform fee is separate, not in escrow

    -- ── Lock poster wallet and check balance ───────────────────────────────
    -- We lock with FOR UPDATE to prevent concurrent deductions racing each other
    SELECT * INTO v_wallet
    FROM wallet
    WHERE user_id = v_poster_id
    FOR UPDATE;

    IF v_wallet.is_frozen THEN
        RAISE EXCEPTION 'Your wallet is currently frozen. Contact support.';
    END IF;

    -- Authorization check: ALWAYS computed from wallet_transactions, not cached balance
    -- This is the one place we do NOT trust the cached balance field
    DECLARE
        v_authoritative_balance NUMERIC;
    BEGIN
        SELECT
            COALESCE(SUM(amount) FILTER (WHERE type = 'CREDIT'), 0) -
            COALESCE(SUM(amount) FILTER (WHERE type = 'DEBIT'),  0)
        INTO v_authoritative_balance
        FROM wallet_transactions
        WHERE wallet_id = v_wallet.id;

        IF v_authoritative_balance < (v_escrow_amount + v_platform_fee) THEN
            RETURN jsonb_build_object(
                'success',              FALSE,
                'error',                'insufficient_balance',
                'required',             v_escrow_amount + v_platform_fee,
                'available',            v_authoritative_balance,
                'shortfall',            (v_escrow_amount + v_platform_fee) - v_authoritative_balance
            );
        END IF;
    END;

    -- Just a final sanity check before finishing
    ASSERT (v_escrow_amount + v_platform_fee) > 0, 'Calculation error: Total cost is zero or negative';
    ASSERT v_poster_id = v_wallet.user_id, 'Wallet mismatch';

    -- ── Deduct from wallet ─────────────────────────────────────────────────
    -- Record the debit transaction
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, note
    ) VALUES (
        v_wallet.id, 'DEBIT', v_escrow_amount + v_platform_fee,
        v_wallet.balance,
        v_wallet.balance - (v_escrow_amount + v_platform_fee),
        'JOB_FUNDING',
        format('Escrow for job: %s (%s slots × ₦%s) + platform fee ₦%s',
               p_title, p_total_slots, p_payout_amount, v_platform_fee)
    ) RETURNING id INTO v_wallet_tx_id;

    -- Update cached wallet balance
    UPDATE wallet
    SET balance = balance - (v_escrow_amount + v_platform_fee)
    WHERE id = v_wallet.id;

    -- ── Create job (immediately ACTIVE — funds confirmed above) ────────────
    INSERT INTO jobs (
        user_id, platform_id, job_type, status,
        target_url, payout_amount, payout_currency,
        auto_approve, requires_screenshot, requires_before_proof,
        proof_instructions, title, description,
        total_slots, expires_at, posted_at
    ) VALUES (
        v_poster_id, p_platform_id, p_job_type, 'ACTIVE',
        p_target_url, p_payout_amount, p_payout_currency,
        p_auto_approve, p_requires_screenshot, p_requires_before_proof,
        p_proof_instructions, p_title, p_description,
        p_total_slots, p_expires_at, NOW()
    )
    RETURNING * INTO v_job;

    -- ── Create funding summary (cache) ─────────────────────────────────────
    INSERT INTO job_funding (
        job_id,
        funded_amount,
        reserved_amount,
        released_amount,
        refunded_amount,
        available_amount,
        status
    ) VALUES (
        v_job.id,
        v_escrow_amount,
        0,
        0,
        0,
        v_escrow_amount,   -- all available at start
        'ACTIVE'
    )
    RETURNING * INTO v_funding;

    -- ── Write first ledger entry (FUND) ────────────────────────────────────
    -- Trigger fn_sync_funding_cache fires here and reconciles the cache
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available,
        balance_after_reserved,
        balance_after_released,
        note
    ) VALUES (
        v_job.id, NULL, 'FUND', v_escrow_amount,
        v_escrow_amount,   -- all available
        0,
        0,
        format('Initial escrow: %s slots × ₦%s. Wallet tx: %s',
               p_total_slots, p_payout_amount, v_wallet_tx_id)
    );

    RETURN jsonb_build_object(
        'success',          TRUE,
        'job_id',           v_job.id,
        'escrow_amount',    v_escrow_amount,
        'platform_fee',     v_platform_fee,
        'total_charged',    v_escrow_amount + v_platform_fee,
        'wallet_tx_id',     v_wallet_tx_id,
        'job_status',       v_job.status
    );

EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- RPC: reserve_slot_funding
-- Called when a worker is approved but payment not yet processed.
-- Moves available → reserved so no other approval can claim it.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reserve_slot_funding(
    p_application_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app        job_applications%ROWTYPE;
    v_job        jobs%ROWTYPE;
    v_funding    job_funding%ROWTYPE;
    v_live_avail NUMERIC;
BEGIN
    SELECT * INTO v_app FROM job_applications WHERE id = p_application_id;
    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;

    -- Lock funding row
    SELECT * INTO v_funding
    FROM job_funding WHERE job_id = v_app.job_id FOR UPDATE;

    -- ── Authorization: recompute available from ledger (never trust cache) ──
    SELECT
        v_funding.funded_amount
        - COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RELEASE'),   0)
        - COALESCE(SUM(amount) FILTER (WHERE tx_type = 'REFUND'),    0)
        - COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RESERVE'),   0)
        + COALESCE(SUM(amount) FILTER (WHERE tx_type = 'UNRESERVE'), 0)
    INTO v_live_avail
    FROM job_funding_ledger
    WHERE job_id = v_app.job_id;

    IF v_live_avail < v_job.payout_amount THEN
        RAISE EXCEPTION 'Insufficient escrow balance to reserve this slot (available: %, needed: %)',
            v_live_avail, v_job.payout_amount;
    END IF;

    -- Write RESERVE ledger entry (trigger updates cache)
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available,
        balance_after_reserved,
        balance_after_released,
        note
    ) VALUES (
        v_app.job_id, p_application_id, 'RESERVE', v_job.payout_amount,
        v_live_avail - v_job.payout_amount,
        v_funding.reserved_amount + v_job.payout_amount,
        v_funding.released_amount,
        format('Slot reserved for application %s', p_application_id)
    );

    RETURN jsonb_build_object(
        'success',   TRUE,
        'reserved',  v_job.payout_amount,
        'remaining', v_live_avail - v_job.payout_amount
    );
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- RPC: release_slot_funding
-- Called when payment to worker is confirmed.
-- Moves reserved → released. Credits worker wallet.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION release_slot_funding(
    p_application_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app           job_applications%ROWTYPE;
    v_job           jobs%ROWTYPE;
    v_worker_wallet wallet%ROWTYPE;
    v_funding       job_funding%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    SELECT * INTO v_app FROM job_applications WHERE id = p_application_id;
    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;

    SELECT * INTO v_funding
    FROM job_funding WHERE job_id = v_app.job_id FOR UPDATE;

    -- Verify reservation exists
    IF NOT EXISTS (
        SELECT 1 FROM job_funding_ledger
        WHERE application_id = p_application_id AND tx_type = 'RESERVE'
    ) THEN
        RAISE EXCEPTION 'No reservation found for application %', p_application_id;
    END IF;

    -- Check not already released
    IF EXISTS (
        SELECT 1 FROM job_funding_ledger
        WHERE application_id = p_application_id AND tx_type = 'RELEASE'
    ) THEN
        RAISE EXCEPTION 'Funds already released for application %', p_application_id;
    END IF;

    -- Lock worker wallet
    SELECT * INTO v_worker_wallet
    FROM wallet WHERE user_id = v_app.worker_id FOR UPDATE;

    IF v_worker_wallet.is_frozen THEN
        RAISE EXCEPTION 'Worker wallet is frozen. Cannot release funds.';
    END IF;

    -- Credit worker wallet
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, reference, note
    ) VALUES (
        v_worker_wallet.id, 'CREDIT', v_job.payout_amount,
        v_worker_wallet.balance,
        v_worker_wallet.balance + v_job.payout_amount,
        'JOB_PAYMENT',
        p_application_id::TEXT,
        format('Payment for job: %s', v_job.title)
    ) RETURNING id INTO v_wallet_tx_id;

    UPDATE wallet
    SET balance = balance + v_job.payout_amount
    WHERE id = v_worker_wallet.id;

    -- Write RELEASE ledger entry (trigger updates cache)
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available,
        balance_after_reserved,
        balance_after_released,
        note
    ) VALUES (
        v_app.job_id, p_application_id, 'RELEASE', v_job.payout_amount,
        v_funding.available_amount,
        GREATEST(0, v_funding.reserved_amount - v_job.payout_amount),
        v_funding.released_amount + v_job.payout_amount,
        format('Payment released to worker %s. Wallet tx: %s',
               v_app.worker_id, v_wallet_tx_id)
    );

    -- Update application to PAID
    UPDATE job_applications
    SET status = 'PAID', updated_at = NOW()
    WHERE id = p_application_id;

    -- Update job_payments record
    UPDATE job_payments
    SET payment_status = 'PAID',
        wallet_tx_id   = v_wallet_tx_id,
        paid_at        = NOW()
    WHERE application_id = p_application_id;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'amount_released', v_job.payout_amount,
        'wallet_tx_id',   v_wallet_tx_id
    );
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- RPC: cancel_job_and_refund
-- Cancels a job, releases unreserved escrow back to poster wallet.
-- reserved slots (pending payment) are waited on — not refunded yet.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION cancel_job_and_refund(
    p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id     UUID;
    v_job           jobs%ROWTYPE;
    v_funding       job_funding%ROWTYPE;
    v_live          v_job_funding_live%ROWTYPE;
    v_refund_amount NUMERIC;
    v_poster_wallet wallet%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    v_caller_id := auth.uid();

    SELECT * INTO v_job FROM jobs WHERE id = p_job_id FOR UPDATE;

    IF v_job.user_id != v_caller_id THEN
        RAISE EXCEPTION 'You do not own this job';
    END IF;

    IF v_job.status NOT IN ('ACTIVE', 'PAUSED') THEN
        RAISE EXCEPTION 'Only ACTIVE or PAUSED jobs can be cancelled';
    END IF;

    SELECT * INTO v_funding FROM job_funding WHERE job_id = p_job_id FOR UPDATE;

    -- Get live available balance from view (recomputed from ledger)
    SELECT * INTO v_live FROM v_job_funding_live WHERE job_id = p_job_id;

    v_refund_amount := v_live.available_live;

    IF v_refund_amount <= 0 THEN
        -- Nothing to refund (all slots filled and released)
        UPDATE jobs SET status = 'CANCELLED', completed_at = NOW() WHERE id = p_job_id;
        UPDATE job_funding SET status = 'DEPLETED', closed_at = NOW() WHERE job_id = p_job_id;

        RETURN jsonb_build_object(
            'success',        TRUE,
            'refund_amount',  0,
            'message',        'Job cancelled. No remaining balance to refund.'
        );
    END IF;

    -- Lock poster wallet
    SELECT * INTO v_poster_wallet
    FROM wallet WHERE user_id = v_job.user_id FOR UPDATE;

    -- Refund available amount to poster wallet
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, note
    ) VALUES (
        v_poster_wallet.id, 'CREDIT', v_refund_amount,
        v_poster_wallet.balance,
        v_poster_wallet.balance + v_refund_amount,
        'JOB_REFUND',
        format('Refund from cancelled job: %s (%.0f unused slots)',
               v_job.title,
               v_refund_amount / v_job.payout_amount)
    ) RETURNING id INTO v_wallet_tx_id;

    UPDATE wallet
    SET balance = balance + v_refund_amount
    WHERE id = v_poster_wallet.id;

    -- Write REFUND ledger entry
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available,
        balance_after_reserved,
        balance_after_released,
        note
    ) VALUES (
        p_job_id, NULL, 'REFUND', v_refund_amount,
        0,
        v_live.reserved_live,
        v_live.released_live,
        format('Job cancelled. ₦%s refunded to poster wallet. Tx: %s',
               v_refund_amount, v_wallet_tx_id)
    );

    -- Update statuses
    UPDATE jobs
    SET status = 'CANCELLED', completed_at = NOW()
    WHERE id = p_job_id;

    UPDATE job_funding
    SET status = 'REFUNDED', closed_at = NOW()
    WHERE job_id = p_job_id;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'refund_amount',  v_refund_amount,
        'wallet_tx_id',   v_wallet_tx_id,
        'reserved_pending', v_live.reserved_live
    );
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- RPC: confirm_wallet_deposit
-- Called by Paystack webhook handler (your backend/edge function).
-- Verifies reference hasn't been used, credits wallet.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION confirm_wallet_deposit(
    p_paystack_reference TEXT,
    p_amount             NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit       wallet_deposits%ROWTYPE;
    v_wallet        wallet%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    -- Idempotency: check reference hasn't already been confirmed
    SELECT * INTO v_deposit
    FROM wallet_deposits
    WHERE paystack_reference = p_paystack_reference
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Deposit reference not found: %', p_paystack_reference;
    END IF;

    IF v_deposit.status = 'CONFIRMED' THEN
        -- Already processed — return success (idempotent)
        RETURN jsonb_build_object(
            'success',      TRUE,
            'idempotent',   TRUE,
            'wallet_tx_id', v_deposit.wallet_tx_id
        );
    END IF;

    IF v_deposit.status = 'FAILED' THEN
        RAISE EXCEPTION 'Cannot confirm a failed deposit';
    END IF;

    -- Amount mismatch check
    IF v_deposit.amount != p_amount THEN
        RAISE EXCEPTION 'Amount mismatch: expected %, received %',
            v_deposit.amount, p_amount;
    END IF;

    -- Lock wallet
    SELECT * INTO v_wallet FROM wallet WHERE id = v_deposit.wallet_id FOR UPDATE;

    -- Credit the wallet
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, reference, note
    ) VALUES (
        v_wallet.id, 'CREDIT', p_amount,
        v_wallet.balance,
        v_wallet.balance + p_amount,
        'DEPOSIT',
        p_paystack_reference,
        'Paystack deposit confirmed'
    ) RETURNING id INTO v_wallet_tx_id;

    UPDATE wallet
    SET balance = balance + p_amount
    WHERE id = v_wallet.id;

    -- Mark deposit as confirmed
    UPDATE wallet_deposits
    SET status       = 'CONFIRMED',
        confirmed_at = NOW(),
        wallet_tx_id = v_wallet_tx_id
    WHERE id = v_deposit.id;

    RETURN jsonb_build_object(
        'success',      TRUE,
        'idempotent',   FALSE,
        'amount',       p_amount,
        'wallet_tx_id', v_wallet_tx_id,
        'new_balance',  v_wallet.balance + p_amount
    );
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- RECONCILIATION QUERY
-- Run this periodically to detect any cache drift.
-- Any row where cache_drifted = TRUE needs investigation.
-- ─────────────────────────────────────────────────────────────

-- SELECT job_id, cached_available, available_live, cache_drifted
-- FROM v_job_funding_live
-- WHERE cache_drifted = TRUE;











-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================
-- ============================================================================================================



-- ============================================================
-- COMPLETE RPC SUITE — Job Funding Lifecycle
-- ============================================================
-- Run order:
--   1. schema.sql          (tables, enums, triggers)
--   2. job_funding_ledger.sql  (ledger table, views, cache trigger)
--   3. THIS FILE           (all RPCs)
-- ============================================================
-- Functions in this file:
--
--   [Auth]
--   insert_user_profile        — profile + bank account (atomic)
--
--   [Job Posting]
--   create_job_with_funding    — deduct wallet → job ACTIVE → ledger FUND
--
--   [Worker Flow]
--   apply_and_start_job        — slot check + application creation
--   submit_job_proof           — proof + items + RESERVE ledger entry
--
--   [Employer Verification]
--   verify_and_approve         — APPROVE: RESERVE confirmed, job_payment created
--   verify_and_reject          — REJECT: UNRESERVE ledger, slot freed
--   bulk_verify_applications   — batch approve/reject up to 50 at once
--
--   [Payment Release]
--   release_payment            — RELEASE ledger + worker wallet CREDIT
--   auto_release_approved      — called by cron: releases all pending APPROVED
--
--   [Job Management]
--   cancel_job_and_refund      — REFUND available_amount back to poster
--   pause_job / resume_job     — toggle job visibility
-- ============================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: recompute available balance from ledger (authoritative)
-- Used inside RPCs for authorization decisions. Never trust the cache.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_ledger_available(p_job_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
    SELECT
        jf.funded_amount
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RESERVE'),   0)
        + COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'UNRESERVE'), 0)
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'RELEASE'),   0)
        - COALESCE(SUM(l.amount) FILTER (WHERE l.tx_type = 'REFUND'),    0)
    FROM job_funding jf
    LEFT JOIN job_funding_ledger l ON l.job_id = jf.job_id
    WHERE jf.job_id = p_job_id
    GROUP BY jf.funded_amount;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: authoritative wallet balance from transactions
-- Used inside RPCs for debit authorization. Never trust wallet.balance.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_wallet_balance(p_wallet_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
    SELECT
        COALESCE(SUM(amount) FILTER (WHERE type = 'CREDIT'), 0) -
        COALESCE(SUM(amount) FILTER (WHERE type = 'DEBIT'),  0)
    FROM wallet_transactions
    WHERE wallet_id = p_wallet_id;
$$;


-- ============================================================
-- 1. INSERT USER PROFILE
-- ============================================================

CREATE OR REPLACE FUNCTION insert_user_profile(
    p_first_name     TEXT,
    p_last_name      TEXT,
    p_phone          TEXT,
    p_gender         gender_enum,
    p_state          nigerian_state_enum,
    p_user_type      TEXT,
    p_bank_name      TEXT,
    p_account_number TEXT,
    p_account_name   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_profile user_profiles%ROWTYPE;
    v_bank    user_bank_accounts%ROWTYPE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = v_user_id) THEN
        RAISE EXCEPTION 'Profile already exists for this user';
    END IF;

    INSERT INTO user_profiles (user_id, first_name, last_name, gender, state, metadata)
    VALUES (v_user_id, p_first_name, p_last_name, p_gender, p_state,
            jsonb_build_object('user_type', p_user_type))
    RETURNING * INTO v_profile;

    INSERT INTO user_contacts (user_id, phone) VALUES (v_user_id, p_phone)
    ON CONFLICT DO NOTHING;

    INSERT INTO user_bank_accounts (
        user_id, bank_name, account_number, account_name, is_verified, is_default
    ) VALUES (v_user_id, p_bank_name, p_account_number, p_account_name, FALSE, TRUE)
    RETURNING * INTO v_bank;

    INSERT INTO wallet (user_id) VALUES (v_user_id) ON CONFLICT (user_id) DO NOTHING;

    RETURN jsonb_build_object(
        'success', TRUE,
        'profile', row_to_json(v_profile),
        'bank',    row_to_json(v_bank)
    );
END;
$$;


-- ============================================================
-- 2. CREATE JOB WITH FUNDING
-- Deducts from poster wallet → job ACTIVE → ledger FUND entry
-- Returns insufficient_balance error if wallet too low (frontend
-- redirects to deposit page on this error code).
-- ============================================================

CREATE OR REPLACE FUNCTION create_job_with_funding(
    p_platform_id           UUID,
    p_job_type              job_type_enum,
    p_target_url            TEXT,
    p_payout_amount         NUMERIC,
    p_payout_currency       TEXT,
    p_auto_approve          BOOLEAN,
    p_requires_screenshot   BOOLEAN,
    p_requires_before_proof BOOLEAN,
    p_proof_instructions    TEXT,
    p_title                 TEXT,
    p_description           TEXT,
    p_total_slots           INTEGER,
    p_expires_at            TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poster_id     UUID;
    v_wallet        wallet%ROWTYPE;
    v_escrow_amount NUMERIC;
    v_platform_fee  NUMERIC;
    v_total_charge  NUMERIC;
    v_true_balance  NUMERIC;
    v_job           jobs%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    v_poster_id := auth.uid();
    IF v_poster_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    IF p_payout_amount <= 0  THEN RAISE EXCEPTION 'Payout amount must be positive'; END IF;
    IF p_total_slots   <= 0  THEN RAISE EXCEPTION 'Total slots must be positive';   END IF;

    v_escrow_amount := p_payout_amount * p_total_slots;
    v_platform_fee  := ROUND(v_escrow_amount * 0.10, 2);
    v_total_charge  := v_escrow_amount + v_platform_fee;

    -- Lock poster wallet row
    SELECT * INTO v_wallet FROM wallet WHERE user_id = v_poster_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Wallet not found for user'; END IF;
    IF v_wallet.is_frozen THEN RAISE EXCEPTION 'Your wallet is currently frozen. Contact support.'; END IF;

    -- ── Authorization: ALWAYS recompute from transactions, never trust cache ──
    v_true_balance := fn_wallet_balance(v_wallet.id);

    IF v_true_balance < v_total_charge THEN
        RETURN jsonb_build_object(
            'success',    FALSE,
            'error',      'insufficient_balance',
            'required',   v_total_charge,
            'available',  v_true_balance,
            'shortfall',  v_total_charge - v_true_balance,
            'escrow',     v_escrow_amount,
            'fee',        v_platform_fee
        );
    END IF;

    -- ── Debit poster wallet ───────────────────────────────────────────────────
    INSERT INTO wallet_transactions (
        wallet_id, type, amount, balance_before, balance_after, source, note
    ) VALUES (
        v_wallet.id, 'DEBIT', v_total_charge,
        v_wallet.balance, v_wallet.balance - v_total_charge,
        'JOB_FUNDING',
        format('Escrow ₦%s (%s slots × ₦%s) + fee ₦%s | job: %s',
               v_escrow_amount, p_total_slots, p_payout_amount, v_platform_fee, p_title)
    ) RETURNING id INTO v_wallet_tx_id;

    -- Sync cached balance
    UPDATE wallet SET balance = balance - v_total_charge WHERE id = v_wallet.id;

    -- ── Create job — immediately ACTIVE, funds confirmed above ────────────────
    INSERT INTO jobs (
        user_id, platform_id, job_type, status,
        target_url, payout_amount, payout_currency,
        auto_approve, requires_screenshot, requires_before_proof,
        proof_instructions, title, description,
        total_slots, expires_at, posted_at
    ) VALUES (
        v_poster_id, p_platform_id, p_job_type, 'ACTIVE',
        p_target_url, p_payout_amount, p_payout_currency,
        p_auto_approve, p_requires_screenshot, p_requires_before_proof,
        p_proof_instructions, p_title, p_description,
        p_total_slots, p_expires_at, NOW()
    ) RETURNING * INTO v_job;

    -- ── Create funding summary (cache) ────────────────────────────────────────
    INSERT INTO job_funding (
        job_id, funded_amount, reserved_amount, released_amount,
        refunded_amount, available_amount, status
    ) VALUES (
        v_job.id, v_escrow_amount, 0, 0, 0, v_escrow_amount, 'ACTIVE'
    );

    -- ── Write FUND ledger entry (trigger syncs cache) ─────────────────────────
    INSERT INTO job_funding_ledger (
        job_id, tx_type, amount,
        balance_after_available, balance_after_reserved, balance_after_released,
        note
    ) VALUES (
        v_job.id, 'FUND', v_escrow_amount,
        v_escrow_amount, 0, 0,
        format('Initial escrow from wallet tx %s', v_wallet_tx_id)
    );

    RETURN jsonb_build_object(
        'success',        TRUE,
        'job_id',         v_job.id,
        'escrow_amount',  v_escrow_amount,
        'platform_fee',   v_platform_fee,
        'total_charged',  v_total_charge,
        'wallet_tx_id',   v_wallet_tx_id,
        'job_status',     v_job.status
    );
END;
$$;


-- ============================================================
-- 3. APPLY AND START JOB
-- Slot check + duplicate guard + application created at WORKING
-- NOTE: No ledger entry here — reservation happens on submission,
-- not on application. Worker might abandon without submitting.
-- ============================================================

CREATE OR REPLACE FUNCTION apply_and_start_job(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_worker_id UUID;
    v_job       jobs%ROWTYPE;
    v_app       job_applications%ROWTYPE;
BEGIN
    v_worker_id := auth.uid();
    IF v_worker_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = p_job_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

    IF v_job.status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Job is not currently active (status: %)', v_job.status;
    END IF;

    IF v_job.filled_slots >= v_job.total_slots THEN
        RAISE EXCEPTION 'All slots are filled for this job';
    END IF;

    -- Employer cannot work their own job
    IF v_job.user_id = v_worker_id THEN
        RAISE EXCEPTION 'You cannot apply to your own job';
    END IF;

    IF EXISTS (
        SELECT 1 FROM job_applications
        WHERE job_id = p_job_id AND worker_id = v_worker_id
    ) THEN
        RAISE EXCEPTION 'You have already applied for this job';
    END IF;

    INSERT INTO job_applications (job_id, worker_id, status)
    VALUES (p_job_id, v_worker_id, 'WORKING')
    RETURNING * INTO v_app;

    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = p_job_id;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'application_id', v_app.id,
        'status',         v_app.status,
        'expires_at',     v_job.expires_at
    );
END;
$$;


-- ============================================================
-- 4. SUBMIT JOB PROOF
-- Creates job_proof + items atomically.
-- Writes RESERVE ledger entry — slot is now financially claimed.
-- Auto-flags fire via trigger on job_proofs insert.
-- ============================================================

CREATE OR REPLACE FUNCTION submit_job_proof(
    p_application_id    UUID,
    p_worker_social_url TEXT,
    p_instructions_seen BOOLEAN,
    p_items             JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_worker_id   UUID;
    v_app         job_applications%ROWTYPE;
    v_job         jobs%ROWTYPE;
    v_funding     job_funding%ROWTYPE;
    v_proof       job_proofs%ROWTYPE;
    v_item        JSONB;
    v_flags       JSONB;
    v_live_avail  NUMERIC;
BEGIN
    v_worker_id := auth.uid();
    IF v_worker_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_app
    FROM job_applications
    WHERE id = p_application_id AND worker_id = v_worker_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Application not found or does not belong to you'; END IF;

    IF v_app.status != 'WORKING' THEN
        RAISE EXCEPTION 'Application must be WORKING to submit proof (current: %)', v_app.status;
    END IF;

    IF EXISTS (SELECT 1 FROM job_proofs WHERE application_id = p_application_id) THEN
        RAISE EXCEPTION 'Proof already submitted for this application';
    END IF;

    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;
    SELECT * INTO v_funding FROM job_funding WHERE job_id = v_app.job_id FOR UPDATE;

    -- ── Authorization: recompute available from ledger ────────────────────────
    v_live_avail := fn_ledger_available(v_app.job_id);

    IF v_live_avail < v_job.payout_amount THEN
        RAISE EXCEPTION
            'Insufficient escrow to reserve this slot (available: ₦%, needed: ₦%)',
            v_live_avail, v_job.payout_amount;
    END IF;

    -- ── Create proof record (gap + is_late computed by trigger) ──────────────
    INSERT INTO job_proofs (
        application_id, worker_social_url,
        instructions_seen, submitted_at
    ) VALUES (
        p_application_id, p_worker_social_url,
        p_instructions_seen, NOW()
    ) RETURNING * INTO v_proof;

    -- ── Insert proof items ────────────────────────────────────────────────────
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO job_proof_items (proof_id, proof_type, value, is_before, display_order)
        VALUES (
            v_proof.id,
            (v_item->>'proof_type')::proof_type_enum,
            v_item->>'value',
            (v_item->>'is_before')::boolean,
            (v_item->>'display_order')::integer
        );
    END LOOP;

    -- ── Transition application WORKING → SUBMITTED ────────────────────────────
    UPDATE job_applications SET status = 'SUBMITTED', updated_at = NOW()
    WHERE id = p_application_id;

    -- ── Write RESERVE ledger entry ────────────────────────────────────────────
    -- Trigger fn_sync_funding_cache fires and updates job_funding cache
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available, balance_after_reserved, balance_after_released,
        note
    ) VALUES (
        v_app.job_id, p_application_id, 'RESERVE', v_job.payout_amount,
        v_live_avail - v_job.payout_amount,
        v_funding.reserved_amount + v_job.payout_amount,
        v_funding.released_amount,
        format('Slot reserved on proof submission. Proof ID: %s', v_proof.id)
    );

    -- ── Collect auto-flags ────────────────────────────────────────────────────
    SELECT jsonb_agg(jsonb_build_object(
        'flag_type', flag_type,
        'severity',  severity,
        'detail',    detail
    ))
    INTO v_flags
    FROM job_proof_flags WHERE proof_id = v_proof.id;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'proof_id',       v_proof.id,
        'submission_gap', v_proof.submission_gap_secs,
        'is_late',        v_proof.is_late,
        'reserved',       v_job.payout_amount,
        'flags',          COALESCE(v_flags, '[]'::jsonb)
    );
END;
$$;


-- ============================================================
-- 5. VERIFY AND APPROVE
-- Employer reviews submitted proof → APPROVED.
-- Creates job_verification + job_payment records.
-- If auto_approve is TRUE this is called automatically by trigger.
-- Payment is NOT released yet — release_payment does that.
-- ============================================================

CREATE OR REPLACE FUNCTION verify_and_approve(
    p_application_id UUID,
    p_notes          TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employer_id UUID;
    v_app         job_applications%ROWTYPE;
    v_job         jobs%ROWTYPE;
    v_proof       job_proofs%ROWTYPE;
    v_payment     job_payments%ROWTYPE;
BEGIN
    v_employer_id := auth.uid();
    IF v_employer_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_app FROM job_applications WHERE id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;

    -- Only the job owner or platform admin can verify
    IF v_job.user_id != v_employer_id THEN
        RAISE EXCEPTION 'Only the job owner can verify submissions';
    END IF;

    IF v_app.status != 'SUBMITTED' THEN
        RAISE EXCEPTION 'Application must be SUBMITTED to approve (current: %)', v_app.status;
    END IF;

    -- Check proof exists
    SELECT * INTO v_proof FROM job_proofs WHERE application_id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'No proof found for this application'; END IF;

    -- Check not already verified
    IF EXISTS (SELECT 1 FROM job_verifications WHERE application_id = p_application_id) THEN
        RAISE EXCEPTION 'This application has already been verified';
    END IF;

    -- ── Create verification record ────────────────────────────────────────────
    INSERT INTO job_verifications (
        application_id, verified_by, is_verified,
        recheck_status, rejection_reason, verified_at
    ) VALUES (
        p_application_id, v_employer_id, TRUE,
        CASE WHEN v_job.job_type IN ('FOLLOW', 'LIKE') THEN 'ACTIVE'::recheck_status_enum
             ELSE 'INACTIVE'::recheck_status_enum END,
        NULL,
        NOW()
    );

    -- ── Transition application → APPROVED ─────────────────────────────────────
    UPDATE job_applications SET status = 'APPROVED', updated_at = NOW()
    WHERE id = p_application_id;

    -- ── Increment filled_slots ────────────────────────────────────────────────
    UPDATE jobs SET filled_slots = filled_slots + 1 WHERE id = v_app.job_id;

    -- ── Create PENDING payment record ─────────────────────────────────────────
    -- Reserved funds are already in the ledger. Payment record tracks the
    -- release step. payment_status = PENDING until release_payment is called.
    INSERT INTO job_payments (
        application_id, amount, currency, payment_status
    ) VALUES (
        p_application_id, v_job.payout_amount, v_job.payout_currency, 'PENDING'
    ) RETURNING * INTO v_payment;

    -- ── Auto-release if job has auto_approve ─────────────────────────────────
    -- We call release_payment immediately for auto-approve jobs.
    -- For manual jobs the employer explicitly calls release_payment later.
    IF v_job.auto_approve THEN
        PERFORM release_payment(p_application_id);
    END IF;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'application_id', p_application_id,
        'payment_id',     v_payment.id,
        'amount',         v_job.payout_amount,
        'auto_released',  v_job.auto_approve
    );
END;
$$;


-- ============================================================
-- 6. VERIFY AND REJECT
-- Employer rejects submitted proof.
-- Writes UNRESERVE ledger entry — slot available again.
-- ============================================================

CREATE OR REPLACE FUNCTION verify_and_reject(
    p_application_id UUID,
    p_reason         TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employer_id  UUID;
    v_app          job_applications%ROWTYPE;
    v_job          jobs%ROWTYPE;
    v_funding      job_funding%ROWTYPE;
    v_reserved_row job_funding_ledger%ROWTYPE;
BEGIN
    v_employer_id := auth.uid();
    IF v_employer_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'A rejection reason is required';
    END IF;

    SELECT * INTO v_app FROM job_applications WHERE id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;
    IF v_job.user_id != v_employer_id THEN
        RAISE EXCEPTION 'Only the job owner can reject submissions';
    END IF;

    IF v_app.status != 'SUBMITTED' THEN
        RAISE EXCEPTION 'Application must be SUBMITTED to reject (current: %)', v_app.status;
    END IF;

    IF EXISTS (SELECT 1 FROM job_verifications WHERE application_id = p_application_id) THEN
        RAISE EXCEPTION 'This application has already been verified';
    END IF;

    SELECT * INTO v_funding FROM job_funding WHERE job_id = v_app.job_id FOR UPDATE;

    -- Confirm a RESERVE entry exists for this application
    SELECT * INTO v_reserved_row
    FROM job_funding_ledger
    WHERE application_id = p_application_id AND tx_type = 'RESERVE'
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No reservation found for this application — cannot unreserve';
    END IF;

    -- ── Create rejection verification record ──────────────────────────────────
    INSERT INTO job_verifications (
        application_id, verified_by, is_verified,
        recheck_status, rejection_reason, verified_at
    ) VALUES (
        p_application_id, v_employer_id, FALSE,
        'INACTIVE', p_reason, NOW()
    );

    -- ── Transition application → REJECTED ────────────────────────────────────
    UPDATE job_applications SET status = 'REJECTED', updated_at = NOW()
    WHERE id = p_application_id;

    -- ── Write UNRESERVE ledger entry (trigger syncs cache) ────────────────────
    -- This frees the slot back to available_amount so another worker can claim it
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available, balance_after_reserved, balance_after_released,
        note
    ) VALUES (
        v_app.job_id, p_application_id, 'UNRESERVE', v_job.payout_amount,
        fn_ledger_available(v_app.job_id) + v_job.payout_amount,
        GREATEST(0, v_funding.reserved_amount - v_job.payout_amount),
        v_funding.released_amount,
        format('Rejection: %s', p_reason)
    );

    -- ── Create rejection dispute opportunity ──────────────────────────────────
    -- Worker can raise a dispute against this rejection.
    -- We do not auto-create it; they choose to dispute from the frontend.

    RETURN jsonb_build_object(
        'success',        TRUE,
        'application_id', p_application_id,
        'reason',         p_reason,
        'slot_freed',     TRUE
    );
END;
$$;


-- ============================================================
-- 7. BULK VERIFY APPLICATIONS
-- Employer approves or rejects multiple submissions at once.
-- Max 50 per call to avoid lock contention.
-- ============================================================

CREATE OR REPLACE FUNCTION bulk_verify_applications(
    p_application_ids UUID[],
    p_action          TEXT,   -- 'APPROVE' or 'REJECT'
    p_reason          TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employer_id UUID;
    v_app_id      UUID;
    v_results     JSONB := '[]'::jsonb;
    v_result      JSONB;
    v_ok          INTEGER := 0;
    v_failed      INTEGER := 0;
BEGIN
    v_employer_id := auth.uid();
    IF v_employer_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    IF array_length(p_application_ids, 1) > 50 THEN
        RAISE EXCEPTION 'Maximum 50 applications per bulk action';
    END IF;

    IF p_action NOT IN ('APPROVE', 'REJECT') THEN
        RAISE EXCEPTION 'Action must be APPROVE or REJECT';
    END IF;

    IF p_action = 'REJECT' AND (p_reason IS NULL OR TRIM(p_reason) = '') THEN
        RAISE EXCEPTION 'A rejection reason is required for bulk rejection';
    END IF;

    FOREACH v_app_id IN ARRAY p_application_ids
    LOOP
        BEGIN
            IF p_action = 'APPROVE' THEN
                SELECT verify_and_approve(v_app_id, p_reason) INTO v_result;
            ELSE
                SELECT verify_and_reject(v_app_id, p_reason) INTO v_result;
            END IF;

            v_results := v_results || jsonb_build_array(
                jsonb_build_object('application_id', v_app_id, 'success', TRUE)
            );
            v_ok := v_ok + 1;

        EXCEPTION WHEN OTHERS THEN
            v_results := v_results || jsonb_build_array(
                jsonb_build_object(
                    'application_id', v_app_id,
                    'success', FALSE,
                    'error', SQLERRM
                )
            );
            v_failed := v_failed + 1;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success',  TRUE,
        'approved', CASE WHEN p_action = 'APPROVE' THEN v_ok ELSE 0 END,
        'rejected', CASE WHEN p_action = 'REJECT'  THEN v_ok ELSE 0 END,
        'failed',   v_failed,
        'results',  v_results
    );
END;
$$;


-- ============================================================
-- 8. RELEASE PAYMENT
-- Moves APPROVED application → PAID.
-- RELEASE ledger entry → worker wallet CREDIT.
-- Called automatically by verify_and_approve if auto_approve,
-- or manually by employer from the verification dashboard.
-- ============================================================

CREATE OR REPLACE FUNCTION release_payment(p_application_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_id     UUID;
    v_app           job_applications%ROWTYPE;
    v_job           jobs%ROWTYPE;
    v_funding       job_funding%ROWTYPE;
    v_payment       job_payments%ROWTYPE;
    v_worker_wallet wallet%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    v_caller_id := auth.uid();

    SELECT * INTO v_app FROM job_applications WHERE id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = v_app.job_id;

    -- Can be called by: employer (manual release) or internally (auto_approve)
    -- When called internally v_caller_id may differ — allow internal calls
    IF v_caller_id IS NOT NULL AND v_caller_id != v_job.user_id THEN
        RAISE EXCEPTION 'Only the job owner can release payments';
    END IF;

    IF v_app.status != 'APPROVED' THEN
        RAISE EXCEPTION 'Application must be APPROVED to release payment (current: %)', v_app.status;
    END IF;

    -- Get payment record
    SELECT * INTO v_payment FROM job_payments WHERE application_id = p_application_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Payment record not found for this application'; END IF;

    IF v_payment.payment_status = 'PAID' THEN
        RETURN jsonb_build_object(
            'success',    TRUE,
            'idempotent', TRUE,
            'message',    'Payment already released'
        );
    END IF;

    -- Check reservation exists in ledger
    IF NOT EXISTS (
        SELECT 1 FROM job_funding_ledger
        WHERE application_id = p_application_id AND tx_type = 'RESERVE'
    ) THEN
        RAISE EXCEPTION 'No ledger reservation found for application %', p_application_id;
    END IF;

    -- Ensure not already released
    IF EXISTS (
        SELECT 1 FROM job_funding_ledger
        WHERE application_id = p_application_id AND tx_type = 'RELEASE'
    ) THEN
        RAISE EXCEPTION 'Payment already released in ledger for application %', p_application_id;
    END IF;

    SELECT * INTO v_funding FROM job_funding WHERE job_id = v_app.job_id FOR UPDATE;

    -- Lock and validate worker wallet
    SELECT * INTO v_worker_wallet FROM wallet WHERE user_id = v_app.worker_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Worker wallet not found'; END IF;
    IF v_worker_wallet.is_frozen THEN
        RAISE EXCEPTION 'Worker wallet is frozen. Payment cannot be released.';
    END IF;

    -- ── Credit worker wallet ──────────────────────────────────────────────────
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, reference, note
    ) VALUES (
        v_worker_wallet.id, 'CREDIT', v_job.payout_amount,
        v_worker_wallet.balance,
        v_worker_wallet.balance + v_job.payout_amount,
        'JOB_PAYMENT',
        p_application_id::TEXT,
        format('Payout for: %s', v_job.title)
    ) RETURNING id INTO v_wallet_tx_id;

    UPDATE wallet SET balance = balance + v_job.payout_amount WHERE id = v_worker_wallet.id;

    -- ── Write RELEASE ledger entry (trigger syncs cache) ──────────────────────
    INSERT INTO job_funding_ledger (
        job_id, application_id, tx_type, amount,
        balance_after_available, balance_after_reserved, balance_after_released,
        note
    ) VALUES (
        v_app.job_id, p_application_id, 'RELEASE', v_job.payout_amount,
        v_funding.available_amount,
        GREATEST(0, v_funding.reserved_amount - v_job.payout_amount),
        v_funding.released_amount + v_job.payout_amount,
        format('Payment released. Wallet tx: %s', v_wallet_tx_id)
    );

    -- ── Update payment record ─────────────────────────────────────────────────
    UPDATE job_payments
    SET payment_status = 'PAID',
        wallet_tx_id   = v_wallet_tx_id,
        paid_at        = NOW()
    WHERE id = v_payment.id;

    -- ── Transition application → PAID ─────────────────────────────────────────
    UPDATE job_applications SET status = 'PAID', updated_at = NOW()
    WHERE id = p_application_id;

    -- ── Auto-close job if all slots filled and released ───────────────────────
    IF (SELECT filled_slots >= total_slots FROM jobs WHERE id = v_app.job_id) THEN
        UPDATE jobs SET status = 'COMPLETED', completed_at = NOW() WHERE id = v_app.job_id;
        UPDATE job_funding SET status = 'DEPLETED', closed_at = NOW() WHERE job_id = v_app.job_id;
    END IF;

    RETURN jsonb_build_object(
        'success',       TRUE,
        'amount',        v_job.payout_amount,
        'wallet_tx_id',  v_wallet_tx_id,
        'worker_id',     v_app.worker_id
    );
END;
$$;


-- ============================================================
-- 9. AUTO RELEASE APPROVED (for cron / edge function)
-- Releases all APPROVED applications that have waited > p_min_age_hours.
-- Prevents employers from holding funds indefinitely.
-- Call from pg_cron or a Supabase Edge Function on a schedule.
-- ============================================================

CREATE OR REPLACE FUNCTION auto_release_approved(p_min_age_hours INTEGER DEFAULT 24)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_app_id  UUID;
    v_ok      INTEGER := 0;
    v_failed  INTEGER := 0;
    v_errors  JSONB   := '[]'::jsonb;
BEGIN
    FOR v_app_id IN
        SELECT ja.id
        FROM job_applications ja
        WHERE ja.status = 'APPROVED'
          AND ja.updated_at < NOW() - (p_min_age_hours || ' hours')::INTERVAL
          -- Confirm payment not already released
          AND NOT EXISTS (
              SELECT 1 FROM job_funding_ledger l
              WHERE l.application_id = ja.id AND l.tx_type = 'RELEASE'
          )
        ORDER BY ja.updated_at ASC
        LIMIT 100
    LOOP
        BEGIN
            PERFORM release_payment(v_app_id);
            v_ok := v_ok + 1;
        EXCEPTION WHEN OTHERS THEN
            v_failed := v_failed + 1;
            v_errors := v_errors || jsonb_build_array(
                jsonb_build_object('application_id', v_app_id, 'error', SQLERRM)
            );
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'released', v_ok,
        'failed',   v_failed,
        'errors',   v_errors
    );
END;
$$;


-- ============================================================
-- 10. CANCEL JOB AND REFUND
-- Cancels ACTIVE/PAUSED job. Refunds available_amount to poster.
-- Reserved slots (pending payment) are NOT refunded here —
-- they settle when each APPROVED application resolves.
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_job_and_refund(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_poster_id     UUID;
    v_job           jobs%ROWTYPE;
    v_funding       job_funding%ROWTYPE;
    v_live_avail    NUMERIC;
    v_poster_wallet wallet%ROWTYPE;
    v_wallet_tx_id  UUID;
BEGIN
    v_poster_id := auth.uid();
    IF v_poster_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = p_job_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;

    IF v_job.user_id != v_poster_id THEN RAISE EXCEPTION 'You do not own this job'; END IF;

    IF v_job.status NOT IN ('ACTIVE', 'PAUSED') THEN
        RAISE EXCEPTION 'Only ACTIVE or PAUSED jobs can be cancelled (current: %)', v_job.status;
    END IF;

    SELECT * INTO v_funding FROM job_funding WHERE job_id = p_job_id FOR UPDATE;

    -- Recompute from ledger (authoritative)
    v_live_avail := fn_ledger_available(p_job_id);

    IF v_live_avail <= 0 THEN
        -- Nothing to refund — all slots taken
        UPDATE jobs SET status = 'CANCELLED', completed_at = NOW() WHERE id = p_job_id;
        UPDATE job_funding SET status = 'DEPLETED', closed_at = NOW() WHERE job_id = p_job_id;
        RETURN jsonb_build_object(
            'success', TRUE,
            'refund',  0,
            'message', 'Job cancelled. All funds already committed to workers.'
        );
    END IF;

    SELECT * INTO v_poster_wallet FROM wallet WHERE user_id = v_poster_id FOR UPDATE;

    -- ── Refund available escrow to poster ─────────────────────────────────────
    INSERT INTO wallet_transactions (
        wallet_id, type, amount,
        balance_before, balance_after,
        source, note
    ) VALUES (
        v_poster_wallet.id, 'CREDIT', v_live_avail,
        v_poster_wallet.balance, v_poster_wallet.balance + v_live_avail,
        'JOB_REFUND',
        format('Refund from cancelled job "%s" — ₦%s returned', v_job.title, v_live_avail)
    ) RETURNING id INTO v_wallet_tx_id;

    UPDATE wallet SET balance = balance + v_live_avail WHERE id = v_poster_wallet.id;

    -- ── Write REFUND ledger entry ─────────────────────────────────────────────
    INSERT INTO job_funding_ledger (
        job_id, tx_type, amount,
        balance_after_available, balance_after_reserved, balance_after_released,
        note
    ) VALUES (
        p_job_id, 'REFUND', v_live_avail,
        0,
        v_funding.reserved_amount,
        v_funding.released_amount,
        format('Job cancelled. ₦%s refunded. Wallet tx: %s', v_live_avail, v_wallet_tx_id)
    );

    UPDATE jobs SET status = 'CANCELLED', completed_at = NOW() WHERE id = p_job_id;
    UPDATE job_funding SET status = 'REFUNDED', closed_at = NOW() WHERE job_id = p_job_id;

    RETURN jsonb_build_object(
        'success',        TRUE,
        'refund_amount',  v_live_avail,
        'wallet_tx_id',   v_wallet_tx_id,
        'reserved_still', v_funding.reserved_amount
    );
END;
$$;


-- ============================================================
-- 11. PAUSE / RESUME JOB
-- ============================================================

CREATE OR REPLACE FUNCTION pause_job(p_job_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_poster_id UUID; v_job jobs%ROWTYPE;
BEGIN
    v_poster_id := auth.uid();
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    IF v_job.user_id != v_poster_id THEN RAISE EXCEPTION 'Not your job'; END IF;
    IF v_job.status != 'ACTIVE' THEN RAISE EXCEPTION 'Job must be ACTIVE to pause'; END IF;
    UPDATE jobs SET status = 'PAUSED' WHERE id = p_job_id;
    RETURN jsonb_build_object('success', TRUE, 'status', 'PAUSED');
END; $$;

CREATE OR REPLACE FUNCTION resume_job(p_job_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_poster_id UUID; v_job jobs%ROWTYPE;
BEGIN
    v_poster_id := auth.uid();
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    IF v_job.user_id != v_poster_id THEN RAISE EXCEPTION 'Not your job'; END IF;
    IF v_job.status != 'PAUSED' THEN RAISE EXCEPTION 'Job must be PAUSED to resume'; END IF;
    UPDATE jobs SET status = 'ACTIVE' WHERE id = p_job_id;
    RETURN jsonb_build_object('success', TRUE, 'status', 'ACTIVE');
END; $$;


-- ============================================================
-- 12. GET JOB SUBMISSIONS (for employer verification dashboard)
-- Returns all SUBMITTED applications for a job with full proof
-- data, flags, and funding snapshot. Single query for the page.
-- ============================================================

CREATE OR REPLACE FUNCTION get_job_submissions(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_employer_id UUID;
    v_job         jobs%ROWTYPE;
    v_result      JSONB;
BEGIN
    v_employer_id := auth.uid();
    IF v_employer_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

    SELECT * INTO v_job FROM jobs WHERE id = p_job_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Job not found'; END IF;
    IF v_job.user_id != v_employer_id THEN RAISE EXCEPTION 'Access denied'; END IF;

    SELECT jsonb_build_object(
        'job', row_to_json(v_job),

        'funding', (
            SELECT row_to_json(jf)
            FROM job_funding jf WHERE job_id = p_job_id
        ),

        'funding_live', (
            SELECT jsonb_build_object(
                'available_live', fn_ledger_available(p_job_id),
                'reserved_live',  COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RESERVE'),   0)
                                - COALESCE(SUM(amount) FILTER (WHERE tx_type = 'UNRESERVE'), 0),
                'released_live',  COALESCE(SUM(amount) FILTER (WHERE tx_type = 'RELEASE'),   0)
            )
            FROM job_funding_ledger WHERE job_id = p_job_id
        ),

        'submissions', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'application',    row_to_json(ja),
                    'worker_profile', row_to_json(up),
                    'proof',          row_to_json(jp),
                    'proof_items',    (
                        SELECT jsonb_agg(row_to_json(pi) ORDER BY pi.display_order)
                        FROM job_proof_items pi WHERE pi.proof_id = jp.id
                    ),
                    'flags',          (
                        SELECT jsonb_agg(row_to_json(pf))
                        FROM job_proof_flags pf WHERE pf.proof_id = jp.id AND NOT pf.resolved
                    ),
                    'verification',   row_to_json(jv),
                    'payment',        row_to_json(jpm)
                )
                ORDER BY ja.updated_at DESC
            )
            FROM job_applications ja
            LEFT JOIN user_profiles   up  ON up.user_id         = ja.worker_id
            LEFT JOIN job_proofs      jp  ON jp.application_id  = ja.id
            LEFT JOIN job_verifications jv ON jv.application_id = ja.id
            LEFT JOIN job_payments    jpm ON jpm.application_id = ja.id
            WHERE ja.job_id = p_job_id
              AND ja.status IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'PAID')
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;



