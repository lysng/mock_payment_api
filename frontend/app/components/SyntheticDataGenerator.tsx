"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SyntheticDataGenerator() {
  const [syntheticData, setSyntheticData] = useState<string>("")

  const generateSyntheticData = async () => {
    // This is where you would normally call your custom LLM API
    // For this example, we'll use dummy data
    setSyntheticData(
      JSON.stringify(
        {
          userId: "user123",
          sourceAccountId: "account456",
          destinationAccountId: "account789",
          amount: 10.0,
          currency: "USD",
          description: "Payment to friend",
        },
        null,
        2,
      ),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthetic Data Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={generateSyntheticData}>Generate Synthetic Data</Button>
        {syntheticData && <pre className="bg-gray-100 p-4 rounded overflow-x-auto">{syntheticData}</pre>}
      </CardContent>
    </Card>
  )
}

