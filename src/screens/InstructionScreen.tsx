"use client"

import { Play, MessageSquare, Clock, RotateCcw, Shield, Sun, Smartphone, Target, Palette } from "lucide-react"
import AnimatedButton from "../components/AnimatedButton"

interface InstructionScreenProps {
  onNext: (screen: number) => void
}

export default function InstructionScreen({ onNext }: InstructionScreenProps) {
  const howItWorks = [
    {
      icon: MessageSquare,
      title: "You'll answer 5 quick questions",
      desc: "Each one is crafted to highlight your real skills and story.",
      mockup: "Q1, Q2, Q3, Q4, Q5",
    },
    {
      icon: Clock,
      title: "Keep each answer under 30 seconds",
      desc: "Be concise, authentic, and speak from the heart.",
      mockup: "⏱️ 00:30",
    },
    {
      icon: RotateCcw,
      title: "You can retake or skip any question",
      desc: "No pressure – make it feel right for you.",
      mockup: "↻ Retake | ⏭️ Skip",
    },
    {
      icon: Shield,
      title: "Your videos are stored securely",
      desc: "Privacy and safety are our top priorities.",
      mockup: "🔒 Encrypted",
    },
  ]

  const recordingTips = [
    {
      icon: Sun,
      title: "Face a window or light source",
      desc: "Natural light = glowing you. Avoid light behind you.",
      mockup: "☀️ → 📱",
    },
    {
      icon: Smartphone,
      title: "Hold your phone vertically (portrait mode)",
      desc: "No tripod needed – just your hand and confidence.",
      mockup: "📱 |",
    },
    {
      icon: Target,
      title: "Keep your face centered in the frame",
      desc: "Make sure we can see and hear you clearly.",
      mockup: "⭕ 😊",
    },
    {
      icon: Palette,
      title: "Use a clean, simple background",
      desc: "Avoid clutter so all focus stays on you.",
      mockup: "🎨 Simple",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-blue-200 p-6 py-12 overflow-y-auto">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-black mb-2">Ready to Share Your Story?</h2>
          <p className="text-gray-700">Here's how it works</p>
        </div>

        {/* How It Works Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-black mb-4 text-center animate-fade-in-up animation-delay-100">
            📋 How It Works – Before You Start
          </h3>
          <div className="space-y-4">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="bg-white/30 rounded-lg p-4 border border-white/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors duration-300 animate-bounce-gentle">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-black font-semibold">{item.title}</p>
                      <div className="bg-purple-100 text-purple-800 text-xs font-mono px-2 py-1 rounded border">
                        {item.mockup}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Tips Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-black mb-4 text-center animate-fade-in-up animation-delay-500">
            🎥 Recording Tips for Best Quality
          </h3>
          <div className="space-y-4">
            {recordingTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/30 rounded-lg p-4 border border-white/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${(index + 5) * 100}ms` }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors duration-300 animate-bounce-gentle">
                    <tip.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-black font-semibold">{tip.title}</p>
                      <div className="bg-blue-100 text-blue-800 text-xs font-mono px-2 py-1 rounded border">
                        {tip.mockup}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UI Preview Section */}
        <div className="mb-8 animate-fade-in-up animation-delay-900">
          <h3 className="text-lg font-bold text-black mb-4 text-center">📱 What You'll See</h3>
          <div className="bg-white/20 rounded-2xl p-4 border border-white/50">
            {/* Mock phone interface */}
            <div className="bg-black rounded-2xl p-4 mx-auto max-w-48">
              <div className="bg-gradient-to-b from-purple-400 to-blue-400 rounded-xl p-3 text-white text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center animate-bounce-slow">
                  <Play className="w-8 h-8 text-white" fill="white" />
                </div>
                <p className="text-xs font-semibold mb-1">Question 1 of 10</p>
                <p className="text-xs opacity-90">Tell us about yourself...</p>
                <div className="mt-2 bg-white/20 rounded-lg p-2">
                  <p className="text-xs">🔴 Recording: 15s</p>
                </div>
              </div>
            </div>
            <p className="text-center text-black text-sm mt-3 font-medium">Simple, clean, and focused on you! ✨</p>
          </div>
        </div>

        {/* Start Button */}
        <div className="animate-fade-in-up animation-delay-1000">
          <AnimatedButton onClick={() => onNext(5)} variant="primary">
            <Play className="w-5 h-5 mr-2" />
            Start First Question
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
