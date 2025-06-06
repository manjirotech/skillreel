"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Play,
  RotateCcw,
  Check,
  Camera,
  Mic,
  AlertCircle,
  FlipHorizontal,
  Sparkles,
  StopCircle,
  X,
  PlayCircle,
} from "lucide-react"
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
  const [showFullPreview, setShowFullPreview] = useState(false) // New state for full preview
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null) // New state for thumbnail
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canStopRecording, setCanStopRecording] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const recordedVideoRef = useRef<HTMLVideoElement>(null)
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null) // New ref for thumbnail generation
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

  // Generate thumbnail from video
  const generateThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      video.crossOrigin = "anonymous"
      video.currentTime = 0.1 // Get frame at 0.1 seconds

      video.onloadeddata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob)
              resolve(thumbnailUrl)
            } else {
              reject(new Error("Could not generate thumbnail"))
            }
          },
          "image/jpeg",
          0.8,
        )
      }

      video.onerror = () => reject(new Error("Video load error"))
      video.src = videoUrl
      video.load()
    })
  }

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
        videoBitsPerSecond: 1000000,
      })

      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("event.data", event.data)
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        })
        setRecordedBlob(blob)

        // Create URL for preview
        const url = URL.createObjectURL(blob)
        setRecordedVideoUrl(url)

        // Generate thumbnail
        try {
          const thumbUrl = await generateThumbnail(url)
          setThumbnailUrl(thumbUrl)
        } catch (err) {
          console.error("Error generating thumbnail:", err)
        }

        setShowPreview(true)
        setShowFullPreview(false) // Start with thumbnail view

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
    setShowFullPreview(false)
    setRecordedBlob(null)
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
      setRecordedVideoUrl(null)
    }
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl)
      setThumbnailUrl(null)
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

  // Open full preview
  const openFullPreview = () => {
    setShowFullPreview(true)
  }

  // Close full preview
  const closeFullPreview = () => {
    setShowFullPreview(false)
  }

  // Close preview and return to camera
  const closePreview = () => {
    setShowPreview(false)
    setShowFullPreview(false)
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
      setRecordedVideoUrl(null)
    }
    if (thumbnailUrl) {
      URL.revokeObjectURL(thumbnailUrl)
      setThumbnailUrl(null)
    }
    setRecordedBlob(null)

    // Reinitialize camera
    setTimeout(() => {
      initializeCamera()
    }, 100)
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
        .then(async (videoBlob) => {
          if (videoBlob) {
            setRecordedBlob(videoBlob)
            const url = URL.createObjectURL(videoBlob)
            setRecordedVideoUrl(url)

            // Generate thumbnail for existing video
            try {
              const thumbUrl = await generateThumbnail(url)
              setThumbnailUrl(thumbUrl)
            } catch (err) {
              console.error("Error generating thumbnail:", err)
            }

            setShowPreview(true)
            setShowFullPreview(false)
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
        .then(async (videoBlob) => {
          if (videoBlob) {
            setRecordedBlob(videoBlob)
            const url = URL.createObjectURL(videoBlob)
            setRecordedVideoUrl(url)

            // Generate thumbnail for existing video
            try {
              const thumbUrl = await generateThumbnail(url)
              setThumbnailUrl(thumbUrl)
            } catch (err) {
              console.error("Error generating thumbnail:", err)
            }

            setShowPreview(true)
            setShowFullPreview(false)
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
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl)
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

  console.log("recordedVideoUrl", recordedVideoUrl)

  // Full Preview Modal
  if (showFullPreview && recordedVideoUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md mx-auto">
          {/* Modern Close button */}
          <button
            onClick={closeFullPreview}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Full Video Preview */}
          <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden aspect-[9/16] shadow-2xl border border-white/10">
            <video
              ref={recordedVideoRef}
              src={recordedVideoUrl}
              controls
              className="w-full h-full object-cover"
              playsInline
              preload="metadata"
              controlsList="nodownload"
              autoPlay
              onLoadedData={() => {
                if (recordedVideoRef.current) {
                  recordedVideoRef.current.currentTime = 0
                }
              }}
            />

            {/* Success overlay */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-bounce-gentle shadow-lg backdrop-blur-sm">
              <Check className="w-4 h-4" />
              <span>Recorded! 🎉</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Thumbnail Preview - Modern Rectangular Block
  if (showPreview && thumbnailUrl && !showFullPreview) {
    return (
      <div className="space-y-4 animate-scale-in">
        {/* Modern Rectangular Preview Block */}
        <div
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden" onClick={openFullPreview}>
            <img
              src={thumbnailUrl || "/placeholder.svg"}
              alt="Video thumbnail"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors duration-300">
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <PlayCircle className="w-12 h-12 text-gray-800" />
              </div>
            </div>

            {/* Success badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 shadow-lg">
              <Check className="w-3 h-3" />
              <span>Recorded</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Success message */}
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-semibold">Video recorded successfully!</span>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRetake()
                }}
                variant="outline"
                className="flex-1 h-12 hover:scale-105 transition-all duration-300 rounded-xl border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-semibold"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <AnimatedButton
                onClick={() => {
                  handleNext()
                }}
                variant="primary"
                className="flex-1 h-12"
              >
                <Check className="w-4 h-4 mr-2" />
                Next
              </AnimatedButton>
            </div>
          </div>

          {/* Click hint */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Tap to preview
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-black p-4 flex flex-col justify-center" : "max-w-md mx-auto"}`}
    >
      {/* Question text - only show when recording in fullscreen */}
      {isFullscreen && (
        <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 text-white p-4 rounded-2xl text-center mb-4 z-10 flex-shrink-0 backdrop-blur-sm border border-white/20">
          <p className="text-sm font-medium leading-tight">{questionText}</p>
        </div>
      )}

      {/* Compact Modern Camera Preview */}
      <div
        className={`relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden ${isFullscreen ? "flex-1 min-h-0" : "aspect-[4/3] max-h-[50vh]"
          } shadow-xl border border-white/10 mx-auto max-w-md`}
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
                  {formatTime(recordingTime)} 
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
              </div>
            )}

            {/* Compact Face guide overlay */}
            {!isRecording && !isFullscreen && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="relative">
                  {/* Compact Animated face guide */}
                  <div className="w-40 h-48 border-2 border-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative animate-pulse-gentle">
                    <div className="absolute inset-0 border-2 border-purple-400/50 rounded-full animate-ping" />
                    <div className="text-center z-10">
                      <div className="text-3xl mb-2 animate-bounce-gentle">😊</div>
                      <div className="bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <p className="text-xs font-medium">Center your face</p>
                        <p className="text-xs text-white/80">Look amazing!</p>
                      </div>
                    </div>
                  </div>

                  {/* Compact Corner guides */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-purple-400 rounded-tl-lg animate-pulse-gentle" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-purple-400 rounded-tr-lg animate-pulse-gentle" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-purple-400 rounded-bl-lg animate-pulse-gentle" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-purple-400 rounded-br-lg animate-pulse-gentle" />

                  {/* Compact Sparkle effects */}
                  <Sparkles className="absolute -top-6 -right-6 w-4 h-4 text-purple-400 animate-pulse" />
                  <Sparkles className="absolute -bottom-6 -left-6 w-3 h-3 text-pink-400 animate-pulse animation-delay-500" />
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
      <div
        className={`text-center ${isFullscreen ? "flex-shrink-0 space-y-4" : "sticky bottom-0 z-20 py-0 space-y-4 w-full"
          }`}
      >
        {!isRecording ? (
          <AnimatedButton
            onClick={startRecording}
            disabled={!stream || isInitializing}
            variant="primary"
            className="h-12 text-lg font-semibold rounded-md w-full max-w-xs mx-auto"
          >
            <Play className="w-6 h-6 mr-3" />
            Start Recording
          </AnimatedButton>
        ) : (
          <Button
            onClick={stopRecording}
            disabled={!canStopRecording}
            className={`w-full h-16 ${canStopRecording
                ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                : "bg-gray-400 cursor-not-allowed"
              } text-white rounded-md transition-all duration-300 hover:scale-105 active:scale-95 font-semibold text-lg shadow-lg`}
          >
            <StopCircle width={24} height={24} className="mr-1" />
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
    </div>
  )
}
