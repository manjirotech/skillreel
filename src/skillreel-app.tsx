"use client"

import { useState, useEffect } from "react"
import { useAppState } from "./hooks/useLocalStorage"
import OrientationOverlay from "./components/OrientationOverlay"
import WelcomeScreen from "./screens/WelcomeScreen"
import PersonalInfoScreen from "./screens/PersonalInfoScreen"
import MediaUploadScreen from "./screens/MediaUploadScreen"
import InstructionScreen from "./screens/InstructionScreen"
import QuestionScreen from "./screens/QuestionScreen"
import LoadingScreen from "./screens/LoadingScreen"
import ThankYouScreen from "./screens/ThankYouScreen"
import DesktopBlockScreen from "./screens/DesktopBlockScreen"
import { Toaster } from "./components/Toaster"
import { QUESTIONS } from "./constants/data"
import { useIndexedDB } from "./hooks/useIndexedDB"

export default function SkillreelApp() {
  // Use localStorage hook for persistent state
  const {
    currentScreen,
    setCurrentScreen,
    userInfo,
    setUserInfo,
    uploadedImages,
    setUploadedImages,
    currentQuestion,
    setCurrentQuestion,
    clearStoredData,
  } = useAppState()

  // IndexedDB for video storage
  const { clearAllVideos } = useIndexedDB()

  // Local state for non-persistent data
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const [isPortrait, setIsPortrait] = useState(true)

  // Device and orientation detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight

      setIsMobile(isMobileDevice || screenWidth < 768)
      setIsPortrait(screenHeight > screenWidth)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    window.addEventListener("orientationchange", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", checkDevice)
    }
  }, [])

  // Confetti effect
  useEffect(() => {
    if (currentScreen === 7) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

  // Auto-save current screen to localStorage
  useEffect(() => {
    setCurrentScreen(currentScreen)
  }, [currentScreen, setCurrentScreen])

  const handleScreenTransition = (nextScreen: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScreen(nextScreen)
      setIsTransitioning(false)
    }, 300)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < QUESTIONS.length) {
      setIsLoading(true)
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1)
        setIsLoading(false)
        handleScreenTransition(5)
      }, 2000)
      handleScreenTransition(6)
    } else {
      handleScreenTransition(7)
    }
  }

  const handleReset = () => {
    // Clear all localStorage data
    clearStoredData()

    // Clear all videos from IndexedDB
    clearAllVideos().catch((err) => console.error("Error clearing videos:", err))

    // Reset local state
    setIsLoading(false)
    setShowConfetti(false)
    setIsTransitioning(false)
  }

  // Desktop blocking
  if (!isMobile) {
    return <DesktopBlockScreen />
  }

  // Screen routing with orientation overlay
  const renderScreen = () => {
    const screenProps = {
      onNext: handleScreenTransition,
      userInfo,
      setUserInfo,
      uploadedImages,
      setUploadedImages,
      currentQuestion,
      setCurrentQuestion,
    }

    switch (currentScreen) {
      case 1:
        return <WelcomeScreen onNext={handleScreenTransition} />
      case 2:
        return <PersonalInfoScreen {...screenProps} />
      case 3:
        return <MediaUploadScreen {...screenProps} />
      case 4:
        return <InstructionScreen onNext={handleScreenTransition} />
      case 5:
        return (
          <QuestionScreen
            onNext={handleScreenTransition}
            currentQuestion={currentQuestion}
            onNextQuestion={handleNextQuestion}
          />
        )
      case 6:
        return <LoadingScreen />
      case 7:
        return <ThankYouScreen showConfetti={showConfetti} currentQuestion={currentQuestion} onReset={handleReset} />
      default:
        return <WelcomeScreen onNext={handleScreenTransition} />
    }
  }

  return (
    <div className={`transition-all duration-300 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      <OrientationOverlay isPortrait={isPortrait} />
      {renderScreen()}
      <Toaster />
    </div>
  )
}
