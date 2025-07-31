import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return "今天"
  } else if (days === 1) {
    return "昨天"
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    })
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function generateSessionTitle(content: string): string {
  // 移除 markdown 格式和多余空白
  const cleanContent = content
    .replace(/[#*`_~]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  // 截取前30个字符作为标题
  if (cleanContent.length <= 30) {
    return cleanContent || "新对话"
  }

  return cleanContent.substring(0, 30) + "..."
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/")
}

export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/plain",
    "application/pdf",
    "application/json",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]

  return supportedTypes.includes(mimeType)
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:mime/type;base64, 前缀
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
