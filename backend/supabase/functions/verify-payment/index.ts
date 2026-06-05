import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

export const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req) => {
      if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders });
      }

      try {
            const body = await req.json().catch(() => ({}));
            const { transaction_id } = body;

            if (!transaction_id) {
                  return new Response(
                        JSON.stringify({ success: false, message: 'Missing transaction_id' }),
                        {
                              status: 400,
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            const supabase = createClient(
                  Deno.env.get('SUPABASE_URL')!,
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            );

            const FLW_SECRET = Deno.env.get('FLW_SECRET_KEY')!;
            const res = await fetch(
                  `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
                  {
                        method: 'GET',
                        headers: { Authorization: `Bearer ${FLW_SECRET}` },
                  }
            );

            const apiResponse = await res.json();

            if (apiResponse.status !== 'success' || !apiResponse.data) {
                  return new Response(
                        JSON.stringify({
                              success: false,
                              message: 'Verification lookup failed on provider side',
                              apiResponse,
                        }),
                        {
                              status: 400,
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            const tx = apiResponse.data;

            // ✅ Fix 1: Handle string vs numeric value validation gracefully
            const isValid = String(tx.status).toLowerCase() === 'successful' && tx.currency === 'NGN';
            if (!isValid) {
                  return new Response(
                        JSON.stringify({ success: false, message: 'Invalid transaction status or currency' }),
                        {
                              status: 400,
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            // ✅ Fix 2: Handle stringified or nested metadata configurations safely
            let userId = tx.meta?.user_id;
            if (!userId && typeof tx.meta === 'string') {
                  try {
                        const parsedMeta = JSON.parse(tx.meta);
                        userId = parsedMeta.user_id;
                  } catch (e) {
                        console.error("Failed to parse stringified meta field", e);
                  }
            }

            if (!userId) {
                  return new Response(
                        JSON.stringify({
                              success: false,
                              message: 'Could not resolve user identifier from payment metadata context',
                        }),
                        {
                              status: 400,
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            const { data: wallet, error: walletError } = await supabase
                  .from('wallet')
                  .select('id')
                  .eq('user_id', userId)
                  .maybeSingle();

            if (walletError || !wallet) {
                  return new Response(
                        JSON.stringify({
                              success: false,
                              message: 'User wallet entry missing from database',
                              error: walletError,
                        }),
                        {
                              status: 404, // Handled safely as a 404 instead of a generic failure
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            // ✅ Fix 3: Standardize column names to string identifiers where necessary
            const { error: upsertError } = await supabase
                  .from('wallet_deposits')
                  .upsert(
                        {
                              user_id: userId,
                              wallet_id: wallet.id,
                              status: 'SUCCESSFUL',
                              flw_status: tx.status,
                              amount: Number(tx.amount), // Force numeric type safety
                              currency: tx.currency,
                              transaction_id: String(tx.id),
                              tx_ref: tx.tx_ref,
                              flw_ref: tx.flw_ref,
                              charge_response_message: tx.processor_response || 'Approved', // Use processor_response if code is absent
                              charge_response_code: tx.charge_response_code || '00',
                              flw_created_at: tx.created_at,
                              confirmed_at: new Date().toISOString(),
                        },
                        {
                              onConflict: 'transaction_id',
                        }
                  );

            if (upsertError) {
                  return new Response(
                        JSON.stringify({
                              success: false,
                              message: 'Database write execution failed',
                              error: upsertError,
                        }),
                        {
                              status: 500,
                              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        }
                  );
            }

            return new Response(
                  JSON.stringify({ success: true, message: 'Payment verified and captured', data: tx }),
                  {
                        status: 200,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  }
            );
      } catch (err: any) {
            return new Response(
                  JSON.stringify({ success: false, error: err.message }),
                  {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  }
            );
      }
});

