// hooks/useWallet.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/server/supabase';
import { useAuth } from '@/contexts/authentication';
import { Wallet } from '@/types/types';

interface WalletSummary {
      current_balance: number;
      last_tx_balance_before: number;
      last_tx_balance_after: number;
      last_tx_amount: number;
      last_tx_type: string;
      last_tx_at: string;
      total_credited: number;
      total_debited: number;
      computed_net_balance: number;
      tx_count: number;
}

interface UseWalletReturn {
      wallet: Wallet | null;
      summary: WalletSummary | null;
      loading: boolean;
      error: string | null;
      refresh: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
      const { profile } = useAuth();

      const [wallet, setWallet] = useState<Wallet | null>(null);
      const [summary, setSummary] = useState<WalletSummary | null>(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const fetchWallet = useCallback(async () => {
            if (!profile?.user_id) return;

            setLoading(true);
            setError(null);

            try {
                  // 1. fetch wallet row by user_profile_id
                  const { data: walletData, error: walletError } = await supabase
                        .from('wallets')
                        .select('*')
                        .eq('user_id', profile.user_id)  // adjust FK name to match your schema
                        .single();

                  if (walletError) throw walletError;
                  if (!walletData) throw new Error('No wallet found for this profile');
                  
                  setWallet(walletData);

                  // 2. fetch summary view with the wallet id we just got
                  const { data: summaryData, error: summaryError } = await supabase
                        .from('wallet_balance_summary')
                        .select('*')
                        .eq('wallet_id', walletData.id)
                        .single();
                        
                  if (summaryError) throw summaryError;
                        
                  setSummary(summaryData);
            } catch (err: any) {
                  console.error('[useWallet]', err);
                  setError(err.message ?? 'Failed to load wallet');
                  setWallet(null);
                  setSummary(null);
            } finally {
                  setLoading(false);
            }
      }, [profile?.id]);

      useEffect(() => {
            fetchWallet();
      }, [fetchWallet]);

      return { wallet, summary, loading, error, refresh: fetchWallet };
}