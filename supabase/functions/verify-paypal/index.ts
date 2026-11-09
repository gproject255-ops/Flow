// Supabase Edge Function: verify-paypal
// Deploy with: supabase functions deploy verify-paypal
// Set secrets: supabase secrets set PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || ""
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET") || ""
const PAYPAL_BASE = "https://api-m.paypal.com" // Live. Use api-m.sandbox.paypal.com for sandbox

async function getAccessToken(): Promise<string> {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
  const data = await res.json()
  return data.access_token
}

async function verifyOrder(orderId: string, expectedAmount: string): Promise<boolean> {
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
    headers: { "Authorization": `Bearer ${token}` },
  })
  const order = await res.json()
  
  if (order.status !== "COMPLETED") return false
  
  const purchaseUnit = order.purchase_units?.[0]
  const amount = purchaseUnit?.amount?.value
  const captured = purchaseUnit?.payments?.captures?.[0]?.status === "COMPLETED"
  
  return captured && amount === expectedAmount
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    })
  }

  try {
    const { orderId, planId, expectedAmount } = await req.json()
    
    if (!orderId || !planId || !expectedAmount) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
    }

    const verified = await verifyOrder(orderId, String(expectedAmount))
    
    if (!verified) {
      return new Response(JSON.stringify({ error: "Payment not verified", verified: false }), { status: 400 })
    }

    // Payment is real. Return success so frontend can set plan.
    // In production you should also write to a profiles table here.
    return new Response(JSON.stringify({ 
      verified: true, 
      planId,
      message: "Payment confirmed"
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })

  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 })
  }
})
