"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ErrorCorrectionProps {
  onCorrect: (correctedInput: string) => void
}

export default function ErrorCorrection({ onCorrect }: ErrorCorrectionProps) {
  const [correction, setCorrection] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCorrect(correction)
    setCorrection("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Correction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Enter any corrections or additional information here"
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
          />
          <Button type="submit">Apply Correction</Button>
        </form>
      </CardContent>
    </Card>
  )
}

