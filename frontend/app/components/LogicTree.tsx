import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LogicTreeProps {
  steps: string[]
}

export default function LogicTree({ steps }: LogicTreeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logic Tree</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-decimal list-inside space-y-2">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

