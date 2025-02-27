// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { Resend } from "https://esm.sh/resend";

// Define types for Supabase response (minimal, adjust as needed)
interface PriceAlert {
  email: string;
  target_price: number;
  sent: boolean;
}

// Initialize clients
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);
const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

// Auction constants
const START_PRICE: number = 86400; // $86,400
const DROP_RATE: number = 0.01; // $0.01 per second
const START_TIME: number = new Date("2025-02-17T14:00:00Z").getTime(); // UTC

serve(async () => {
  try {
    // Fetch unsent price alerts
    const { data: alerts, error } = await supabase
      .from("price_alerts")
      .select("email, target_price, sent")
      .eq("sent", false);

    if (error) throw new Error(`Failed to fetch alerts: ${error.message}`);
    if (!alerts || alerts.length === 0) {
      return new Response("No alerts to process", { status: 200 });
    }

    // Calculate current price
    const now: number = Date.now();
    const secondsElapsed: number = Math.floor((now - START_TIME) / 1000);
    const currentPrice: number = START_PRICE - secondsElapsed * DROP_RATE;

    // Filter alerts where current price is at or below target
    const alertsToSend: PriceAlert[] = alerts.filter(
      (alert: PriceAlert) => currentPrice <= alert.target_price
    );

    // Send emails and update status
    for (const alert of alertsToSend) {
      await resend.emails.send({
        from: "florin@florin-pop.com",
        to: alert.email,
        subject: "🚨 PRICE ALERT: Your target has been reached!",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Alert</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
    body {
      font-family: 'DM Sans', Arial, sans-serif;
      line-height: 1.6;
      color: #fff;
      background-color: #000;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .header {
      background: linear-gradient(to right, #3B82F6, #6366F1, #8B5CF6);
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #fff !important;
    }
    .content {
      padding: 24px;
    }
    .price-box {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .current-price {
      font-size: 42px;
      font-weight: 700;
      background: linear-gradient(to right, #3B82F6, #8B5CF6);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 10px 0;
    }
    .target-price {
      font-size: 18px;
      color: #a3a3a3;
    }
    .alert-box {
      background-color: rgba(59, 130, 246, 0.1);
      border-left: 4px solid #3B82F6;
      padding: 16px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #3B82F6;
      color: #fff !important;
      text-decoration: none;
      text-align: center;
      padding: 16px 32px;
      font-weight: 600;
      border-radius: 12px;
      margin: 20px 0;
      width: 100%;
      box-sizing: border-box;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #a3a3a3;
      font-size: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo-text {
      background: linear-gradient(to right, #3B82F6, #6366F1, #8B5CF6);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>Your Target Has Been Reached!</h1>
      </div>
      <div class="content">
        <p>Great news! The price for <strong>MakeMoney.now</strong> has dropped below your target price!</p>
        
        <div class="price-box">
          <p>Current Price:</p>
          <div class="current-price">$${currentPrice.toFixed(2)}</div>
          <p class="target-price">Your Target: $${alert.target_price}</p>
        </div>
        
        <div class="alert-box">
          <strong>⏰ ACT QUICKLY!</strong> The price continues to drop by $0.01 every second, but other buyers may purchase at any moment.
        </div>
        
        <p>This is your opportunity to invest in a premium domain at your desired price point.</p>
        
        <a href="https://makemoney.now" class="btn">SECURE YOUR DOMAIN NOW</a>
      </div>
    </div>
    
    <div class="card">
      <div class="content" style="padding-bottom: 10px;">
        <p style="margin-bottom: 5px;"><strong>How to purchase:</strong></p>
        <ol style="margin-top: 0; padding-left: 20px; color: #a3a3a3;">
          <li>Pay $100 deposit via Stripe to lock in your price</li>
          <li>Your price is locked at payment time</li>
          <li>Complete remaining payment via wire transfer</li>
        </ol>
      </div>
    </div>
    
    <div class="footer">
      <div style="margin-bottom: 15px;"><span class="logo-text">MakeMoney.now</span></div>
      <p>Best regards,<br>Florin Pop</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `GREAT NEWS! The Dutch auction price for MakeMoney.now has dropped to $${currentPrice.toFixed(2)}, which is now BELOW your target price of $${alert.target_price}!

⏰ ACT QUICKLY! ⏰
The price continues to drop, but other buyers may purchase at any moment.

🔗 SECURE YOUR DOMAIN NOW: https://makemoney.now

This is your opportunity to invest in a premium domain at your desired price point.

Best regards,
Florin Pop
        `,
      });

      await supabase
        .from("price_alerts")
        .update({ sent: true })
        .eq("email", alert.email)
        .eq("target_price", alert.target_price);
    }

    return new Response(alertsToSend.length > 0 
      ? `Successfully sent ${alertsToSend.length} email${alertsToSend.length === 1 ? '' : 's'}`
      : "No emails were sent - no alerts reached their target price", 
      { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(`Error processing alerts: ${(error as Error).message}`, { status: 500 });
  }
});