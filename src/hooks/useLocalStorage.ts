"use client"

import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}

// Hook for managing app state in localStorage
export function useAppState() {
  const [currentScreen, setCurrentScreen] = useLocalStorage("gpc_currentScreen", 1)
  const [userInfo, setUserInfo] = useLocalStorage("gpc_userInfo", {
    name: "",
    country: "",
    mobile: "",
    email: "",
    role: "",
    instagram: "",
  })
  const [uploadedImages, setUploadedImages] = useLocalStorage("gpc_uploadedImages", [])
  const [currentQuestion, setCurrentQuestion] = useLocalStorage("gpc_currentQuestion", 1)

  // Function to clear all stored data (for reset)
  const clearStoredData = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("gpc_currentScreen")
      window.localStorage.removeItem("gpc_userInfo")
      window.localStorage.removeItem("gpc_uploadedImages")
      window.localStorage.removeItem("gpc_currentQuestion")
    }
    setCurrentScreen(1)
    setUserInfo({
      name: "",
      country: "",
      mobile: "",
      email: "",
      role: "",
      instagram: "",
    })
    setUploadedImages([])
    setCurrentQuestion(1)
  }

  return {
    currentScreen,
    setCurrentScreen,
    userInfo,
    setUserInfo,
    uploadedImages,
    setUploadedImages,
    currentQuestion,
    setCurrentQuestion,
    clearStoredData,
  }
}
