"use client"

import { useState, useCallback, useEffect } from "react"
import { useIndexedDB } from "./useIndexedDB"

interface UseVideoRecordingProps {
  currentQuestion: number
  onVideoRecorded?: (blob: Blob) => void
}

export function useVideoRecording({ currentQuestion, onVideoRecorded }: UseVideoRecordingProps) {
  const [hasRecorded, setHasRecorded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const {
    getVideo,
    saveVideo,
    deleteVideo,
    clearAllVideos: clearAllVideosFromStorage,
    isSupported,
    isInitialized,
  } = useIndexedDB()

  // Check if video exists in storage
  const checkStoredVideo = useCallback(async () => {
    if (!isInitialized) {
      return false
    }

    try {
      const video = await getVideo(currentQuestion)
      return !!video
    } catch (error) {
      console.error("Error checking stored video:", error)
      return false
    }
  }, [currentQuestion, getVideo, isInitialized])

  // Initialize hasRecorded state based on stored video - only when storage is ready
  useEffect(() => {
    if (isInitialized) {
      checkStoredVideo().then((hasVideo) => {
        setHasRecorded(hasVideo)
      })
    }
  }, [checkStoredVideo, isInitialized])

  // Handle video recorded
  const handleVideoRecorded = useCallback(
    (blob: Blob) => {
      setHasRecorded(true)
      setIsRecording(false)

      // Only save if storage is initialized
      if (isInitialized) {
        saveVideo(currentQuestion, blob)
          .then(() => {
            console.log("Video saved successfully")
            onVideoRecorded?.(blob)
          })
          .catch((error) => {
            console.error("Error saving video:", error)
            // Still call onVideoRecorded even if save fails
            onVideoRecorded?.(blob)
          })
      } else {
        // If storage not ready, still proceed with the callback
        onVideoRecorded?.(blob)
      }
    },
    [currentQuestion, onVideoRecorded, saveVideo, isInitialized],
  )

  // Handle retake
  const handleRetake = useCallback(() => {
    setHasRecorded(false)
    setIsRecording(false)

    // Only delete if storage is initialized
    if (isInitialized) {
      deleteVideo(currentQuestion).catch((error) => {
        console.error("Error deleting video:", error)
      })
    }
  }, [currentQuestion, deleteVideo, isInitialized])

  // Get all recorded videos
  const getAllRecordedVideos = useCallback(async () => {
    if (!isInitialized) {
      return {}
    }

    const videos: { [key: number]: Blob } = {}
    try {
      for (let i = 1; i <= 10; i++) {
        const video = await getVideo(i)
        if (video) {
          videos[i] = video
        }
      }
    } catch (error) {
      console.error("Error getting all videos:", error)
    }
    return videos
  }, [getVideo, isInitialized])

  // Clear all videos
  const handleClearAllVideos = useCallback(() => {
    if (isInitialized) {
      clearAllVideosFromStorage().catch((error) => {
        console.error("Error clearing all videos:", error)
      })
    }
    setHasRecorded(false)
  }, [clearAllVideosFromStorage, isInitialized])

  return {
    hasRecorded,
    isRecording,
    setIsRecording,
    handleVideoRecorded,
    handleRetake,
    getAllRecordedVideos,
    handleClearAllVideos,
    checkStoredVideo,
    isStorageReady: isInitialized,
  }
}
