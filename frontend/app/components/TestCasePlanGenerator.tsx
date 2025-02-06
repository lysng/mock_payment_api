"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import TestCasePlan from "./TestCasePlan"
import LogicTree from "./LogicTree"
import ErrorCorrection from "./ErrorCorrection"
import SyntheticDataGenerator from "./SyntheticDataGenerator"

export default function TestCasePlanGenerator() {
  const [requirement, setRequirement] = useState("")
  const [product, setProduct] = useState("")
  const [existingTestCases, setExistingTestCases] = useState("")
  const [repoLink, setRepoLink] = useState("")
  const [testCasePlan, setTestCasePlan] = useState("")
  const [logicTree, setLogicTree] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const generateTestCasePlan = async () => {
    // This is where you would normally call your custom LLM API
    // For this example, we'll use dummy data
    setTestCasePlan(`
      Test Case Plan for "${requirement}"
      
      1. Verify user can initiate a payment
      2. Check if the payment amount is correctly processed
      3. Ensure the recipient receives the correct amount
      4. Validate transaction history is updated
      5. Test error handling for insufficient funds
    `)
    setLogicTree([
      "Analyze business requirement",
      "Identify key components: user, payment, amount",
      "Generate test cases for happy path",
      "Add test cases for error scenarios",
      "Review and finalize test case plan",
    ])
    setError(null)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Test Case Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requirement">Business Requirement</Label>
            <Textarea
              id="requirement"
              placeholder="Enter your business requirement here"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select onValueChange={setProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="international-payments">International Payments</SelectItem>
                <SelectItem value="mobile-app">Mobile App</SelectItem>
                <SelectItem value="banking-website">Banking Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="existing-test-cases">Existing Test Cases (Optional)</Label>
            <Textarea
              id="existing-test-cases"
              placeholder="Enter any existing test cases here"
              value={existingTestCases}
              onChange={(e) => setExistingTestCases(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repo-link">Repository Link (Optional)</Label>
            <Input
              id="repo-link"
              type="url"
              placeholder="https://github.com/your-repo"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
            />
          </div>
          <Button onClick={generateTestCasePlan}>Generate Test Case Plan</Button>
        </CardContent>
      </Card>
      {error && <div className="text-red-500">{error}</div>}
      {testCasePlan && (
        <>
          <TestCasePlan plan={testCasePlan} />
          <LogicTree steps={logicTree} />
          <ErrorCorrection
            onCorrect={(correctedInput) => {
              setRequirement(correctedInput)
              generateTestCasePlan()
            }}
          />
          <SyntheticDataGenerator />
        </>
      )}
    </div>
  )
}

