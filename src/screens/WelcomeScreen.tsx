"use client"

import { Play, Rocket } from "lucide-react"
import { useEffect } from "react"
import AnimatedButton from "../components/AnimatedButton"
import Image from "next/image"
import play_3d from "../assets/play_3d.svg"

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[url('../assets/background.png')] bg-cover bg-center">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4 animate-fade-in-up mb-0">
          <h1 className="text-4xl font-bold font-family-cooper-black text-center">
            <span style={{ backgroundImage: "linear-gradient(279.25deg, #7251D3 44.46%, #7D54DA 59.61%, #9A5DEB 74.3%, #AD63F6 82.46%)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>GLOBAL</span> <span className="text-black">PAY CHEQUE</span>
          </h1>
          <p className="text-gray-700 text-lg font-family-poppins">Where Skills Become Salary Stories</p>
        </div>

        {/* Animated Play Button */}
        <div className="flex justify-center animate-fade-in-up animation-delay-100 mb-0">
          <div className="relative">
            <div className="w-48 h-48 rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer animate-bounce-slow">
              <Image src={play_3d} alt="Play" width={192} height={192} className="object-contain" />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up animation-delay-400">
          <AnimatedButton onClick={() => onNext(2)} variant="primary" className="font-family-poppins">
            <Rocket className="w-5 h-5 mr-2" />
            Start your journey
          </AnimatedButton>
        </div>

        {/* Data persistence notice */}
        <div className="animate-fade-in-up animation-delay-600">
          <p className="text-xs text-gray-600 bg-white/30 rounded-lg p-3 font-family-poppins">
            Your progress is automatically saved. You can continue anytime!
          </p>
        </div>
      </div>
    </div>
  )
}
