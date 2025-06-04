"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Square, RotateCcw, Check, Camera, Mic, AlertCircle, FlipHorizontal, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedButton from "./AnimatedButton"
import { useToast } from "@/components/ui/use-toast"
import { useIndexedDB } from "../hooks/useIndexedDB"

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void
  onRetake: () => void
  hasRecorded: boolean
  currentQuestion: number
  questionText: string
}

export default function VideoRecorder({
  onVideoRecorded,
  onRetake,
  hasRecorded,
  currentQuestion,
  questionText,
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canStopRecording, setCanStopRecording] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const recordedVideoRef = useRef<HTMLVideoElement>(null)
  const chunksRef = useRef<Blob[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { saveVideo, getVideo, isInitialized } = useIndexedDB()

  // Check browser support
  const isSupported =
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== "undefined"

  // Check if device has multiple cameras
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setHasMultipleCameras(videoDevices.length > 1)
      })
    }
  }, [])

  // Initialize camera
  const initializeCamera = async (mode: "user" | "environment" = facingMode) => {
    if (!isSupported) {
      setError("Your browser doesn't support video recording. Please use a modern mobile browser.")
      return
    }

    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    setIsInitializing(true)
    setError(null)
    setPermissionDenied(false)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      })

      setStream(mediaStream)
      setFacingMode(mode)

      // Wait for next tick to ensure video element is ready
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream
          videoRef.current.play().catch(console.error)
        }
      }, 100)
    } catch (err) {
      console.error("Error accessing camera:", err)
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionDenied(true)
          setError("Camera permission denied. Please allow camera access and refresh the page.")
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please make sure your device has a camera.")
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setError("Camera is already in use by another application. Please close other apps using the camera.")
        } else {
          setError("Unable to access camera. Please check your permissions and try again.")
        }
      }
    } finally {
      setIsInitializing(false)
    }
  }

  // Flip camera
  const flipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user"
    initializeCamera(newMode)
  }

  // Start recording
  const startRecording = () => {
    if (!stream) return

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4",
        videoBitsPerSecond: 1000000, // 1 Mbps - lower quality to save space
      })

      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        })
        setRecordedBlob(blob)

        // Create URL for preview
        const url = URL.createObjectURL(blob)
        setRecordedVideoUrl(url)
        setShowPreview(true)

        // Save to storage only if initialized
        if (isInitialized) {
          saveVideo(currentQuestion, blob)
            .then(() => {
              console.log("Video saved successfully")
              toast({
                title: "✅ Video Saved!",
                description: "Your video has been recorded successfully.",
              })
            })
            .catch((err) => {
              console.error("Error saving video:", err)
              toast({
                title: "❌ Storage Error",
                description: "Could not save your video. Please try again or use a different browser.",
                variant: "destructive",
              })
            })
        } else {
          console.warn("Storage not initialized, video not saved")
          toast({
            title: "⚠️ Storage Warning",
            description: "Video recorded but not saved. Storage is not ready.",
            variant: "destructive",
          })
        }

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }
      }

      recorder.start(1000) // Collect data in 1-second chunks
      setMediaRecorder(recorder)
      setIsRecording(true)
      setCanStopRecording(false)
      // Allow stopping after 3 seconds
      setTimeout(() => {
        setCanStopRecording(true)
      }, 3000)
      setRecordingTime(0)
      setIsFullscreen(true)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Failed to start recording. Please try again.")
      toast({
        title: "❌ Recording Error",
        description: "Failed to start recording. Please check your camera permissions.",
        variant: "destructive",
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording" && canStopRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsFullscreen(false)
      setCanStopRecording(false)
    }
  }

  // Handle retake
  const handleRetake = () => {
    // Clean up preview state
    setShowPreview(false)
    setRecordedBlob(null)
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
      setRecordedVideoUrl(null)
    }

    // Reset recording state
    setIsRecording(false)
    setIsFullscreen(false)
    setRecordingTime(0)

    // Call parent retake handler
    onRetake()

    // Reinitialize camera
    setTimeout(() => {
      initializeCamera()
    }, 100)
  }

  // Handle next
  const handleNext = () => {
    if (recordedBlob) {
      onVideoRecorded(recordedBlob)
    }
  }

  // Exit fullscreen
  const exitFullscreen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isRecording) {
      stopRecording()
    } else {
      setIsFullscreen(false)
    }
  }

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            // Force stop at 30 seconds regardless of minimum time
            if (mediaRecorder && mediaRecorder.state === "recording") {
              mediaRecorder.stop()
              setIsRecording(false)
              setIsFullscreen(false)
              setCanStopRecording(false)
            }
            return 30
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Load video from storage on mount - only when storage is ready
  useEffect(() => {
    if (!isInitialized) {
      // If storage not ready, just initialize camera
      if (!hasRecorded) {
        initializeCamera()
      }
      return
    }

    if (!hasRecorded) {
      getVideo(currentQuestion)
        .then((videoBlob) => {
          if (videoBlob) {
            setRecordedBlob(videoBlob)
            const url = URL.createObjectURL(videoBlob)
            setRecordedVideoUrl(url)
            setShowPreview(true)
          } else {
            initializeCamera()
          }
        })
        .catch((err) => {
          console.error("Error loading video:", err)
          initializeCamera()
        })
    } else {
      getVideo(currentQuestion)
        .then((videoBlob) => {
          if (videoBlob) {
            setRecordedBlob(videoBlob)
            const url = URL.createObjectURL(videoBlob)
            setRecordedVideoUrl(url)
            setShowPreview(true)
          }
        })
        .catch((err) => console.error("Error loading stored video:", err))
    }

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl)
      }
    }
  }, [isInitialized])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = (recordingTime / 30) * 100

  if (!isSupported) {
    return (
      <div className="bg-white/30 rounded-lg p-6 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-black mb-2">Browser Not Supported</h3>
        <p className="text-gray-700 text-sm mb-4">
          Please use a modern mobile browser like Chrome, Safari, or Firefox to record videos.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/30 rounded-lg p-6 text-center animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-black mb-2">
          {permissionDenied ? "Camera Permission Required" : "Camera Error"}
        </h3>
        <p className="text-gray-700 text-sm mb-4">{error}</p>
        {!permissionDenied && (
          <Button
            onClick={() => initializeCamera()}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
          >
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (showPreview && recordedVideoUrl) {
    return (
      <div className="space-y-6 animate-scale-in">
        {/* Modern Video Preview */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden aspect-[9/16] max-h-[70vh] shadow-2xl border border-white/10">
          <video
            ref={recordedVideoRef}
            src={recordedVideoUrl}
            controls
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onLoadedData={() => {
              // Ensure video is ready to play
              if (recordedVideoRef.current) {
                recordedVideoRef.current.currentTime = 0
              }
            }}
          />

          {/* Modern Success overlay */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-bounce-gentle shadow-lg backdrop-blur-sm">
            <Check className="w-4 h-4" />
            <span>Perfect! 🎉</span>
          </div>

          {/* Video quality indicator */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            HD Quality
          </div>

          {/* Gradient overlay for better button visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Modern Action buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleRetake}
            variant="outline"
            className="flex-1 h-14 hover:scale-105 transition-all duration-300 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 font-semibold"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retake Video
          </Button>
          <AnimatedButton onClick={handleNext} variant="primary" className="flex-1 h-14 rounded-2xl">
            <Check className="w-5 h-5 mr-2" />
            Continue Journey
          </AnimatedButton>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-black p-4 flex flex-col justify-center" : ""}`}
    >
      {/* Question text - only show when recording in fullscreen */}
      {isFullscreen && (
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white p-4 rounded-2xl text-center mb-4 z-10 flex-shrink-0 backdrop-blur-sm border border-white/20">
          <p className="text-sm font-medium leading-tight">{questionText}</p>
        </div>
      )}

      {/* Modern Camera Preview */}
      <div
        className={`relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden ${
          isFullscreen ? "flex-1 min-h-0" : "aspect-[9/16] max-h-[70vh]"
        } shadow-2xl border border-white/10`}
      >
        {isInitializing ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <div className="relative">
                <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
              </div>
              <p className="text-sm font-medium">Initializing camera...</p>
              <div className="mt-2 flex justify-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200" />
              </div>
            </div>
          </div>
        ) : stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              style={{
                display: "block",
                visibility: "visible",
                opacity: 1,
              }}
              onLoadedMetadata={() => {
                // Ensure video starts playing
                if (videoRef.current) {
                  videoRef.current.play().catch(console.error)
                }
              }}
            />

            {/* Modern Camera flip button */}
            {hasMultipleCameras && !isRecording && (
              <button
                onClick={flipCamera}
                className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 z-20"
                aria-label="Flip camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            )}

            {/* Recording overlay */}
            {isRecording && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Modern Recording indicator */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-pulse z-30 shadow-lg backdrop-blur-sm">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span>RECORDING</span>
                </div>

                {/* Modern Timer */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono z-30 backdrop-blur-sm border border-white/20">
                  {formatTime(recordingTime)} / 00:30
                </div>

                {/* Modern Circular progress */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 45}`}
                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                        className="transition-all duration-1000 ease-linear"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#EC4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-white font-bold text-xl">{30 - recordingTime}</span>
                        <div className="text-white/70 text-xs">seconds</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Minimum recording time indicator */}
                {!canStopRecording && (
                  <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-white/20">
                      Record for {3 - recordingTime} more seconds
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modern Face guide overlay */}
            {!isRecording && !isFullscreen && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="relative">
                  {/* Animated face guide */}
                  <div className="w-56 h-72 border-2 border-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative animate-pulse-gentle">
                    <div className="absolute inset-0 border-2 border-purple-400/50 rounded-full animate-ping" />
                    <div className="text-center z-10">
                      <div className="text-4xl mb-3 animate-bounce-gentle">😊</div>
                      <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                        <p className="text-sm font-medium">Center your face</p>
                        <p className="text-xs text-white/80">Look amazing!</p>
                      </div>
                    </div>
                  </div>

                  {/* Corner guides */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-purple-400 rounded-tl-lg animate-pulse-gentle" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-purple-400 rounded-tr-lg animate-pulse-gentle" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-purple-400 rounded-bl-lg animate-pulse-gentle" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-purple-400 rounded-br-lg animate-pulse-gentle" />

                  {/* Sparkle effects */}
                  <Sparkles className="absolute -top-8 -right-8 w-6 h-6 text-purple-400 animate-pulse" />
                  <Sparkles className="absolute -bottom-8 -left-8 w-4 h-4 text-pink-400 animate-pulse animation-delay-500" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <p className="text-sm font-medium mb-4">Camera not available</p>
              <Button
                onClick={() => initializeCamera()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 font-semibold"
              >
                <Camera className="w-4 h-4 mr-2" />
                Initialize Camera
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Recording Controls */}
      <div className={`text-center space-y-4 ${isFullscreen ? "flex-shrink-0" : ""}`}>
        {!isRecording ? (
          <AnimatedButton
            onClick={startRecording}
            disabled={!stream || isInitializing}
            variant="primary"
            className="h-16 text-lg font-semibold rounded-2xl"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Recording
          </AnimatedButton>
        ) : (
          <Button
            onClick={stopRecording}
            disabled={!canStopRecording}
            className={`w-full h-16 ${
              canStopRecording
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                : "bg-gray-400 cursor-not-allowed"
            } text-white rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-lg shadow-lg`}
          >
            <Square className="w-6 h-6 mr-3" />
            {canStopRecording ? "Stop Recording" : `Record for ${3 - recordingTime} more seconds`}
          </Button>
        )}

        {/* Modern Permission indicators */}
        {stream && !isFullscreen && !isRecording && (
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-full">
              <Camera className="w-4 h-4" />
              <span className="font-medium">Camera Ready</span>
            </div>
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-full">
              <Mic className="w-4 h-4" />
              <span className="font-medium">Audio Ready</span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Exit fullscreen button */}
      {isFullscreen && (
        <button
          onClick={exitFullscreen}
          className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 z-50"
          aria-label="Exit fullscreen"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
