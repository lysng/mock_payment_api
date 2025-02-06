"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface InputFormProps {
  onSubmit: (requirement: string, apiSpec: string, existingTestCases: string) => void
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [requirement, setRequirement] = useState("")
  const [apiSpec, setApiSpec] = useState("")
  const [existingTestCases, setExistingTestCases] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(requirement, apiSpec, existingTestCases)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="requirement" className="block text-sm font-medium text-gray-700">
          Business Requirement
        </label>
        <Textarea
          id="requirement"
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="Enter the business requirement here..."
          className="mt-1"
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="apiSpec" className="block text-sm font-medium text-gray-700">
          API Specification (optional)
        </label>
        <Textarea
          id="apiSpec"
          value={apiSpec}
          onChange={(e) => setApiSpec(e.target.value)}
          placeholder="Enter the API specification here..."
          className="mt-1"
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="existingTestCases" className="block text-sm font-medium text-gray-700">
          Existing Test Cases (optional)
        </label>
        <Textarea
          id="existingTestCases"
          value={existingTestCases}
          onChange={(e) => setExistingTestCases(e.target.value)}
          placeholder="Enter any existing test cases here..."
          className="mt-1"
          rows={4}
        />
      </div>
      <Button type="submit">Generate Test Case Plan</Button>
    </form>
  )
}

