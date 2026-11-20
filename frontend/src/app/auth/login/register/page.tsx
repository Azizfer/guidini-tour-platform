"use client"
import { useRouter } from "next/navigation"
import SignUpProcess from "@/components/sign-up-process"

export default function RegisterPage() {
  const router = useRouter()

  const handleBackToSignIn = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-white">
      <SignUpProcess onBackToSignIn={handleBackToSignIn} />
    </div>
  )
}
