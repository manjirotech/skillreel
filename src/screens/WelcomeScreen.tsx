"use client"

import { Play, Rocket } from "lucide-react"
import { useEffect } from "react"
import AnimatedButton from "../components/AnimatedButton"

interface WelcomeScreenProps {
  onNext: (screen: number) => void
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  // Show a welcome back message if user has data in localStorage
  useEffect(() => {
    const hasStoredData =
      localStorage.getItem("gpc_userInfo") ||
      localStorage.getItem("gpc_uploadedImages") ||
      localStorage.getItem("gpc_currentScreen")

    if (hasStoredData) {
      const storedScreen = localStorage.getItem("gpc_currentScreen")
      if (storedScreen && Number.parseInt(storedScreen) > 1) {
        // Show a brief "Welcome back" message
        const welcomeBack = confirm("Welcome back! Would you like to continue where you left off?")
        if (welcomeBack) {
          onNext(Number.parseInt(storedScreen))
        } else {
          // Clear localStorage if they want to start fresh
          localStorage.removeItem("gpc_currentScreen")
          localStorage.removeItem("gpc_userInfo")
          localStorage.removeItem("gpc_uploadedImages")
          localStorage.removeItem("gpc_currentQuestion")
          localStorage.removeItem("gpc_hasRecorded")
        }
      }
    }
  }, [onNext])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-blue-200 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-4xl font-bold">
            <span className="text-purple-600">GLOBAL</span> <span className="text-black">PAY CHEQUE</span>
          </h1>
          <p className="text-gray-700 text-lg">Where Skills Become Salary Stories</p>
        </div>

        {/* Animated Play Button */}
        <div className="flex justify-center animate-fade-in-up animation-delay-200">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer animate-bounce-slow">
              <Play className="w-12 h-12 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up animation-delay-400">
          <AnimatedButton onClick={() => onNext(2)} variant="primary">
            <Rocket className="w-5 h-5 mr-2" />
            Start your journey
          </AnimatedButton>
        </div>

        {/* Data persistence notice */}
        <div className="animate-fade-in-up animation-delay-600">
          <p className="text-xs text-gray-600 bg-white/30 rounded-lg p-3">
            💾 Your progress is automatically saved. You can continue anytime!
          </p>
        </div>
      </div>
    </div>
  )
}
