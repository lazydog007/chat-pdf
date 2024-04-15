import { db } from "@/lib/db"
import { userSubscriptions } from "@/lib/db/schema"
import { stripe } from "@/lib/stripe"
import { auth, currentUser } from "@clerk/nextjs"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

const return_url = process.env.NEXT_BASE_URL + "/"

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return new NextResponse("unauthrozied", { status: 401 })
    }

    const _userSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))

    // cancel at billing portal
    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url: return_url,
      })

      return NextResponse.json({ url: stripeSession.url })
    }

    // user first time trying to subscribe

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url,
      cancel_url: return_url,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user?.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Chat-PDF Pro",
              description: "Unlimited PDF sessions",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId, // we need the userId to see who did the transaction
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.log("Stripe error", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
