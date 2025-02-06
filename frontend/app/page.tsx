import TestCasePlanGenerator from "./components/TestCasePlanGenerator"
import HowToUse from "./components/HowToUse"

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-indigo-800">Welcome to the Test Case Plan Generator</h1>
      <HowToUse />
      <TestCasePlanGenerator />
    </div>
  )
}

