import { auth } from "@clerk/nextjs"
import { eq } from "drizzle-orm"
import { db } from "./db"
import { userSubscriptions } from "./db/schema"

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const checkSubscription = async () => {
  const { userId } = await auth()

  if (!userId) {
    return false
  }

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))

  // not subscribed
  if (!_userSubscriptions[0]) {
    return false
  }

  const userSubscription = _userSubscriptions[0]
  console.log("userSubscription ", userSubscription)

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! * DAY_IN_MS > Date.now()

  console.log("isValid: ", isValid)

  return !!isValid
}
