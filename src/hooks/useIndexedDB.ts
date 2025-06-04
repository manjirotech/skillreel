"use client"

import { useState, useEffect } from "react"

// IndexedDB database name and version
const DB_NAME = "skillreelVideos"
const DB_VERSION = 1
const STORE_NAME = "videos"

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize IndexedDB
  useEffect(() => {
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported, falling back to localStorage")
      setIsSupported(false)
      setIsInitialized(true)
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("IndexedDB error:", event)
      setIsSupported(false)
      setIsInitialized(true)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }

    request.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      setDb(database)
      setIsInitialized(true)
    }

    return () => {
      // Cleanup will be handled by the database close when component unmounts
    }
  }, [])

  // Fallback to localStorage for unsupported browsers
  const saveToLocalStorage = (questionId: number, blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const base64 = reader.result as string
            // Try to save, but catch quota exceeded errors
            localStorage.setItem(`skillreel_video_q${questionId}`, base64)
            resolve()
          } catch (error) {
            if (error instanceof Error && error.name === "QuotaExceededError") {
              reject(new Error("Storage quota exceeded. Please try recording a shorter video."))
            } else {
              reject(error)
            }
          }
        }
        reader.onerror = () => reject(new Error("Failed to read video file"))
        reader.readAsDataURL(blob)
      } catch (error) {
        reject(error)
      }
    })
  }

  const getFromLocalStorage = (questionId: number): Promise<Blob | null> => {
    return new Promise((resolve, reject) => {
      try {
        const stored = localStorage.getItem(`skillreel_video_q${questionId}`)
        if (stored) {
          fetch(stored)
            .then((res) => res.blob())
            .then((blob) => resolve(blob))
            .catch((err) => reject(err))
        } else {
          resolve(null)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // Save video to IndexedDB or localStorage
  const saveVideo = async (questionId: number, blob: Blob): Promise<void> => {
    if (!isInitialized) {
      throw new Error("Storage not initialized")
    }

    if (!isSupported) {
      return saveToLocalStorage(questionId, blob)
    }

    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not available"))
        return
      }

      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)

        const videoData = {
          id: questionId,
          blob: blob,
          timestamp: Date.now(),
        }

        const request = store.put(videoData)

        request.onsuccess = () => resolve()
        request.onerror = (event) => reject(event)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Get video from IndexedDB or localStorage
  const getVideo = async (questionId: number): Promise<Blob | null> => {
    if (!isInitialized) {
      throw new Error("Storage not initialized")
    }

    if (!isSupported) {
      return getFromLocalStorage(questionId)
    }

    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not available"))
        return
      }

      try {
        const transaction = db.transaction([STORE_NAME], "readonly")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(questionId)

        request.onsuccess = () => {
          const data = request.result
          if (data) {
            resolve(data.blob)
          } else {
            resolve(null)
          }
        }

        request.onerror = (event) => reject(event)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Delete video from IndexedDB or localStorage
  const deleteVideo = async (questionId: number): Promise<void> => {
    if (!isInitialized) {
      throw new Error("Storage not initialized")
    }

    if (!isSupported) {
      localStorage.removeItem(`skillreel_video_q${questionId}`)
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not available"))
        return
      }

      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(questionId)

        request.onsuccess = () => resolve()
        request.onerror = (event) => reject(event)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Clear all videos
  const clearAllVideos = async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error("Storage not initialized")
    }

    if (!isSupported) {
      // Clear localStorage videos
      for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`skillreel_video_q${i}`)
      }
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error("Database not available"))
        return
      }

      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.clear()

        request.onsuccess = () => resolve()
        request.onerror = (event) => reject(event)
      } catch (error) {
        reject(error)
      }
    })
  }

  return {
    saveVideo,
    getVideo,
    deleteVideo,
    clearAllVideos,
    isSupported,
    isInitialized,
  }
}
