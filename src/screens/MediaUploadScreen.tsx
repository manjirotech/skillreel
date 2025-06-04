"use client"

import { Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AnimatedButton from "../components/AnimatedButton"
import ModernUploadArea from "../components/ModernUploadArea"
import { handleImageUpload, removeImage } from "../utils/imageUpload"
import type { ScreenProps } from "../types"

interface MediaUploadScreenProps
  extends Pick<ScreenProps, "onNext" | "userInfo" | "setUserInfo" | "uploadedImages" | "setUploadedImages"> {}

export default function MediaUploadScreen({
  onNext,
  userInfo,
  setUserInfo,
  uploadedImages,
  setUploadedImages,
}: MediaUploadScreenProps) {
  // Validation functions
  const isInstagramValid = !userInfo.instagram || /^https?:\/\/(www\.)?instagram\.com\//.test(userInfo.instagram)
  const isImagesValid = uploadedImages.length >= 2

  const isFormValid = isImagesValid && isInstagramValid

  // Calculate completion percentage - only count when both conditions are met
  const instagramComplete = isInstagramValid && (userInfo.instagram.length > 0 || true) // Instagram is optional, so always complete
  const imagesComplete = isImagesValid

  const completedFields = [instagramComplete, imagesComplete].filter(Boolean).length
  const totalFields = 2
  const completionPercentage = (completedFields / totalFields) * 100

  const getFieldStatus = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) return "default"
    return isValid ? "success" : "error"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-400 via-purple-300 to-blue-200 p-6 py-12">
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-black mb-2">
            Lights. Camera. <span className="text-purple-600">You!</span>
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Drop your Insta and 2-4 snaps
            <br />
            We're setting the stage for you.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up animation-delay-100">
          <div className="bg-white/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-black font-medium text-sm">Media Setup</span>
              <span className="text-black font-bold text-sm">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  completionPercentage === 100 ? "bg-green-500" : "bg-purple-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Instagram Profile Link */}
          <div className="animate-fade-in-up animation-delay-200">
            <Label htmlFor="instagram" className="text-sm font-medium text-black mb-2 block">
              Instagram Profile Link <span className="text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="instagram"
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={userInfo.instagram}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, instagram: e.target.value }))}
                className={`h-12 bg-white/50 border rounded-lg text-black placeholder:text-gray-500 transition-all duration-300 pr-10 ${
                  getFieldStatus(isInstagramValid, !!userInfo.instagram) === "success"
                    ? "border-green-500 focus:border-green-500 focus:shadow-green"
                    : getFieldStatus(isInstagramValid, !!userInfo.instagram) === "error"
                      ? "border-red-500 focus:border-red-500 focus:shadow-red"
                      : "border-gray-300 focus:border-purple-500 focus:shadow-purple"
                } hover:bg-white/60 focus:bg-white/70`}
              />
              {userInfo.instagram && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isInstagramValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {userInfo.instagram && !isInstagramValid && (
              <p className="text-red-600 text-xs mt-1">Please enter a valid Instagram URL</p>
            )}
          </div>

          {/* Upload Section */}
          <div className="animate-fade-in-up animation-delay-300">
            <Label className="text-sm font-medium text-black mb-3 block">Upload 2 to 4 Thumbnail Photos *</Label>

            <ModernUploadArea
              uploadedImages={uploadedImages}
              onImageUpload={(e) => handleImageUpload(e, uploadedImages, setUploadedImages)}
              onRemoveImage={(id) => removeImage(id, setUploadedImages)}
              disabled={uploadedImages.length >= 4}
            />
          </div>

          {/* Continue Button */}
          <div className="pt-4 animate-fade-in-up animation-delay-400">
            <AnimatedButton onClick={() => onNext(4)} disabled={!isFormValid} variant="primary">
              Continue Your Story
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  )
}
