"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateTestCasePlan } from "@/lib/api"
import { Loader2, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TestCase {
  title: string
  scenarios: Array<{
    description: string
    expectedOutcome: string
  }>
}

interface ImplementationStep {
  step: string
  details: string
}

export default function TestCasePlanGenerator() {
  const [requirement, setRequirement] = useState("")
  const [testCasePlan, setTestCasePlan] = useState<TestCase[]>([])
  const [implementationPlan, setImplementationPlan] = useState<ImplementationStep[]>([])
  const [implementationPrompt, setImplementationPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const formatTestCases = (testCases: TestCase[]) => {
    return testCases.map((testCase, index) => `
Test Case ${index + 1}: ${testCase.title}
${testCase.scenarios.map((scenario, sIndex) => `
  Scenario ${sIndex + 1}:
  Description: ${scenario.description}
  Expected Outcome: ${scenario.expectedOutcome}
`).join('')}
`).join('\n')
  }

  const formatImplementationPlan = (plan: ImplementationStep[]) => {
    return plan.map((step, index) => `
Step ${index + 1}: ${step.step}
Details: ${step.details}
`).join('\n')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "You can now paste this prompt into Cursor or another LLM tool",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the text manually",
        variant: "destructive",
      })
    }
  }

  const generatePlan = async () => {
    if (!requirement.trim()) {
      setError("Please enter a business requirement")
      return
    }

    setIsLoading(true)
    setError(null)
    setTestCasePlan([])
    setImplementationPlan([])
    setImplementationPrompt("")

    try {
      console.log('Sending request with requirement:', requirement)
      const response = await generateTestCasePlan({
        requirement,
        context: "banking_api"
      })

      console.log('Received full response:', JSON.stringify(response, null, 2))
      console.log('Implementation prompt:', response.implementationPrompt)
      
      setTestCasePlan(response.testCasePlan)
      setImplementationPlan(response.implementationPlan)
      setImplementationPrompt(response.implementationPrompt)
    } catch (err) {
      console.error('Error generating test cases:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
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
              placeholder="Enter your business requirement here (e.g., 'As a user, I want to be able to set a savings goal...')"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={generatePlan} 
            disabled={isLoading || !requirement.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(testCasePlan.length > 0 || implementationPlan.length > 0 || implementationPrompt) && (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="test-cases">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
                <TabsTrigger value="implementation">Implementation Plan</TabsTrigger>
                <TabsTrigger value="prompt">Implementation Prompt</TabsTrigger>
              </TabsList>
              <TabsContent value="test-cases" className="mt-4">
                <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-md">
                  {testCasePlan.length > 0 ? formatTestCases(testCasePlan) : 'No test cases generated yet'}
                </div>
              </TabsContent>
              <TabsContent value="implementation" className="mt-4">
                <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-md">
                  {implementationPlan.length > 0 ? formatImplementationPlan(implementationPlan) : 'No implementation plan generated yet'}
                </div>
              </TabsContent>
              <TabsContent value="prompt" className="mt-4">
                <div className="relative">
                  {implementationPrompt && (
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(implementationPrompt)}
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-md min-h-[200px] prose prose-sm max-w-none">
                    {implementationPrompt ? implementationPrompt.split('\\n').map((line, i) => (
                      <div key={i} className={line.startsWith('#') ? 'font-bold' : ''}>
                        {line.replace(/^#+\s/, '')}
                      </div>
                    )) : 'No implementation prompt generated yet'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

