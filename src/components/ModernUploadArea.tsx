"use client"

import type React from "react"

import { CloudUpload, X, CheckCircle, Plus, Sparkles } from "lucide-react"
import type { UploadedImage } from "../types"

interface ModernUploadAreaProps {
  uploadedImages: UploadedImage[]
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (id: string) => void
  disabled?: boolean
}

export default function ModernUploadArea({
  uploadedImages,
  onImageUpload,
  onRemoveImage,
  disabled = false,
}: ModernUploadAreaProps) {
  return (
    <div className="space-y-6">
      {/* Modern Upload Area */}
      <div> {/* Container for the input and its label */}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          onChange={onImageUpload}
          className="sr-only" // Visually hidden but accessible
          disabled={disabled}
          key={uploadedImages.length} // Force re-render to reset file input
          id="modern-file-upload" // Added ID for the label
        />
        <label
          htmlFor="modern-file-upload" // Link label to the input
          className={`block relative h-48 py-4 border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden group ${disabled
              ? "border-gray-400 bg-gray-100/30 cursor-not-allowed"
              : "border-purple-300 bg-gradient-to-br from-purple-50/50 to-blue-50/50 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-100/50 hover:to-blue-100/50 cursor-pointer group-hover:scale-105"
            }`}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-pink-100/20 to-blue-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Sparkle effects */}
          <Sparkles className="absolute top-6 right-6 w-6 h-6 text-purple-400 animate-pulse opacity-50" />
          <Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-pink-400 animate-pulse opacity-50 animation-delay-500" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="relative">
              <div
                style={{ background: "linear-gradient(180deg, #7251D3 12.02%, #7D54DA 43.27%, #9A5DEB 73.56%, #AD63F6 90.38%)" }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
              >
                <CloudUpload className="w-7 h-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-purple-500/20 rounded-2xl scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-base group-hover:text-purple-700 transition-colors duration-300">
                {disabled ? "Maximum 4 images reached" : "Tap to upload images"}
              </p>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                JPG/PNG • 1080×1080px (Instagram size) • Max 10MB each
                <br />
                <span className="text-purple-600 font-medium">Select multiple files at once!</span>
              </p>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 border-2 border-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-gentle" />
        </label>
      </div>

      {/* Modern Upload Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${index < uploadedImages.length
                    ? "bg-[linear-gradient(180deg,_#7251D3_12.02%,_#7D54DA_43.27%,_#9A5DEB_73.56%,_#AD63F6_90.38%)] scale-110 animate-pulse-gentle shadow-lg"
                    : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-700 font-semibold">{uploadedImages.length}/4 images uploaded</span>
          </div>
          {uploadedImages.length >= 2 && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Ready!</span>
            </div>
          )}
        </div>

        {/* Modern Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${uploadedImages.length >= 2
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-purple-500 to-pink-500"
              }`}
            style={{ width: `${Math.min((uploadedImages.length / 2) * 100, 100)}%` }}
          />
        </div>

        {/* Modern Status Message */}
        <div className="text-center">
          {uploadedImages.length === 0 && (
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
              <p className="text-gray-600 text-sm">Upload at least 2 images to continue (up to 4)</p>
            </div>
          )}
          {uploadedImages.length === 1 && (
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium inline-block">
                1 more image needed (up to 3 more)
              </div>
            </div>
          )}
          {uploadedImages.length >= 2 && uploadedImages.length < 4 && (
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold inline-block">
                ✨ Perfect! You can add {4 - uploadedImages.length} more
              </div>
            </div>
          )}
          {uploadedImages.length === 4 && (
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold inline-block">
                🎉 Amazing! All 4 slots filled
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Image Upload Slots Grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        {[...Array(4)].map((_, index) => {
          const image = uploadedImages[index]
          const isEmpty = !image

          return (
            <div key={index} className="relative group animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              {isEmpty ? (
                // Modern Empty slot
                <div className="aspect-square rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50/50 to-pink-50/50 flex items-center justify-center hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-300 cursor-pointer group-hover:scale-105">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[linear-gradient(180deg,_#7251D3_12.02%,_#7D54DA_43.27%,_#9A5DEB_73.56%,_#AD63F6_90.38%)] rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-purple-600 font-semibold">Slot {index + 1}</p>
                  </div>
                </div>
              ) : (
                // Modern Filled slot with image
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg border-2 border-purple-200 hover:border-purple-500 transition-all duration-300 hover:scale-105 group-hover:shadow-xl hover:shadow-2xl">
                  <img
                    src={image.preview || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Modern Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Modern Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveImage(image.id)
                    }}
                    className="absolute top-1 right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xl z-10 border-3 border-white"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  {/* Modern Image number badge */}
                  <div className="absolute top-2 left-2 w-7 h-7 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    {index + 1}
                  </div>

                  {/* Modern Success indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
