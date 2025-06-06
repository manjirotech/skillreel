import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[url('../assets/background.png')] bg-cover bg-center flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-purple-300 rounded-full animate-ping mx-auto"></div>
        </div>
        <div className="bg-white/30 rounded-lg p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-black mb-2">Loading next question...</h3>
          <p className="text-gray-700">Keep it real, keep it short. ✨</p>
        </div>
      </div>
    </div>
  )
}
