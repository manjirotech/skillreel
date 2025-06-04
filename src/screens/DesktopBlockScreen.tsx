import { Monitor, Smartphone, X, RotateCcw, ExternalLink, Heart } from "lucide-react"

export default function DesktopBlockScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-400 to-blue-400 flex items-center justify-center p-4 overflow-auto relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-float"
            style={{
              width: `${Math.random() * 60 + 30}px`,
              height: `${Math.random() * 60 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 4}s`,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-r from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left side - Main content */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl animate-scale-in-bounce">
            {/* Header with animated emoji */}
            <div className="text-center mb-6 animate-fade-in-up">
              <div className="text-5xl mb-3 animate-bounce-gentle">🤳</div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 animate-slide-in-left animation-delay-200">
                Hey Rockstar! One Quick Thing…
              </h1>
            </div>

            {/* Main content */}
            <div className="space-y-4 text-white text-center">
              {/* Love laptops section */}
              <div className="animate-fade-in-up animation-delay-400">
                <p className="text-lg font-semibold mb-1">We love laptops.</p>
                <p className="text-base">
                  Just… not for this <span className="text-xl animate-wiggle inline-block">😅</span>
                </p>
              </div>

              {/* Explanation */}
              <div className="bg-white/10 rounded-2xl p-4 animate-fade-in-up animation-delay-600">
                <p className="text-base leading-relaxed mb-2">
                  To record your <span className="font-bold text-yellow-300">Skillreel</span>, you gotta use your phone.
                </p>
                <p className="text-sm text-white/90">
                  Why? It's quicker, clearer, and let's be real — you look fab in portrait mode.
                </p>
              </div>

              {/* Footer */}
              <div className="animate-fade-in-up animation-delay-800">
                <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl p-4 border border-white/20">
                  <p className="text-base font-semibold mb-1">
                    That's it. <span className="text-yellow-300">Mobile magic only.</span>
                  </p>
                  <p className="text-sm flex items-center justify-center space-x-2">
                    <span>See you there!</span>
                    <Heart className="w-4 h-4 text-pink-300 animate-pulse-gentle" />
                    <span className="text-lg">💜</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Animated laptop icon */}
            <div className="absolute -top-4 -right-4 animate-float">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Monitor className="w-6 h-6 text-white animate-pulse-gentle" />
              </div>
            </div>
          </div>

          {/* Right side - Instructions */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl animate-scale-in-bounce animation-delay-300">
            <h3 className="text-xl font-bold mb-4 text-yellow-300 text-center animate-fade-in-up animation-delay-600">
              So here's the drill:
            </h3>
            <div className="space-y-3">
              {[
                { icon: X, text: "Close this tab", emoji: "🧹" },
                { icon: Smartphone, text: "Grab your phone", emoji: "📱" },
                { icon: RotateCcw, text: "Open the same link", emoji: "🔁" },
                { icon: ExternalLink, text: "Look awesome. Record confidently.", emoji: "🎬" },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-slide-in-right text-white"
                  style={{ animationDelay: `${(index + 8) * 100}ms` }}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 font-medium text-sm">{step.text}</span>
                  <span className="text-lg animate-bounce-gentle" style={{ animationDelay: `${index * 200}ms` }}>
                    {step.emoji}
                  </span>
                </div>
              ))}
            </div>

            {/* Animated phone icon */}
            <div className="absolute -bottom-4 -left-4 animate-float animation-delay-1000">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white animate-bounce-gentle" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="text-center mt-8 animate-fade-in-up animation-delay-1200">
          <div className="flex items-center justify-center space-x-2 text-white/80 text-sm">
            <span>GLOBAL PAY CHEQUE</span>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-gentle" />
            <span>Mobile Experience</span>
          </div>
        </div>
      </div>
    </div>
  )
}
