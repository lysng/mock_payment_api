import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HowToUse() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Use</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
          <li>Enter your business requirement in the text area.</li>
          <li>Select the product you're working on from the dropdown menu.</li>
          <li>Optionally, add any existing test cases in the provided text area.</li>
          <li>If available, provide a link to your project repository.</li>
          <li>Click the "Generate Test Case Plan" button to create your plan.</li>
          <li>Review the generated test case plan and logic tree.</li>
          <li>If needed, use the error correction feature to refine the plan.</li>
          <li>Generate synthetic data using the "Generate Synthetic Data" button if an API spec is provided.</li>
        </ol>
      </CardContent>
    </Card>
  )
}

