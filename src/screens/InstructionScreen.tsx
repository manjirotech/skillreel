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
    },
    {
      icon: Clock,
      title: "Keep each answer under 30 seconds, you can retake if needed",
    },
    {
      icon: Shield,
      title: "Your videos are stored securely",
    },
  ]

  const recordingTips = [
    {
      icon: Sun,
      title: "Face a window or light source",
    },
    {
      icon: Smartphone,
      title: "Hold your phone vertically (portrait mode)",
    },
    {
      icon: Target,
      title: "Keep your face centered in the frame with a clean, simple background",
    },
  ]

  return (
    <div className="relative min-h-screen bg-[url('../assets/background.png')] bg-cover bg-center"> {/* Removed flex flex-col and p-6 from main container */}
      <div className="overflow-y-auto p-6 pb-28"> {/* Content is scrollable, p-6 for original padding, pb-28 for space for fixed button */}
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-3 animate-fade-in-up">
            <h2 className="text-[1.5rem] font-black text-black mb-2 font-family-plus-jakarta">Ready to Share Your <span style={{ backgroundImage: "linear-gradient(91.63deg, #AC5EF8 56.26%, #833FD9 66.13%, #3B09A3 86.28%)" }} className="bg-clip-text text-transparent">Story?</span></h2>
            <p className="text-[#555555] font-semibold font-family-plus-jakarta">Here's how it works</p>
          </div>

          {/* How It Works Section */}
          <div className="mb-8">
            <div className="space-y-4">
              {howItWorks.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/30 rounded-lg p-4 border border-white/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      style={{ background: "linear-gradient(180deg, #7251D3 12.02%, #7D54DA 43.27%, #9A5DEB 73.56%, #AD63F6 90.38%)" }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors duration-300 animate-bounce-gentle"
                    >
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-black font-semibold font-family-poppins text-[0.875rem]">{item.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recording Tips Section */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-black mb-4 text-center animate-fade-in-up animation-delay-500 font-family-plus-jakarta">
              🎥 Recording Tips for Best Quality
            </h3>
            <div className="space-y-4">
              {recordingTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white/30 rounded-lg px-4 py-2 border border-white/50 hover:bg-white/40 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 5) * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      style={{ background: "linear-gradient(180deg, #7251D3 12.02%, #7D54DA 43.27%, #9A5DEB 73.56%, #AD63F6 90.38%)" }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors duration-300 animate-bounce-gentle"
                    >
                      <tip.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-black font-semibold font-family-poppins text-[0.875rem]">{tip.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Fixed Bottom Button Area */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200/30"> {/* Fixed positioning, z-index, removed background/blur */}
        <div className="w-full max-w-md mx-auto px-6 py-4 animate-fade-in-up animation-delay-1000"> {/* Centering, padding consistent with page content */}
          <AnimatedButton onClick={() => onNext(5)} variant="primary">
            <Play className="w-5 h-5 mr-2" />
            Start First Question
          </AnimatedButton>
        </div>
      </div>
    </div>
  )
}
