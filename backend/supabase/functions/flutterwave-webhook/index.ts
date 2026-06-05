import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

Deno.serve(async (req) => {
      try {
            // 1. Authenticate Flutterwave Webhook Signature Hash
            const secretHash = Deno.env.get('FLW_SECRET_HASH');
            const signature = req.headers.get('verif-hash');

            if (secretHash && signature !== secretHash) {
                  return new Response('Unauthorized Signatures', {
                        status: 401,
                  });
            }

            const body = await req.json();
            const eventData = body?.data; // The core payment entity object

            // Fix: Flutterwave webhooks put status inside body.data, not top-level body
            if (!eventData || eventData.status !== 'successful') {
                  return new Response(
                        JSON.stringify({
                              received: true,
                              message: 'Ignored non-success event',
                        }),
                        {
                              status: 200,
                              headers: { 'Content-Type': 'application/json' },
                        }
                  );
            }

            // 2. Initialize Supabase Admin Client
            const supabase = createClient(
                  Deno.env.get('SUPABASE_URL')!,
                  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            );

            // 3. Resolve Database Foreign Keys
            const { data: userProfile, error: userError } = await supabase
                  .from('user_profiles')
                  .select('user_id')
                  .eq('email', eventData.customer.email)
                  .maybeSingle();

            if (userError || !userProfile) {
                  return new Response(
                        JSON.stringify({ error: 'User mapping failed' }),
                        { status: 404 }
                  );
            }

            const { data: wallet, error: walletError } = await supabase
                  .from('wallet')
                  .select('id')
                  .eq('user_id', userProfile.user_id)
                  .maybeSingle();

            if (walletError || !wallet) {
                  return new Response(
                        JSON.stringify({ error: 'Wallet missing' }),
                        { status: 404 }
                  );
            }

            // 4. Save to wallet_deposits Table
            const { error: upsertError } = await supabase
                  .from('wallet_deposits')
                  .upsert(
                        {
                              user_id: userProfile.user_id,
                              wallet_id: wallet.id,
                              status: 'SUCCESSFUL',
                              flw_status: eventData.status,
                              amount: eventData.amount,
                              currency: eventData.currency,
                              transaction_id: eventData.id, // Fixed: Cast to string
                              tx_ref: eventData.tx_ref,
                              flw_ref:
                                    eventData.flw_ref ||
                                    'WH-MOD-' + eventData.id,
                              charge_response_message:
                                    eventData.processor_response ||
                                    'Approved via Webhook',
                              charge_response_code: '00',
                              flw_created_at:
                                    eventData.created_at ||
                                    new Date().toISOString(),
                              confirmed_at: new Date().toISOString(),
                        },
                        {
                              onConflict: 'transaction_id',
                        }
                  );

            if (upsertError) {
                  return new Response(
                        JSON.stringify({ error: upsertError.message }),
                        { status: 500 }
                  );
            }

            // Always return a 200 OK to Flutterwave within 5 seconds to stop retries
            return new Response(JSON.stringify({ received: true }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
            });
      } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                  status: 500,
                  headers: { 'Content-Type': 'application/json' },
            });
      }
});
