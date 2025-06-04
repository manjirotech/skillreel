"use client"

import { X } from "lucide-react"
import { useEffect, useRef } from "react"

interface ImageZoomModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
}

export default function ImageZoomModal({ isOpen, imageUrl, onClose }: ImageZoomModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }

      window.addEventListener("keydown", handleEscape)
      return () => {
        document.body.style.overflow = "unset"
        window.removeEventListener("keydown", handleEscape)
      }
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      ref={modalRef}
    >
      <div className="relative max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
          aria-label="Close image preview"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Image */}
        <div className="relative animate-scale-in">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="Zoomed preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  )
}
