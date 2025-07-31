import { LucideProps } from "lucide-react"

// Base icon component props
export interface BaseIconProps extends Omit<LucideProps, 'ref'> {
  className?: string
}

// Custom icon component props
export interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
}

// Icon size type
export type IconSize = "sm" | "md" | "lg" | "xl"

// Icon variant type  
export type IconVariant = 
  | "default" 
  | "muted" 
  | "primary" 
  | "secondary" 
  | "success" 
  | "warning" 
  | "error" 
  | "info"

// Icon category types for organization
export type CoreUIIcon = 
  | "search"
  | "send" 
  | "add"
  | "delete"
  | "settings"
  | "menu"
  | "close"
  | "check"

export type CommunicationIcon =
  | "chat"
  | "message"
  | "bot"
  | "user"

export type FileIcon =
  | "attach"
  | "file"
  | "document"
  | "image"
  | "download"
  | "upload"

export type StatusIcon =
  | "loading"
  | "success"
  | "warning"
  | "error"
  | "info"

export type DataIcon =
  | "analytics"
  | "chart"
  | "statistics"

export type SystemIcon =
  | "light"
  | "dark"
  | "system"

// All available icon names
export type AvailableIconName = 
  | CoreUIIcon
  | CommunicationIcon
  | FileIcon
  | StatusIcon
  | DataIcon
  | SystemIcon