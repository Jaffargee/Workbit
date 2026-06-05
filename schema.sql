-- 1. USER PROFILE =======================================================
create table public.user_profiles (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      first_name text not null,
      last_name text not null,
      state public.nigerian_state_enum null,
      gender public.gender_enum null,
      date_of_birth date null,
      metadata jsonb null,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      is_subscribed boolean not null default true,
      constraint user_profiles_pkey primary key (id),
      constraint user_profiles_user_id_key unique (user_id),
      constraint user_profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- 2. USER CONTACTS =======================================================
create table public.user_contacts (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      phone text not null,
      created_at timestamp with time zone not null default now(),
      email text null,
      constraint user_contacts_pkey primary key (id),
      constraint user_contacts_email_key unique (email),
      constraint user_contacts_phone_key unique (phone),
      constraint user_contacts_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- 3. USER REFERRAL =======================================================
create table public.user_referrals (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      ref_code text not null,
      referred_by uuid null,
      created_at timestamp with time zone not null default now(),
      constraint user_referrals_pkey primary key (id),
      constraint user_referrals_ref_code_key unique (ref_code),
      constraint user_referrals_user_id_key unique (user_id),
      constraint user_referrals_referred_by_fkey foreign KEY (referred_by) references user_profiles (user_id),
      constraint user_referrals_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- 4. USER REFERRAL REWARDS =======================================================
create table public.referral_rewards (
      id uuid not null default extensions.uuid_generate_v4 (),
      referrer_id uuid not null,
      referred_user_id uuid not null,
      reward_amount numeric(12, 2) not null,
      status public.referral_reward_status_enum not null default 'PENDING'::referral_reward_status_enum,
      credited_at timestamp with time zone null,
      created_at timestamp with time zone not null default now(),
      constraint referral_rewards_pkey primary key (id),
      constraint referral_rewards_referred_user_id_key unique (referred_user_id),
      constraint referral_rewards_referred_user_id_fkey foreign KEY (referred_user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
      constraint referral_rewards_referrer_id_fkey foreign KEY (referrer_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
      constraint referral_rewards_reward_amount_check check ((reward_amount > (0)::numeric))
) TABLESPACE pg_default;

-- 5. USER BANK ACCOUNTS =======================================================
create table public.user_bank_accounts (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      bank_name text not null,
      account_number text not null,
      account_name text not null,
      is_verified boolean not null default false,
      is_default boolean not null default false,
      created_at timestamp with time zone not null default now(),
      constraint user_bank_accounts_pkey primary key (id),
      constraint user_bank_accounts_user_id_fkey1 foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
      constraint uq_user_default_bank EXCLUDE using btree (user_id with =, is_default with = )
      where ((is_default = true))
) TABLESPACE pg_default;

-- 6. WALLET =======================================================
create table public.wallet (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      balance numeric(12, 2) not null default 0,
      currency text not null default 'NGN'::text,
      is_frozen boolean not null default false,
      created_at timestamp with time zone not null default now(),
      constraint wallets_pkey primary key (id),
      constraint wallets_user_id_key unique (user_id),
      constraint wallets_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
      constraint check_positive_balance check ((balance >= (0)::numeric)),
      constraint wallets_balance_check check ((balance >= (0)::numeric))
) TABLESPACE pg_default;

-- 7. WALLET TRANSACTION =======================================================
create table public.wallet_transactions (
      id uuid not null default extensions.uuid_generate_v4 (),
      wallet_id uuid not null,
      type public.wallet_tx_type_enum not null,
      amount numeric(12, 2) not null,
      balance_before numeric(12, 2) not null,
      balance_after numeric(12, 2) not null,
      source public.wallet_tx_source_enum not null,
      reference text null,
      note text null,
      created_at timestamp with time zone not null default now(),
      constraint wallet_transactions_pkey primary key (id),
      constraint wallet_transactions_wallet_id_fkey foreign KEY (wallet_id) references wallet (id),
      constraint wallet_transactions_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;
create index IF not exists idx_wallet_txns on public.wallet_transactions using btree (wallet_id, created_at desc) TABLESPACE pg_default;

-- 8. WALLET DEPOSITS =======================================================
create table public.wallet_deposits (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      wallet_id uuid not null,
      wallet_tx_id uuid null,
      status public.deposit_status_enum not null default 'PENDING'::deposit_status_enum,
      flw_status text not null,
      amount numeric(12, 2) not null,
      currency text not null default 'NGN'::text,
      transaction_id bigint not null,
      tx_ref text not null,
      flw_ref text not null,
      payment_type public.payment_type not null,
      flw_created_at timestamp with time zone not null,
      initiated_at timestamp with time zone not null default now(),
      confirmed_at timestamp with time zone null,
      constraint wallet_deposits_pkey primary key (id),
      constraint wallet_deposits_tx_ref_key unique (tx_ref),
      constraint wallet_deposits_flw_ref_key unique (flw_ref),
      constraint wallet_deposits_transaction_id_key unique (transaction_id),
      constraint wallet_deposits_wallet_tx_id_fkey foreign KEY (wallet_tx_id) references wallet_transactions (id),
      constraint wallet_deposits_user_id_fkey foreign KEY (user_id) references user_profiles (user_id),
      constraint wallet_deposits_wallet_id_fkey foreign KEY (wallet_id) references wallet (id),
      constraint wallet_deposits_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;
create index IF not exists idx_deposits_user on public.wallet_deposits using btree (user_id, initiated_at desc) TABLESPACE pg_default;
create index IF not exists idx_deposits_reference on public.wallet_deposits using btree (tx_ref) TABLESPACE pg_default;

-- 9. WALLET WITHDRAWAL REQUEST =======================================================
create table public.withdrawal_requests (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      bank_account_id uuid not null,
      wallet_tx_id uuid null,
      amount numeric(12, 2) not null,
      status public.withdrawal_status_enum not null default 'PENDING'::withdrawal_status_enum,
      payment_reference text null,
      requested_at timestamp with time zone not null default now(),
      processed_at timestamp with time zone null,
      constraint withdrawal_requests_pkey primary key (id),
      constraint withdrawal_requests_bank_account_id_fkey foreign KEY (bank_account_id) references user_bank_accounts (id),
      constraint withdrawal_requests_wallet_tx_id_fkey foreign KEY (wallet_tx_id) references wallet_transactions (id),
      constraint withdrawal_requests_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;

-- 10. PLATFORMS =======================================================
create table public.platforms (
      id uuid not null default extensions.uuid_generate_v4 (),
      name text not null,
      owner text not null,
      domain text not null,
      base_url text not null,
      logo_url text null,
      is_active boolean not null default true,
      created_at timestamp with time zone not null default now(),
      constraint platforms_pkey primary key (id),
      constraint platforms_domain_key unique (domain)
) TABLESPACE pg_default;

-- ==========================================================================
-- ==========================================================================
-- ==========================================================================
-- ===================== JOBS RELATIVE TABLES ENTITIES ======================
-- ==========================================================================
-- ==========================================================================
-- ==========================================================================
-- 11. JOBS =======================================================
create table public.jobs (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      platform_id uuid not null,
      job_type public.job_type_enum not null,
      status public.job_status_enum not null default 'DRAFT'::job_status_enum,
      target_url text not null,
      payout_amount numeric(12, 2) not null,
      payout_currency text not null default 'NGN'::text,
      auto_approve boolean not null default false,
      requires_screenshot boolean not null default true,
      requires_before_proof boolean not null default false,
      proof_instructions text null,
      title text not null,
      description text not null,
      views_count integer not null default 0,
      total_slots integer not null,
      filled_slots integer not null default 0,
      applications_count integer not null default 0,
      posted_at timestamp with time zone null,
      completed_at timestamp with time zone null,
      expires_at timestamp with time zone null,
      created_at timestamp with time zone not null default now(),
      constraint jobs_pkey primary key (id),
      constraint jobs_platform_id_fkey foreign KEY (platform_id) references platforms (id) on update CASCADE on delete CASCADE,
      constraint jobs_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE,
      constraint chk_filled_slots check ((filled_slots <= total_slots)),
      constraint jobs_payout_amount_check check ((payout_amount > (0)::numeric)),
      constraint jobs_total_slots_check check ((total_slots > 0))
) TABLESPACE pg_default;
create index IF not exists idx_jobs_status on public.jobs using btree (status) TABLESPACE pg_default;
create index IF not exists idx_jobs_platform on public.jobs using btree (platform_id) TABLESPACE pg_default;
create index IF not exists idx_jobs_user on public.jobs using btree (user_id) TABLESPACE pg_default;
create index IF not exists idx_jobs_expires on public.jobs using btree (expires_at) TABLESPACE pg_default
where (status = 'FUNDED'::job_status_enum);

-- 12. JOB FUNDING =======================================================
create table public.job_funding (
      id uuid not null default extensions.uuid_generate_v4 (),
      job_id uuid not null,
      funded_amount numeric(12, 2) not null,
      reserved_amount numeric(12, 2) not null default 0,
      released_amount numeric(12, 2) not null default 0,
      refunded_amount numeric(12, 2) not null default 0,
      available_amount numeric(12, 2) not null default 0,
      status public.funding_status_enum not null default 'FUNDED'::funding_status_enum,
      funded_at timestamp with time zone not null default now(),
      closed_at timestamp with time zone null,
      constraint job_funding_pkey primary key (id),
      constraint job_funding_job_id_key unique (job_id),
      constraint job_funding_job_id_fkey foreign KEY (job_id) references jobs (id) on update CASCADE on delete CASCADE,
      constraint job_funding_refunded_amount_check check ((refunded_amount >= (0)::numeric)),
      constraint job_funding_released_amount_check check ((released_amount >= (0)::numeric)),
      constraint chk_funding_totals check (((((reserved_amount + released_amount) + refunded_amount) + available_amount) = funded_amount)),
      constraint job_funding_reserved_amount_check check ((reserved_amount >= (0)::numeric)),
      constraint job_funding_available_amount_check check ((available_amount >= (0)::numeric)),
      constraint job_funding_funded_amount_check check ((funded_amount > (0)::numeric))
) TABLESPACE pg_default;

-- 13. JOB FUNDING LEDGER =======================================================
create table public.job_funding_ledger (
      id uuid not null default extensions.uuid_generate_v4 (),
      job_id uuid not null,
      application_id uuid null,
      tx_type public.funding_tx_type not null,
      amount numeric(12, 2) not null,
      balance_after_available numeric(12, 2) not null,
      balance_after_reserved numeric(12, 2) not null,
      balance_after_released numeric(12, 2) not null,
      note text null,
      created_at timestamp with time zone not null default now(),
      constraint job_funding_ledger_pkey primary key (id),
      constraint job_funding_ledger_application_id_fkey foreign KEY (application_id) references job_applications (id) on update CASCADE on delete CASCADE,
      constraint job_funding_ledger_job_id_fkey foreign KEY (job_id) references jobs (id) on update CASCADE on delete CASCADE,
      constraint chk_ledger_amounts check (
      (
            (balance_after_available >= (0)::numeric)
            and (balance_after_reserved >= (0)::numeric)
            and (balance_after_released >= (0)::numeric)
      )
      ),
      constraint job_funding_ledger_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;
create index IF not exists idx_ledger_job on public.job_funding_ledger using btree (job_id, created_at desc) TABLESPACE pg_default;
create index IF not exists idx_ledger_application on public.job_funding_ledger using btree (application_id) TABLESPACE pg_default
where (application_id is not null);

-- 14. JOB APPLICATION =======================================================
create table public.job_applications (
      id uuid not null default extensions.uuid_generate_v4 (),
      job_id uuid not null,
      worker_id uuid not null,
      status public.application_status_enum not null default 'APPLIED'::application_status_enum,
      applied_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      constraint job_applications_pkey primary key (id),
      constraint uq_job_worker unique (job_id, worker_id),
      constraint job_applications_job_id_fkey foreign KEY (job_id) references jobs (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
create index IF not exists idx_applications_job on public.job_applications using btree (job_id) TABLESPACE pg_default;
create index IF not exists idx_applications_worker on public.job_applications using btree (worker_id) TABLESPACE pg_default;
create index IF not exists idx_applications_status on public.job_applications using btree (status) TABLESPACE pg_default;

-- 15. JOB PROOF OF COMPLETION =======================================================
create table public.job_proofs (
      id uuid not null default extensions.uuid_generate_v4 (),
      application_id uuid not null,
      worker_social_url text not null,
      instructions_seen boolean not null default false,
      is_late boolean not null default false,
      submission_gap_secs integer null,
      submitted_at timestamp with time zone not null default now(),
      constraint job_proofs_pkey primary key (id),
      constraint job_proofs_application_id_key unique (application_id),
      constraint job_proofs_application_id_fkey foreign KEY (application_id) references job_applications (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
create index IF not exists idx_proofs_social_url on public.job_proofs using btree (worker_social_url) TABLESPACE pg_default;

-- 16. JOB PROOF ITEMS OF COMPLETION =======================================================
create table public.job_proof_items (
      id uuid not null default extensions.uuid_generate_v4 (),
      proof_id uuid not null,
      proof_type public.proof_type_enum not null,
      value text not null,
      is_before boolean not null default false,
      display_order integer not null default 0,
      captured_at timestamp with time zone null,
      created_at timestamp with time zone not null default now(),
      constraint job_proof_items_pkey primary key (id),
      constraint job_proof_items_proof_id_fkey foreign KEY (proof_id) references job_proofs (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
create index IF not exists idx_proof_items_proof on public.job_proof_items using btree (proof_id) TABLESPACE pg_default;

-- 17. JOB PROOF FLAGS =======================================================
create table public.job_proof_flags (
      id uuid not null default extensions.uuid_generate_v4 (),
      proof_id uuid not null,
      flag_type public.flag_type_enum not null,
      severity public.flag_severity_enum not null,
      detail text null,
      flagged_at timestamp with time zone not null default now(),
      resolved boolean not null default false,
      resolved_at timestamp with time zone null,
      resolved_by uuid null,
      constraint job_proof_flags_pkey primary key (id),
      constraint job_proof_flags_proof_id_fkey foreign KEY (proof_id) references job_proofs (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
create index IF not exists idx_flags_proof on public.job_proof_flags using btree (proof_id) TABLESPACE pg_default;
create index IF not exists idx_flags_severity on public.job_proof_flags using btree (severity) TABLESPACE pg_default
where (resolved = false);

-- 18. JOB DISPUTE =======================================================
create table public.job_disputes (
      id uuid not null default extensions.uuid_generate_v4 (),
      application_id uuid not null,
      raised_by uuid not null,
      reason text not null,
      status public.dispute_status_enum not null default 'OPEN'::dispute_status_enum,
      resolution_notes text null,
      created_at timestamp with time zone not null default now(),
      resolved_at timestamp with time zone null,
      constraint job_disputes_pkey primary key (id),
      constraint job_disputes_application_id_fkey foreign KEY (application_id) references job_applications (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- 19. JOB VERIFICATION =======================================================
create table public.job_verifications (
      id uuid not null default extensions.uuid_generate_v4 (),
      application_id uuid not null,
      verified_by uuid null,
      recheck_status public.recheck_status_enum not null default 'INACTIVE'::recheck_status_enum,
      is_verified boolean not null,
      rejection_reason text null,
      verified_at timestamp with time zone not null default now(),
      last_recheck_at timestamp with time zone null,
      constraint job_verifications_pkey primary key (id),
      constraint job_verifications_application_id_key unique (application_id),
      constraint job_verifications_application_id_fkey foreign KEY (application_id) references job_applications (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;
create index IF not exists idx_verifications_recheck on public.job_verifications using btree (recheck_status) TABLESPACE pg_default
where (recheck_status = 'ACTIVE'::recheck_status_enum);

-- 20. JOB PAYMENTS =======================================================
create table public.job_payments (
      id uuid not null default extensions.uuid_generate_v4 (),
      application_id uuid not null,
      wallet_tx_id uuid null,
      amount numeric(12, 2) not null,
      currency text not null default 'NGN'::text,
      payment_status public.payment_status_enum not null default 'PENDING'::payment_status_enum,
      payment_reference text null,
      paid_at timestamp with time zone null,
      created_at timestamp with time zone not null default now(),
      constraint job_payments_pkey primary key (id),
      constraint job_payments_application_id_key unique (application_id),
      constraint job_payments_application_id_fkey foreign KEY (application_id) references job_applications (id) on update CASCADE on delete CASCADE,
      constraint job_payments_wallet_tx_id_fkey foreign KEY (wallet_tx_id) references wallet_transactions (id) on update CASCADE on delete CASCADE,
      constraint job_payments_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;

-- 21. NOTIFICATION =======================================================
create table public.notifications (
      id uuid not null default extensions.uuid_generate_v4 (),
      user_id uuid not null,
      type public.notification_type_enum not null,
      title text not null,
      body text not null,
      entity_type text null,
      entity_id uuid null,
      is_read boolean not null default false,
      created_at timestamp with time zone not null default now(),
      constraint notifications_pkey primary key (id),
      constraint notifications_user_id_fkey foreign KEY (user_id) references user_profiles (user_id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user on public.notifications using btree (user_id, created_at desc) TABLESPACE pg_default
where (is_read = false);













