"use client"

import { Star, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AnimatedButton from "../components/AnimatedButton"
import { ROLES, COUNTRIES, getCountryCode } from "../constants/data"
import type { ScreenProps } from "../types"

interface PersonalInfoScreenProps extends Pick<ScreenProps, "onNext" | "userInfo" | "setUserInfo"> {}

export default function PersonalInfoScreen({ onNext, userInfo, setUserInfo }: PersonalInfoScreenProps) {
  // Validation functions
  const isNameValid = userInfo.name.trim().length >= 2
  const isCountryValid = userInfo.country.trim().length > 0
  const isMobileValid = userInfo.mobile.trim().length >= 8
  const isEmailValid = !userInfo.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)
  const isRoleValid = userInfo.role.trim().length > 0

  const isFormValid = isNameValid && isCountryValid && isMobileValid && isRoleValid && isEmailValid

  // Calculate completion percentage
  const completedFields = [isNameValid, isCountryValid, isMobileValid, isRoleValid].filter(Boolean).length
  const completionPercentage = (completedFields / 4) * 100

  const handleCountryChange = (countryName: string) => {
    const countryCode = getCountryCode(countryName)
    setUserInfo((prev) => ({
      ...prev,
      country: countryName,
      mobile: "", // Reset mobile when country changes
    }))
  }

  const handleMobileChange = (value: string) => {
    // Just set the value as is, the display will handle the formatting
    setUserInfo((prev) => ({ ...prev, mobile: value }))
  }

  // Get the mobile number without country code for input
  const getMobileInputValue = () => {
    const countryCode = getCountryCode(userInfo.country)
    if (countryCode && userInfo.mobile.startsWith(countryCode)) {
      return userInfo.mobile.substring(countryCode.length).trim()
    }
    return userInfo.mobile
  }

  // Get the full mobile number with country code
  const getFullMobileNumber = () => {
    const countryCode = getCountryCode(userInfo.country)
    const mobileInput = getMobileInputValue()
    if (countryCode && mobileInput) {
      return `${countryCode} ${mobileInput}`
    }
    return mobileInput
  }

  const getFieldStatus = (isValid: boolean, hasValue: boolean) => {
    if (!hasValue) return "default"
    return isValid ? "success" : "error"
  }

  return (
    <div className="min-h-screen bg-[url('../assets/background.png')] bg-cover bg-center p-6 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-up">
          <h2 className="text-2xl font-black text-black mb-1 font-family-plus-jakarta">
            Tell us about <span style={{ backgroundImage: "linear-gradient(91.63deg, #AC5EF8 56.26%, #833FD9 66.13%, #3B09A3 86.28%)" }} className="bg-clip-text text-transparent">yourself</span>
          </h2>
          <p className="text-[#555555] font-semibold font-family-poppins">We'll personalize your experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up animation-delay-100">
          <div className="bg-white/30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-black font-medium text-sm">Profile Completion</span>
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
          {/* Full Name */}
          <div className="animate-fade-in-up animation-delay-200">
            <Label htmlFor="name" className="text-sm font-medium text-[#101010] mb-1 block">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={userInfo.name}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, name: e.target.value }))}
                className={`h-12 bg-transparent border border-[#838383] rounded-lg text-black placeholder:text-gray-500 transition-all duration-300 pr-4 ${
                  getFieldStatus(isNameValid, !!userInfo.name) === "success"
                    ? "border-green-500 focus:border-green-500 focus:shadow-green"
                    : getFieldStatus(isNameValid, !!userInfo.name) === "error"
                      ? "border-red-500 focus:border-red-500 focus:shadow-red"
                      : "border-[#838383] focus:border-purple-500 focus:shadow-purple"
                } hover:bg-white/60 focus:bg-white/70`}
              />
              {userInfo.name && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isNameValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {userInfo.name && !isNameValid && (
              <p className="text-red-600 text-xs mt-1">Name must be at least 2 characters</p>
            )}
          </div>

          {/* Country */}
          <div className="animate-fade-in-up animation-delay-300">
            <Label htmlFor="country" className="text-sm font-medium text-[#101010] mb-1 block">
              Country <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select value={userInfo.country} onValueChange={handleCountryChange}>
                <SelectTrigger
                  className={`h-12 bg-transparent border border-[#838383] rounded-lg text-black transition-all duration-300 pr-4 ${
                    getFieldStatus(isCountryValid, !!userInfo.country) === "success"
                      ? "border-green-500 focus:border-green-500 focus:shadow-green bg-white/50"
                      : "border-[#838383] focus:border-purple-500 focus:shadow-purple"
                  } hover:bg-white/60 focus:bg-white/70`}
                >
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-white/100">
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.name} value={country.name}>
                      <div className="flex items-center space-x-2">
                        <span>{country.name}</span>
                        {country.code && <span className="text-gray-500 text-sm">({country.code})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userInfo.country && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Mobile No */}
          <div className="animate-fade-in-up animation-delay-400">
            <Label htmlFor="mobile" className="text-sm font-medium text-[#101010] mb-1 block">
              Mobile No <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="mobile"
                type="tel"
                placeholder={userInfo.country ? "Enter your mobile number" : "Select country first"}
                value={getMobileInputValue()}
                onChange={(e) => {
                  const countryCode = getCountryCode(userInfo.country)
                  const fullNumber = countryCode ? `${countryCode} ${e.target.value}` : e.target.value
                  setUserInfo((prev) => ({ ...prev, mobile: fullNumber }))
                }}
                className={`h-12 bg-transparent border border-[#838383] rounded-lg text-black placeholder:text-gray-500 transition-all duration-300 pr-4 ${
                  getFieldStatus(isMobileValid, !!userInfo.mobile) === "success"
                    ? "border-green-500 focus:border-green-500 focus:shadow-green bg-white/50"
                    : getFieldStatus(isMobileValid, !!userInfo.mobile) === "error"
                      ? "border-red-500 focus:border-red-500 focus:shadow-red"
                      : "border-[#838383] focus:border-purple-500 focus:shadow-purple"
                } hover:bg-white/60 focus:bg-white/70`}
                disabled={!userInfo.country}
                style={{
                  paddingLeft: userInfo.country && getCountryCode(userInfo.country) ? "60px" : "12px",
                }}
              />

              {/* Country code display */}
              {userInfo.country && getCountryCode(userInfo.country) && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span className="text-black font-medium">{getCountryCode(userInfo.country)}</span>
                  <span className="mx-2 text-gray-400 text-lg">|</span>
                </div>
              )}

              {userInfo.mobile && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isMobileValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {userInfo.mobile && !isMobileValid && (
              <p className="text-red-600 text-xs mt-1">Please enter a valid mobile number</p>
            )}
            {userInfo.country && getCountryCode(userInfo.country) && (
              <p className="text-xs text-gray-600 mt-1">
                Country code {getCountryCode(userInfo.country)} will be added automatically
              </p>
            )}
          </div>

          {/* Email */}
          <div className="animate-fade-in-up animation-delay-500">
            <Label htmlFor="email" className="text-sm font-medium text-[#101010] mb-1 block">
              Email <span className="text-[#555555]">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={userInfo.email}
                onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
                className={`h-12 bg-transparent border border-[#838383] rounded-lg text-black placeholder:text-gray-500 transition-all duration-300 pr-4 ${
                  getFieldStatus(isEmailValid, !!userInfo.email) === "success"
                    ? "border-green-500 focus:border-green-500 focus:shadow-green bg-white/50"
                    : getFieldStatus(isEmailValid, !!userInfo.email) === "error"
                      ? "border-red-500 focus:border-red-500 focus:shadow-red"
                      : "border-[#838383] focus:border-purple-500 focus:shadow-purple"
                } hover:bg-white/60 focus:bg-white/70`}
              />
              {userInfo.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isEmailValid ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {userInfo.email && !isEmailValid && (
              <p className="text-red-600 text-xs mt-1">Please enter a valid email address</p>
            )}
          </div>

          {/* Current Role */}
          <div className="animate-fade-in-up animation-delay-600">
            <Label htmlFor="role" className="text-sm font-medium text-[#101010] mb-1 block">
              Current Role <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Select
                value={userInfo.role}
                onValueChange={(value) => setUserInfo((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger
                  className={`h-12 bg-transparent border border-[#838383] rounded-lg text-black transition-all duration-300 pr-4 ${
                    getFieldStatus(isRoleValid, !!userInfo.role) === "success"
                      ? "border-green-500 focus:border-green-500 focus:shadow-green bg-white/50"
                      : "border-[#838383] focus:border-purple-500 focus:shadow-purple"
                  } hover:bg-white/60 focus:bg-white/70`}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white/100">
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userInfo.role && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4 animate-fade-in-up animation-delay-700">
            <AnimatedButton onClick={() => onNext(3)} disabled={!isFormValid} variant="primary">
              <Star className="w-5 h-5 mr-2" />
              Continue Your Story
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  )
}
