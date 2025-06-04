import { RotateCw } from "lucide-react"

interface OrientationOverlayProps {
  isPortrait: boolean
}

export default function OrientationOverlay({ isPortrait }: OrientationOverlayProps) {
  if (isPortrait) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl p-8 shadow-xl text-center max-w-sm w-full animate-fade-in">
        <RotateCw className="w-16 h-16 text-white mx-auto mb-6 animate-spin-slow" />
        <h2 className="text-xl font-bold text-white mb-4">Please Rotate Your Phone</h2>
        <p className="text-white/90 leading-relaxed">Please rotate your phone vertically for best video results 📱</p>
      </div>
    </div>
  )
}
