import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {Stripe} from 'npm:stripe@^22';

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://vite-tailwind-supabase-vercel-start.vercel.app",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICE_IDS: Record<string, string> = {
  starter: "price_1TcqWA5GT3nIwOCUPCrRORo6",
  pro: "price_1TcqWZ5GT3nIwOCUSmsW5He5"
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  try {
    const { data } = await req.json();

    console.log(data);

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const hostName = Deno.env.get("HOST_NAME")

    const stripe = new Stripe(stripeSecretKey)

    const priceId = PRICE_IDS[data.tier]

    if (!priceId) {
      throw new Error("price id mismatch or missing, malicious intent");
    }

    const stripeResponse = await stripe.checkout.sessions.create({
      line_items: [{price: priceId, quantity: 1}],
      customer_email: data.email,
      metadata: {
        user_id: data.userid,
        price_id: priceId,
      },
      mode: 'subscription',
      success_url: `${hostName}/verify-email`,
      cancel_url: `${hostName}/verify-email`
    })

    return new Response(JSON.stringify({ checkoutUrl: stripeResponse.url }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
    });
  }
});