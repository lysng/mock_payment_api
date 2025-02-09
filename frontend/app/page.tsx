import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Banking API Development Tools</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Case Generator</CardTitle>
            <CardDescription>
              Generate test cases, implementation plans, and code for new features using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/test-case-generator">
              <Button className="w-full">Open Test Case Generator</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Add more tools/cards here as needed */}
      </div>
    </main>
  )
}

