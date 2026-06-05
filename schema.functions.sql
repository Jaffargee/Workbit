-- TRIGGER - USER PROFILE updated_at TIMESTAMP
create trigger trg_user_profiles_updated_at BEFORE
update on user_profiles for EACH row
execute FUNCTION fn_set_updated_at ();

-- TRIGGER - JOB APPLICATION updated_at TIMESTAMP
create trigger trg_job_applications_updated_at BEFORE
update on job_applications for EACH row
execute FUNCTION fn_set_updated_at ();

-- TRIGGER - FILLED SLOTS UPDATE ON JOB APPLICATION ENTRY
create trigger trg_update_filled_slots
after update on job_applications for EACH row
execute FUNCTION fn_update_filled_slots ();

-- TRIGGER - AUTO FLAG PROOF ON INSERT
create trigger trg_auto_flag_proof
after INSERT on job_proofs for EACH row
execute FUNCTION fn_auto_flag_proof ();

-- TRIGGER - COMPUTE PROOF GAP ON INSERT
create trigger trg_compute_proof_gap BEFORE INSERT on job_proofs for EACH row
execute FUNCTION fn_compute_proof_gap ();

-- TRIGGER - FUNDING LEDGER FOR CACHE FAST ACCESS
create trigger trg_sync_funding_cache
after INSERT on job_funding_ledger for EACH row
execute FUNCTION fn_sync_funding_cache ();

-- TRIGGER - JOB PAYMENT CREDIT WALLET ON PAYMENT
create trigger trg_credit_wallet_on_payment BEFORE
update on job_payments for EACH row
execute FUNCTION fn_credit_wallet_on_payment ();




CREATE OR REPLACE FUNCTION insert_user_profile(
    p_first_name     TEXT,
    p_last_name      TEXT,
    p_email          TEXT,
    p_phone          TEXT,
    p_gender         gender_enum,
    p_dob            DATE,
    p_state          nigerian_state_enum,
    p_user_type      TEXT,               -- stored in profile metadata
    p_bank_name      TEXT,
    p_account_number TEXT,
    p_account_name   TEXT,
    metadata         JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id   UUID;
    v_email     TEXT;
    v_profile   user_profiles%ROWTYPE;
    v_bank      user_bank_accounts%ROWTYPE;
BEGIN
      -- Resolve calling user
      v_user_id := auth.uid();
      v_email := auth.email();
      
      IF v_user_id IS NULL THEN
            RAISE EXCEPTION 'Not authenticated';
      END IF;
      
      -- Check if profile already exists
      IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = v_user_id) THEN
            RAISE EXCEPTION 'Profile already exists for this user';
      END IF;

      -- Insert profile
      INSERT INTO user_profiles (
            user_id, first_name, last_name,
            gender, state, date_of_birth, metadata
      ) VALUES (
            v_user_id, p_first_name, p_last_name,
            p_gender, p_state, p_dob,
            jsonb_build_object('user_type', p_user_type)
      )
      RETURNING * INTO v_profile;
      
      -- Insert phone contact
      INSERT INTO user_contacts (user_id, phone, email)
      VALUES (v_user_id, p_phone, v_email)
      ON CONFLICT DO NOTHING;
      
      -- Insert bank account (default = true, first account)
      INSERT INTO user_bank_accounts (
            user_id, bank_name, account_number,
            account_name, is_verified, is_default
      ) VALUES (
            v_user_id, p_bank_name, p_account_number,
            p_account_name, FALSE, TRUE
      )
      RETURNING * INTO v_bank;
      
      -- Ensure wallet exists (trigger should have created it, but be safe)
      INSERT INTO wallet (user_id)
      VALUES (v_user_id)
      ON CONFLICT (user_id) DO NOTHING;
      
      RETURN jsonb_build_object(
            'success',  TRUE,
            'profile',  row_to_json(v_profile),
            'bank',     row_to_json(v_bank)
      );
 
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;



-- JOB FUNDING LIVE VIEW - REAL TIME CALCULATION
create view public.v_job_funding_live
with
  (security_invoker = on) as
select
  jf.job_id,
  jf.funded_amount,
  COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'RESERVE'::funding_tx_type
    ),
    0::numeric
  ) as reserved_live,
  COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'RELEASE'::funding_tx_type
    ),
    0::numeric
  ) as released_live,
  COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'REFUND'::funding_tx_type
    ),
    0::numeric
  ) as refunded_live,
  COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'UNRESERVE'::funding_tx_type
    ),
    0::numeric
  ) as unreserved_live,
  jf.funded_amount - COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'RELEASE'::funding_tx_type
    ),
    0::numeric
  ) - COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'REFUND'::funding_tx_type
    ),
    0::numeric
  ) - COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'RESERVE'::funding_tx_type
    ),
    0::numeric
  ) + COALESCE(
    sum(l.amount) filter (
      where
        l.tx_type = 'UNRESERVE'::funding_tx_type
    ),
    0::numeric
  ) as available_live,
  jf.reserved_amount as cached_reserved,
  jf.released_amount as cached_released,
  jf.available_amount as cached_available,
  jf.available_amount <> (
    jf.funded_amount - COALESCE(
      sum(l.amount) filter (
        where
          l.tx_type = 'RELEASE'::funding_tx_type
      ),
      0::numeric
    ) - COALESCE(
      sum(l.amount) filter (
        where
          l.tx_type = 'REFUND'::funding_tx_type
      ),
      0::numeric
    ) - COALESCE(
      sum(l.amount) filter (
        where
          l.tx_type = 'RESERVE'::funding_tx_type
      ),
      0::numeric
    ) + COALESCE(
      sum(l.amount) filter (
        where
          l.tx_type = 'UNRESERVE'::funding_tx_type
      ),
      0::numeric
    )
  ) as cache_drifted
from
  job_funding jf
  left join job_funding_ledger l on l.job_id = jf.job_id
group by
  jf.job_id,
  jf.funded_amount,
  jf.reserved_amount,
  jf.released_amount,
  jf.available_amount,
  jf.refunded_amount;


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


- Credit wallet atomically when a JobPayment is approved
CREATE OR REPLACE FUNCTION fn_credit_wallet_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
      v_worker_id UUID;
      v_wallet    wallet%ROWTYPE;
      v_tx_id     UUID;
BEGIN
      -- Only act when status transitions to PAID
      IF NEW.payment_status = 'PAID' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'PAID') THEN

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
      AFTER INSERT ON user_profiles
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






CREATE OR REPLACE FUNCTION apply_and_start_job(
    p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_worker_id     UUID;
    v_job           jobs%ROWTYPE;
    v_app           job_applications%ROWTYPE;
    v_job_funding   job_funding%ROWTYPE;
BEGIN
    -- 1. Authentication Check
    v_worker_id := auth.uid();
    IF v_worker_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
 
    -- 2. Lock Rows for Update (Always do this in a deterministic sequence!)
    SELECT * INTO v_job FROM jobs WHERE id = p_job_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    SELECT * INTO v_job_funding FROM job_funding WHERE job_id = p_job_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Funding details not found for this job';
    END IF;
 
    -- 3. Business Rule Validations
    IF v_job.status != 'FUNDED' THEN
        RAISE EXCEPTION 'Job is not currently active';
    END IF;
 
    IF v_job.filled_slots >= v_job.total_slots THEN
        RAISE EXCEPTION 'All slots are filled for this job';
    END IF;
 
    IF EXISTS (
        SELECT 1 FROM job_applications
        WHERE job_id = p_job_id AND worker_id = v_worker_id
    ) THEN
        RAISE EXCEPTION 'You have already applied for this job';
    END IF;

    -- 4. Financial Sufficiency Guard
    -- We check 'available_amount' because funded_amount is immutable!
    IF v_job_funding.available_amount < v_job.payout_amount THEN
        RAISE EXCEPTION 'Insufficient funds available in this job budget. Required: %, Available: %', 
            v_job.payout_amount, v_job_funding.available_amount;
    END IF;
 
    -- 5. Create Application at WORKING status
    INSERT INTO job_applications (job_id, worker_id, status)
    VALUES (p_job_id, v_worker_id, 'WORKING')
    RETURNING * INTO v_app;

    -- 6. Write to the Append-Only Audit Ledger
    -- Note: We do NOT run an UPDATE statement on job_funding anymore.
    -- Your ledger trigger will catch this insert and safely adjust job_funding.
    INSERT INTO job_funding_ledger (
        job_id, 
        application_id, 
        tx_type, 
        amount,
        balance_after_available, 
        balance_after_reserved, 
        balance_after_released, 
        note
    ) VALUES (
        p_job_id, 
        v_app.id, 
        'RESERVE', 
        v_job.payout_amount,
        v_job_funding.available_amount - v_job.payout_amount,  -- new available
        v_job_funding.reserved_amount + v_job.payout_amount,   -- new reserved
        v_job_funding.released_amount,                         -- un-changed
        'Automated hold for worker assignment.'
    );
 
    -- 7. Increment Counter Cache on Jobs
    UPDATE jobs
    SET applications_count = applications_count + 1
    WHERE id = p_job_id;
 
    -- 8. Return Response
    RETURN jsonb_build_object(
        'success',        TRUE,
        'application_id', v_app.id,
        'status',         v_app.status,
        'expires_at',     v_job.expires_at
    );
 
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;

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

ALTER TABLE wallet ADD CONSTRAINT check_positive_balance CHECK (balance >= 0);


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




























