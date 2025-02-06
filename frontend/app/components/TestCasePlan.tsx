import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TestCasePlanProps {
  plan: string
}

export default function TestCasePlan({ plan }: TestCasePlanProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Test Case Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">{plan}</pre>
      </CardContent>
    </Card>
  )
}

