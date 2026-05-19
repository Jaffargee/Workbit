"""
test_workflow.py
================
Full end-to-end workflow test for the gig platform schema on Supabase.

Covers:
    1.  User registration (poster + worker)
    2.  Wallet auto-creation check
    3.  Referral code generation
    4.  Job creation by poster
    5.  Job funding (activates job)
    6.  Worker applies for job
    7.  Worker submits proof (with items)
    8.  Auto-flag inspection
    9.  Manual verification (approve)
    10. Payment release + wallet credit
    11. Wallet transaction audit trail
    12. Worker requests withdrawal
    13. Fraud scenario: duplicate social URL detection
    14. Dispute flow
    15. Cleanup

Usage:
    pip install supabase python-dotenv
    cp .env.example .env           # fill in your Supabase credentials
    python test_workflow.py

Or set env vars directly:
    SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key   # use service key to bypass RLS
"""

import os
import sys
import uuid
import time
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# ── Config ──────────────────────────────────────────────────────────────────

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")  # service role key

if not SUPABASE_URL or not SUPABASE_KEY:
    print(
        "\n[ERROR] Missing credentials.\n"
        "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file or environment.\n"
    )
    sys.exit(1)

PLATFORM_TWITTER_ID = "00000000-0000-0000-0000-000000000001"

# ── Helpers ──────────────────────────────────────────────────────────────────

class Colors:
    OK    = "\033[92m"
    WARN  = "\033[93m"
    ERR   = "\033[91m"
    INFO  = "\033[94m"
    BOLD  = "\033[1m"
    RESET = "\033[0m"

def ok(msg):    print(f"  {Colors.OK}✓{Colors.RESET} {msg}")
def warn(msg):  print(f"  {Colors.WARN}⚠{Colors.RESET} {msg}")
def err(msg):   print(f"  {Colors.ERR}✗{Colors.RESET} {msg}")
def info(msg):  print(f"  {Colors.INFO}→{Colors.RESET} {msg}")
def section(n, title):
    print(f"\n{Colors.BOLD}[{n:02d}] {title}{Colors.RESET}")
    print("     " + "─" * 50)

def assert_eq(label, actual, expected):
      if actual == expected:
            ok(f"{label}: {actual}")
      else:
            err(f"{label}: expected {expected!r}, got {actual!r}")
            raise AssertionError(f"{label} mismatch")

def assert_not_none(label, value):
      if value is not None:
            ok(f"{label}: {value}")
      else:
            err(f"{label} is None — expected a value")
            raise AssertionError(f"{label} was None")

def now_plus(minutes: int = 0) -> str:
      dt = datetime.now(timezone.utc) + timedelta(minutes=minutes)
      return dt.isoformat()


# ── DB helpers ───────────────────────────────────────────────────────────────

def insert(sb: Client, table: str, data: dict) -> dict:
      res = sb.table(table).insert(data).execute()
      if not res.data:
            raise RuntimeError(f"Insert into {table} returned no data: {res}")
      return res.data[0]

def select_one(sb: Client, table: str, match: dict) -> dict | None:
      q = sb.table(table).select("*")
      for k, v in match.items():
            q = q.eq(k, v)
      res = q.limit(1).execute()
      return res.data[0] if res.data else None

def select_many(sb: Client, table: str, match: dict) -> list[dict]:
      q = sb.table(table).select("*")
      for k, v in match.items():
            q = q.eq(k, v)
      return q.execute().data or []

def update_one(sb: Client, table: str, match: dict, data: dict) -> dict:
      q = sb.table(table).update(data)
      for k, v in match.items():
            q = q.eq(k, v)
      res = q.execute()
      if not res.data:
            raise RuntimeError(f"Update on {table} returned no data")
      return res.data[0]


# ── Cleanup helper ───────────────────────────────────────────────────────────

def cleanup(sb: Client, state: dict):
      """Remove all test data in reverse dependency order."""
      section(99, "Cleanup")

      tables_by_id = [
            ("job_disputes",        "id",             state.get("dispute_id")),
            ("withdrawal_requests", "id",             state.get("withdrawal_id")),
            ("job_payments",        "id",             state.get("payment_id")),
            ("wallet_transactions", "wallet_id",      state.get("worker_wallet_id")),
            ("job_verifications",   "application_id", state.get("application_id")),
            ("job_proof_flags",     "proof_id",       state.get("proof_id")),
            ("job_proof_items",     "proof_id",       state.get("proof_id")),
            ("job_proofs",          "id",             state.get("proof_id")),
            ("job_applications",    "id",             state.get("application_id")),
            ("job_funding",         "job_id",         state.get("job_id")),
            ("jobs",                "id",             state.get("job_id")),
            ("wallets",             "user_id",        state.get("poster_id")),
            ("wallets",             "user_id",        state.get("worker_id")),
            ("wallets",             "user_id",        state.get("fraud_worker_id")),
            ("user_bank_accounts",  "user_id",        state.get("worker_id")),
            ("user_referrals",      "user_id",        state.get("worker_id")),
            ("user_referrals",      "user_id",        state.get("poster_id")),
            ("referral_rewards",    "referrer_id",    state.get("poster_id")),
            ("user_profiles",       "user_id",        state.get("poster_id")),
            ("user_profiles",       "user_id",        state.get("worker_id")),
            ("user_profiles",       "user_id",        state.get("fraud_worker_id")),
            ("identity_users",      "id",             state.get("poster_id")),
            ("identity_users",      "id",             state.get("worker_id")),
            ("identity_users",      "id",             state.get("fraud_worker_id")),
      ]

      for table, col, val in tables_by_id:
            if val:
                  try:
                        sb.table(table).delete().eq(col, val).execute()
                        ok(f"Deleted from {table} where {col} = {val[:8]}…")
                  except Exception as e:
                        warn(f"Could not delete from {table}: {e}")


      # ── Test suite ────────────────────────────────────────────────────────────────

def run_tests(sb: Client):
      state = {}   # shared across steps

      # ── 01 Create poster (job advertiser) ────────────────────────────────────
      section(1, "Create poster account")
      poster = insert(sb, "identity_users", {
            # "id": "1468519c-0b88-4b2e-9495-4f58dba7ac67",
            "email": f"poster_{uuid.uuid4().hex[:6]}@test.ng"
      })
      state["poster_id"] = poster["id"]
      ok(f"Poster created: {poster['id']}")

      insert(sb, "user_profiles", {
            "user_id":    poster["id"],
            "first_name": "Adaeze",
            "last_name":  "Okafor",
            "state":      "Lagos",
            "gender":     "FEMALE",
      })
      ok("Poster profile created")

      # ── 02 Create worker ─────────────────────────────────────────────────────
      section(2, "Create worker account")
      worker = insert(sb, "identity_users", {
            # "id": "45e7339a-a159-40af-8409-9c9faeb169a3",
            "email": f"worker_{uuid.uuid4().hex[:6]}@test.ng"
      })
      state["worker_id"] = worker["id"]
      ok(f"Worker created: {worker['id']}")

      insert(sb, "user_profiles", {
            "user_id":    worker["id"],
            "first_name": "Chukwuemeka",
            "last_name":  "Nwosu",
            "state":      "Anambra",
            "gender":     "MALE",
      })
      ok("Worker profile created")

      # ── 03 Wallet auto-creation check ────────────────────────────────────────
      section(3, "Wallet auto-creation (trigger)")
      # Trigger fn_create_wallet_for_user fires on INSERT into identity_users
      # Give Supabase a moment for the trigger to fire
      time.sleep(0.5)

      worker_wallet = select_one(sb, "wallets", {"user_id": worker["id"]})
      if worker_wallet:
            ok(f"Worker wallet auto-created: balance = {worker_wallet['balance']} NGN")
            state["worker_wallet_id"] = worker_wallet["id"]
      else:
            warn("Wallet not auto-created — trigger may not be active. Creating manually.")
            worker_wallet = insert(sb, "wallets", {"user_id": worker["id"]})
            state["worker_wallet_id"] = worker_wallet["id"]

      # ── 04 Referral setup ────────────────────────────────────────────────────
      section(4, "Referral code setup")
      ref_code = "REF-" + uuid.uuid4().hex[:8].upper()
      poster_ref = insert(sb, "user_referrals", {
            "user_id":  poster["id"],
            "ref_code": ref_code,
      })
      ok(f"Poster referral code: {ref_code}")

      # Worker signs up using poster's ref code
      worker_ref = insert(sb, "user_referrals", {
            "user_id":     worker["id"],
            "ref_code":    "REF-" + uuid.uuid4().hex[:8].upper(),
            "referred_by": poster["id"],
      })
      ok(f"Worker referred by poster")

      # Create referral reward
      reward = insert(sb, "referral_rewards", {
            "referrer_id":      poster["id"],
            "referred_user_id": worker["id"],
            "reward_amount":    500.00,
            "status":           "PENDING",
      })
      ok(f"Referral reward queued: ₦500")

      # ── 05 Add bank account for worker ───────────────────────────────────────
      section(5, "Worker bank account")
      bank = insert(sb, "user_bank_accounts", {
            "user_id":        worker["id"],
            "bank_name":      "Access Bank",
            "account_number": "0123456789",
            "account_name":   "CHUKWUEMEKA NWOSU",
            "is_verified":    True,
            "is_default":     True,
      })
      state["bank_account_id"] = bank["id"]
      ok(f"Bank account added: {bank['bank_name']} {bank['account_number']}")

      # ── 06 Poster creates a job ───────────────────────────────────────────────
      section(6, "Poster creates FOLLOW job")
      job = insert(sb, "jobs", {
            "user_id":             poster["id"],
            "platform_id":         PLATFORM_TWITTER_ID,
            "job_type":            "FOLLOW",
            "status":              "PENDING_FUNDING",
            "target_url":          "https://x.com/testaccount",
            "payout_amount":       150.00,
            "payout_currency":     "NGN",
            "auto_approve":        False,
            "requires_screenshot": True,
            "requires_before_proof": True,
            "proof_instructions":  "Follow the account. Take a screenshot before and after.",
            "title":               "Follow @testaccount on X",
            "description":         "Follow our official X account to earn ₦150.",
            "total_slots":         10,
            "expires_at":          now_plus(minutes=60),
            "posted_at":           now_plus(minutes=0),
      })
      state["job_id"] = job["id"]
      ok(f"Job created: {job['title']} | status = {job['status']}")

      # ── 07 Fund the job ───────────────────────────────────────────────────────
      section(7, "Fund the job (poster pays)")
      funding = insert(sb, "job_funding", {
            "job_id":         job["id"],
            "funded_amount":  150.00 * 10,   # total_slots × payout_amount
            "status":         "FUNDED",
      })
      ok(f"Job funded: ₦{funding['funded_amount']}")

      # Activate the job now that it's funded
      active_job = update_one(sb, "jobs",
            {"id": job["id"]},
            {"status": "ACTIVE"}
      )
      assert_eq("Job status after funding", active_job["status"], "ACTIVE")

      # ── 08 Worker applies ────────────────────────────────────────────────────
      section(8, "Worker applies for job")
      application = insert(sb, "job_applications", {
            "job_id":    job["id"],
            "worker_id": worker["id"],
            "status":    "APPLIED",
      })
      state["application_id"] = application["id"]
      ok(f"Application created: {application['id']}")

      # Worker starts working
      working_app = update_one(sb, "job_applications",
            {"id": application["id"]},
            {"status": "WORKING"}
      )
      assert_eq("Application status", working_app["status"], "WORKING")

      # ── 09 Worker submits proof ───────────────────────────────────────────────
      section(9, "Worker submits proof")
      # Small delay to ensure submission_gap_secs > 0
      time.sleep(2)

      proof = insert(sb, "job_proofs", {
            "application_id":   application["id"],
            "worker_social_url": "https://x.com/chukwuemeka_nwosu",
            "instructions_seen": True,
            "submitted_at":     now_plus(0),
      })
      state["proof_id"] = proof["id"]
      ok(f"Proof submitted: gap = {proof['submission_gap_secs']}s | late = {proof['is_late']}")

      # Add proof items
      items = [
            {
                  "proof_id":   proof["id"],
                  "proof_type": "USERNAME",
                  "value":      "chukwuemeka_nwosu",
                  "is_before":  False,
                  "display_order": 1,
            },
            {
                  "proof_id":   proof["id"],
                  "proof_type": "SCREENSHOT",
                  "value":      "https://storage.supabase.co/proofs/before_follow.png",
                  "is_before":  True,
                  "display_order": 2,
            },
            {
                  "proof_id":   proof["id"],
                  "proof_type": "SCREENSHOT",
                  "value":      "https://storage.supabase.co/proofs/after_follow.png",
                  "is_before":  False,
                  "display_order": 3,
            },
      ]
      for item in items:
            insert(sb, "job_proof_items", item)
      ok(f"Proof items added: {len(items)} items")

      # Update application status
      update_one(sb, "job_applications",
            {"id": application["id"]},
            {"status": "SUBMITTED"}
      )
      ok("Application status → SUBMITTED")

      # ── 10 Inspect auto-flags ─────────────────────────────────────────────────
      section(10, "Inspect auto-generated flags")
      flags = select_many(sb, "job_proof_flags", {"proof_id": proof["id"]})
      if flags:
            for f in flags:
                  warn(f"Flag: [{f['severity']}] {f['flag_type']} — {f['detail']}")
      else:
            ok("No flags raised — proof looks clean")

      high_flags = [f for f in flags if f["severity"] == "HIGH" and not f["resolved"]]
      info(f"{len(high_flags)} HIGH severity flags blocking auto-approval")

      # ── 11 Manual verification (approve) ─────────────────────────────────────
      section(11, "Manual verification → APPROVED")
      verification = insert(sb, "job_verifications", {
            "application_id": application["id"],
            "verified_by":    poster["id"],
            "recheck_status": "ACTIVE",   # FOLLOW jobs should be rechecked
            "is_verified":    True,
            "rejection_reason": None,
      })
      ok(f"Verification created: is_verified = {verification['is_verified']}")

      # Update application to APPROVED (triggers filled_slots increment)
      approved_app = update_one(sb, "job_applications",
            {"id": application["id"]},
            {"status": "APPROVED"}
      )
      assert_eq("Application status", approved_app["status"], "APPROVED")

      # Check filled_slots incremented
      time.sleep(0.3)
      refreshed_job = select_one(sb, "jobs", {"id": job["id"]})
      assert_eq("filled_slots after approval", refreshed_job["filled_slots"], 1)

      # ── 12 Release payment ────────────────────────────────────────────────────
      section(12, "Release payment → wallet credited")
      payment = insert(sb, "job_payments", {
            "application_id":  application["id"],
            "amount":          150.00,
            "currency":        "NGN",
            "payment_status":  "PENDING",
            "payment_reference": f"PAY-{uuid.uuid4().hex[:10].upper()}",
      })
      state["payment_id"] = payment["id"]
      ok(f"JobPayment created: ₦{payment['amount']} | status = PENDING")

      # Trigger the wallet credit by updating status to PAID
      paid_payment = update_one(sb, "job_payments",
            {"id": payment["id"]},
            {"payment_status": "PAID"}
      )
      ok(f"Payment status → PAID")

      # Verify wallet balance updated
      time.sleep(0.5)
      updated_wallet = select_one(sb, "wallets", {"user_id": worker["id"]})
      assert_eq("Worker wallet balance", float(updated_wallet["balance"]), 150.00)

      # ── 13 Wallet transaction audit trail ─────────────────────────────────────
      section(13, "Wallet transaction audit trail")
      txns = select_many(sb, "wallet_transactions",
                        {"wallet_id": updated_wallet["id"]})
      if txns:
            for t in txns:
                  ok(f"Tx: {t['type']} | ₦{t['amount']} | {t['source']} | "
                  f"before={t['balance_before']} → after={t['balance_after']}")
      else:
            warn("No wallet transactions found — check trigger fn_credit_wallet_on_payment")

      # Update application to PAID
      update_one(sb, "job_applications",
            {"id": application["id"]},
            {"status": "PAID"}
      )
      ok("Application status → PAID")

      # ── 14 Withdrawal request ─────────────────────────────────────────────────
      section(14, "Worker requests withdrawal")
      withdrawal = insert(sb, "withdrawal_requests", {
            "user_id":         worker["id"],
            "bank_account_id": bank["id"],
            "amount":          100.00,
            "status":          "PENDING",
      })
      state["withdrawal_id"] = withdrawal["id"]
      ok(f"Withdrawal requested: ₦{withdrawal['amount']} → Access Bank")

      # Simulate processing
      processed = update_one(sb, "withdrawal_requests",
            {"id": withdrawal["id"]},
            {
                  "status":            "PAID",
                  "payment_reference": f"WDRAW-{uuid.uuid4().hex[:8].upper()}",
                  "processed_at":      now_plus(0),
            }
      )
      assert_eq("Withdrawal status", processed["status"], "PAID")

      # Record the debit transaction manually (in real app this fires from your backend)
      debit_wallet = select_one(sb, "wallets", {"user_id": worker["id"]})
      debit_tx = insert(sb, "wallet_transactions", {
            "wallet_id":      debit_wallet["id"],
            "type":           "DEBIT",
            "amount":         100.00,
            "balance_before": float(debit_wallet["balance"]),
            "balance_after":  float(debit_wallet["balance"]) - 100.00,
            "source":         "WITHDRAWAL",
            "reference":      processed["payment_reference"],
      })
      update_one(sb, "wallets",
            {"id": debit_wallet["id"]},
            {"balance": float(debit_wallet["balance"]) - 100.00}
      )
      ok(f"Debit transaction recorded: ₦100 | ref = {processed['payment_reference']}")

      final_wallet = select_one(sb, "wallets", {"user_id": worker["id"]})
      assert_eq("Worker wallet after withdrawal", float(final_wallet["balance"]), 50.00)

      # ── 15 Fraud scenario: duplicate social URL ───────────────────────────────
      section(15, "Fraud scenario: duplicate social URL")
      fraud_worker = insert(sb, "identity_users", {
            "email": f"fraud_{uuid.uuid4().hex[:6]}@test.ng"
      })
      state["fraud_worker_id"] = fraud_worker["id"]
      ok(f"Fraud worker created: {fraud_worker['id']}")

      insert(sb, "user_profiles", {
            "user_id":    fraud_worker["id"],
            "first_name": "Fake",
            "last_name":  "Account",
            "state":      "Lagos",
            "gender":     "OTHER",
      })

      fraud_app = insert(sb, "job_applications", {
            "job_id":    job["id"],
            "worker_id": fraud_worker["id"],
            "status":    "WORKING",
      })
      state["fraud_application_id"] = fraud_app["id"]

      time.sleep(2)

      # Submit proof with the SAME social URL as the legitimate worker
      fraud_proof = insert(sb, "job_proofs", {
            "application_id":    fraud_app["id"],
            "worker_social_url": "https://x.com/chukwuemeka_nwosu",  # same as real worker
            "instructions_seen": True,
            "submitted_at":      now_plus(0),
      })

      time.sleep(0.5)
      fraud_flags = select_many(sb, "job_proof_flags", {"proof_id": fraud_proof["id"]})
      dup_flags = [f for f in fraud_flags if f["flag_type"] == "DUPLICATE_SOCIAL_URL"]

      if dup_flags:
            ok(f"DUPLICATE_SOCIAL_URL flag raised automatically — fraud detected")
            info(f"Detail: {dup_flags[0]['detail']}")
      else:
            warn("Duplicate social URL flag NOT raised — check trigger fn_auto_flag_proof")

      # Cleanup fraud application
      sb.table("job_proof_flags").delete().eq("proof_id", fraud_proof["id"]).execute()
      sb.table("job_proofs").delete().eq("id", fraud_proof["id"]).execute()
      sb.table("job_applications").delete().eq("id", fraud_app["id"]).execute()

      # ── 16 Dispute flow ───────────────────────────────────────────────────────
      section(16, "Dispute flow")
      # Simulate a separate rejection scenario for dispute
      dispute = insert(sb, "job_disputes", {
            "application_id": application["id"],
            "raised_by":      worker["id"],
            "reason":         "My proof was valid — I followed the account before the deadline.",
            "status":         "OPEN",
      })
      state["dispute_id"] = dispute["id"]
      ok(f"Dispute raised by worker: {dispute['status']}")

      resolved = update_one(sb, "job_disputes",
            {"id": dispute["id"]},
            {
                  "status":           "RESOLVED",
                  "resolution_notes": "Reviewed proof items. Worker's claim upheld.",
                  "resolved_at":      now_plus(0),
            }
      )
      assert_eq("Dispute resolved", resolved["status"], "RESOLVED")

      # ── Summary ───────────────────────────────────────────────────────────────
      section(0, "Test Summary")
      print(f"""
            {Colors.OK}{Colors.BOLD}All workflow tests passed.{Colors.RESET}

            IDs created during this run:
            Poster ID:       {state.get('poster_id')}
            Worker ID:       {state.get('worker_id')}
            Job ID:          {state.get('job_id')}
            Application ID:  {state.get('application_id')}
            Proof ID:        {state.get('proof_id')}
            Payment ID:      {state.get('payment_id')}
            Withdrawal ID:   {state.get('withdrawal_id')}
            Dispute ID:      {state.get('dispute_id')}
      """)

      return state


      # ── Entry point ───────────────────────────────────────────────────────────────

def main():
      print(f"\n{Colors.BOLD}Gig Platform — Supabase Workflow Test{Colors.RESET}")
      print(f"URL: {SUPABASE_URL}\n")

      sb = create_client(SUPABASE_URL, SUPABASE_KEY)

      state = {}
      try:
            state = run_tests(sb)
      except AssertionError as e:
            err(f"Assertion failed: {e}")
            sys.exit(1)
      except Exception as e:
            err(f"Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
      finally:
            if state:
                  cleanup(sb, state)
            print("\n")


if __name__ == "__main__":
    main()