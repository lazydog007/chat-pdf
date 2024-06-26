"use client"

import axios from "axios"
import React from "react"
import { Button } from "./ui/button"

type Props = { isPro: boolean }

const SubscriptionButton = ({ isPro }: Props) => {
  const [loading, setLoading] = React.useState(false)
  const handleSubscription = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/stripe")
      window.location.href = response.data.url
    } catch (error) {
      console.log("Handling subcrtiption error", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button disabled={loading} onClick={handleSubscription} variant="outline">
      {isPro ? "Manage Subscriptions" : "Get Pro"}
    </Button>
  )
}

export default SubscriptionButton
