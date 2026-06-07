import {Stripe} from 'stripe';
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const PRICE_IDS: Record<string, string> = {
  price_1TcqWA5GT3nIwOCUPCrRORo6: "starter",
  price_1TcqWZ5GT3nIwOCUSmsW5He5: "pro"
}

Deno.serve(async (req) => {
  console.log(req);
  const signature = req.headers.get("stripe-signature");

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

    if (event && event.type === "customer.subscription.updated") {
      console.log(event)
      // update supabase
      // event.created - initial payment date
      // const created = new Date(event.created * 1000).toISOString();
      // console.log(`initial payment date - ${created}`)
      // // event.created - last payment date
      // // event.data.object.expires_at - subscription expires date
      // const expires = new Date(event.data.object.expires_at * 1000).toISOString();
      // console.log(`subscription expires date - ${expires}`)
      // // event.data.object.payment_status - payment status
      // console.log(`payment status - ${event.data.object.payment_status}`)
      // // event.data.object.metadata.user_id - id
      // console.log(`user_id - ${event.data.object.metadata.user_id}`)
      // // event.data.object.metadata.price_id - subscription type
      // console.log(`subscription type - ${event.data.object.metadata.price_id}`)
      // const subscriptionType = PRICE_IDS[event.data.object.metadata.price_id]
      //
      // // event.data.object.customer_details.name - customer name
      // console.log(`customer name - ${event.data.object.customer_details.name}`)
      // // event.data.object.customer_details.email - customer email
      // console.log(`customer email - ${event.data.object.customer_details.email}`)

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      // const supabase = createClient(supabaseUrl, supabaseServiceKey);
      //
      // const {error} = await supabase
      //     .from("user_info")
      //     .update([
      //       {
      //         subscription_type: subscriptionType,
      //         paid: true,
      //         initial_payment_date: created,
      //         last_payment_date: created,
      //         subscription_expires_date: expires,
      //         customer_name: event.data.object.customer_details.name,
      //         customer_email: event.data.object.customer_details.email,
      //         payment_status: event.data.object.payment_status
      //       },
      //     ])
      //     .eq("id", event.data.object.metadata.user_id);
      //
      // if (error) throw error;

      return new Response(JSON.stringify({ response: "success" }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
      });
    } else {
      return new Response(
          "function should not be invoked",
          { status: 400 }
      );
    }


  } catch (err) {
    return new Response(
        `Webhook Error: ${err}`,
        { status: 400 }
    );
  }
});