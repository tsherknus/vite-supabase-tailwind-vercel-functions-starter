import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {Stripe} from 'npm:stripe@^22';

const stripe = new Stripe(
    Deno.env.get("STRIPE_SECRET_KEY")!
);

const webhookSecret =
    Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
    const signature =
        req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
          "Missing stripe-signature header",
          { status: 400 }
      );
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
          body,
          signature,
          webhookSecret
      );

      console.log(event)

      return new Response(JSON.stringify({ response: "success" }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      });
    } catch (err) {
      return new Response(
          `Webhook Error: ${err}`,
          { status: 400 }
      );
    }
});