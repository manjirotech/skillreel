"use client"

import {
  UserRound,
  Briefcase,
  DollarSign,
  Lightbulb,
  Building,
  GraduationCap,
  Clock,
  TrendingUp,
  History,
  Users,
  SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import VideoRecorder from "../components/VideoRecorder"
import { QUESTIONS, OPTIONAL_QUESTIONS } from "../constants/data"
import { useVideoRecording } from "../hooks/useVideoRecording"
import type { ScreenProps } from "../types"

interface QuestionScreenProps extends Pick<ScreenProps, "onNext" | "currentQuestion"> {
  onNextQuestion: () => void
}

export default function QuestionScreen({ onNext, currentQuestion, onNextQuestion }: QuestionScreenProps) {
  // Zero-based index for the current question
  const questionIndex = currentQuestion - 1

  // Check if current question is optional (5th and 7th questions - indices 4 and 6)
  const isOptionalQuestion = OPTIONAL_QUESTIONS.includes(questionIndex)

  // Video recording hook
  const { hasRecorded, handleVideoRecorded, handleRetake } = useVideoRecording({
    currentQuestion,
    onVideoRecorded: (blob) => {
      console.log(`Video recorded for question ${currentQuestion}:`, blob)
      // Move to next question after recording
      onNextQuestion()
    },
  })

  // Get the appropriate icon for the current question
  const getQuestionIcon = () => {
    switch (questionIndex) {
      case 0:
        return <UserRound className="w-12 h-12 text-white" />
      case 1:
        return <Briefcase className="w-12 h-12 text-white" />
      case 2:
        return <DollarSign className="w-12 h-12 text-white" />
      case 3:
        return <Lightbulb className="w-12 h-12 text-white" />
      case 4:
        return <Building className="w-12 h-12 text-white" />
      case 5:
        return <GraduationCap className="w-12 h-12 text-white" />
      case 6:
        return <Clock className="w-12 h-12 text-white" />
      case 7:
        return <TrendingUp className="w-12 h-12 text-white" />
      case 8:
        return <History className="w-12 h-12 text-white" />
      case 9:
        return <Users className="w-12 h-12 text-white" />
      default:
        return <UserRound className="w-12 h-12 text-white" />
    }
  }
  console.log(`Progress Debug: currentQuestion=${currentQuestion}, totalQuestions=${QUESTIONS.length}, value=${(currentQuestion / QUESTIONS.length) * 100}`)

  return (
    <div className="min-h-screen bg-[url('../assets/background.png')] bg-cover bg-center p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-2 animate-fade-in-up">
          <div className="bg-white/30 rounded-lg p-4 hover:bg-white/40 transition-colors duration-300">
            <div className="flex justify-between items-center mb-3">
              <span className="text-black font-semibold text-sm font-family-poppins">
                Question {currentQuestion} of {QUESTIONS.length}
              </span>
              <span style={{ backgroundImage: "linear-gradient(91.63deg, #AC5EF8 56.26%, #833FD9 66.13%, #3B09A3 86.28%)" }} className="bg-clip-text text-transparent font-black font-family-plus-jakarta">{Math.round((currentQuestion / QUESTIONS.length) * 100)}%</span>
            </div>
            <Progress
              value={(currentQuestion / QUESTIONS.length) * 100}
              className="h-2 rounded-full bg-slate-200 [&>div]:bg-purple-600"
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-4 animate-fade-in-up animation-delay-200">
          <div className="bg-white/30 rounded-lg p-2 px-4 hover:bg-white/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-2 gap-[0.2rem]">
              <div
                style={{ background: "linear-gradient(180deg, #7251D3 12.02%, #7D54DA 43.27%, #9A5DEB 73.56%, #AD63F6 90.38%)" }}
                className="w-10 h-10 p-2 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors duration-300 animate-bounce-gentle"
              >
                {getQuestionIcon()}
              </div>
              <h2 className="text-[1rem] font-bold text-black leading-relaxed font-family-plus-jakarta">{QUESTIONS[questionIndex]}</h2>
            </div>

            {/* Optional question badge */}
            {isOptionalQuestion && (
              <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-purple-400">
                Optional Question
              </div>
            )}
          </div>
        </div>

        {/* Video Recording Area */}
        <div className="space-y-2 animate-fade-in-up animation-delay-400">
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onRetake={handleRetake}
            hasRecorded={hasRecorded}
            currentQuestion={currentQuestion}
            questionText={QUESTIONS[questionIndex]}
          />
        </div>

        {/* Skip button - only show for optional questions (5th and 7th) */}
        {isOptionalQuestion && (
          <div className="text-center mt-3 animate-fade-in animation-delay-600">
            <Button
              onClick={onNextQuestion}
              variant="secondary"
              className="transition-all duration-300 hover:scale-105 bg-purple-200 text-purple-800 hover:bg-purple-300 hover:text-purple-900"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip this optional question
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
