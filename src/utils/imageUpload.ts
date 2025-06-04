import type React from "react"
import type { UploadedImage } from "../types"

export const handleImageUpload = (
  event: React.ChangeEvent<HTMLInputElement>,
  uploadedImages: UploadedImage[],
  setUploadedImages: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void,
) => {
  const files = Array.from(event.target.files || [])

  if (files.length === 0) return

  // Check if adding these files would exceed the limit
  if (uploadedImages.length + files.length > 4) {
    alert(`You can only upload ${4 - uploadedImages.length} more image(s). Maximum 4 images allowed.`)
    return
  }

  const validFiles: File[] = []
  const errors: string[] = []

  // Validate all files first
  files.forEach((file, index) => {
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      errors.push(`File ${index + 1}: Please upload only JPG or PNG images.`)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      errors.push(`File ${index + 1}: Image size must be less than 10MB.`)
      return
    }

    validFiles.push(file)
  })

  // Show errors if any
  if (errors.length > 0) {
    alert(errors.join("\n"))
    if (validFiles.length === 0) {
      event.target.value = ""
      return
    }
  }

  // Process valid files
  const processFile = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Check for minimum width
        if (img.width < 1000) {
          reject(new Error(`${file.name}: Image width must be at least 1000px.`))
          return
        }

        // Recommend Instagram size
        if (img.width !== 1080 || img.height !== 1080) {
          console.log(`${file.name}: For best results, use 1080×1080px images (Instagram standard size).`)
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string,
          }
          resolve(newImage)
        }
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
        reader.readAsDataURL(file)
      }
      img.onerror = () => reject(new Error(`${file.name}: Invalid image file.`))
      img.src = URL.createObjectURL(file)
    })
  }

  // Process all valid files
  Promise.allSettled(validFiles.map(processFile))
    .then((results) => {
      const successfulImages: UploadedImage[] = []
      const processingErrors: string[] = []

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulImages.push(result.value)
        } else {
          processingErrors.push(result.reason.message)
        }
      })

      // Show processing errors
      if (processingErrors.length > 0) {
        alert(processingErrors.join("\n"))
      }

      // Add successful images
      if (successfulImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...successfulImages])
      }
    })
    .catch((error) => {
      console.error("Error processing images:", error)
      alert("An unexpected error occurred while processing images.")
    })

  // Reset input
  event.target.value = ""
}

export const removeImage = (
  id: string,
  setUploadedImages: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void,
) => {
  setUploadedImages((prev) => prev.filter((img) => img.id !== id))
}
