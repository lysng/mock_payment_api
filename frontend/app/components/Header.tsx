import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Test Case Plan Generator
          </Link>
          <div className="space-x-4">
            <Link href="/how-to-use" className="hover:underline">
              How to Use
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

