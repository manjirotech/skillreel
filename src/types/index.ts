export interface UserInfo {
  name: string
  country: string
  mobile: string
  email: string
  role: string
  instagram: string
}

export interface UploadedImage {
  id: string
  file: File
  preview: string
}

export interface ScreenProps {
  onNext: (screen: number) => void
  userInfo: UserInfo
  setUserInfo: (info: UserInfo | ((prev: UserInfo) => UserInfo)) => void
  uploadedImages: UploadedImage[]
  setUploadedImages: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void
  currentQuestion: number
  setCurrentQuestion: (q: number | ((prev: number) => number)) => void
}

export interface VideoRecording {
  questionId: number
  blob: Blob
  url: string
  timestamp: number
}
