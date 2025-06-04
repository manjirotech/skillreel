"use client"

import { CheckCircle, Copy, Users, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedButton from "../components/AnimatedButton"
import Confetti from "../components/Confetti"

interface ThankYouScreenProps {
  showConfetti: boolean
  currentQuestion: number
  onReset: () => void
}

export default function ThankYouScreen({ showConfetti, currentQuestion, onReset }: ThankYouScreenProps) {
  const handleStartOver = () => {
    const confirmReset = confirm("Are you sure you want to start over? This will clear all your progress.")
    if (confirmReset) {
      onReset()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-blue-200 flex flex-col items-center justify-center p-6">
      {showConfetti && <Confetti />}

      <div className="w-full max-w-md text-center space-y-8">
        <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-bounce-in hover:scale-110 transition-transform duration-300">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <div className="bg-white/30 rounded-lg p-6 animate-fade-in-up animation-delay-200 hover:bg-white/40 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-black mb-4">🎉 Thank you for sharing your journey! 🎉</h2>
          <p className="text-gray-700 leading-relaxed">
            You're inspiring the next generation of global achievers. Your story matters! ✨
          </p>
        </div>

        <div className="space-y-4 animate-fade-in-up animation-delay-400">
          <AnimatedButton variant="secondary">
            <Copy className="w-5 h-5 mr-2" />
            Copy Your Success Link
          </AnimatedButton>

          <Button
            variant="outline"
            className="w-full h-12 border-black text-black hover:bg-black hover:text-white rounded-full hover:scale-105 transition-all duration-300"
          >
            <Users className="w-4 h-4 mr-2" />
            Invite Others to Share
          </Button>
        </div>

        <div className="bg-white/30 rounded-lg p-4 animate-fade-in-up animation-delay-600 hover:bg-white/40 transition-colors duration-300">
          <div className="flex items-center justify-center space-x-6 text-black">
            <div className="text-center hover:scale-110 transition-transform duration-300">
              <div className="text-xl font-bold">🏆</div>
              <div className="text-xs">Complete</div>
            </div>
            <div className="text-center hover:scale-110 transition-transform duration-300">
              <div className="text-xl font-bold">{currentQuestion}</div>
              <div className="text-xs">Questions</div>
            </div>
            <div className="text-center hover:scale-110 transition-transform duration-300">
              <div className="text-xl font-bold">💎</div>
              <div className="text-xs">Skills</div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartOver}
          variant="ghost"
          className="text-gray-700 hover:text-black hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Another Journey
        </Button>

        {/* Data cleared notice */}
        <div className="animate-fade-in-up animation-delay-1000">
          <p className="text-xs text-gray-600 bg-white/20 rounded-lg p-2">
            🗑️ Starting over will clear all saved progress
          </p>
        </div>
      </div>
    </div>
  )
}
