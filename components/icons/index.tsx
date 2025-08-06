"use client"

import * as React from "react"
import { 
  // Core UI icons
  Search,
  Send,
  Plus,
  Trash2,
  Settings,
  Menu,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  
  // Communication icons
  MessageSquare,
  Bot,
  User,
  
  // File and media icons
  Paperclip,
  File,
  FileText,
  Image,
  Download,
  Upload,
  
  // Action icons
  Copy,
  Eye,
  Edit,
  Save,
  RefreshCw,
  
  // Status icons
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  
  // Navigation icons
  Home,
  Archive,
  Bookmark,
  Filter,
  
  // System icons
  Sun,
  Moon,
  Monitor,
  Wifi,
  WifiOff,
  
  // Data icons
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Clock,
  
  // Enterprise specific
  Building,
  Users,
  Shield,
  Key,
  Database,
  Server,
  
} from "lucide-react"

// Custom SVG icons for business-specific needs
export const AIAssistantIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    {/* Hexagonal base structure */}
    <path
      d="M6 4.5L12 1.5L18 4.5V10.5L12 13.5L6 10.5V4.5Z"
      fill="currentColor"
      opacity="0.8"
    />
    
    {/* Inner hexagon */}
    <path
      d="M8 6L12 4L16 6V10L12 12L8 10V6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    
    {/* Central square element */}
    <rect
      x="10"
      y="8"
      width="4"
      height="4"
      fill="#FFD700"
      rx="0.5"
    />
    
    {/* Decorative elements - representing the colorful parts */}
    <ellipse
      cx="16"
      cy="7"
      rx="3"
      ry="2"
      fill="#FFA500"
      opacity="0.7"
      transform="rotate(30 16 7)"
    />
    
    <ellipse
      cx="15"
      cy="5"
      rx="2.5"
      ry="1.5"
      fill="#FFD700"
      opacity="0.8"
      transform="rotate(45 15 5)"
    />
    
    {/* Bottom extension */}
    <path
      d="M10 13L12 15L14 13V17L12 19L10 17V13Z"
      fill="currentColor"
      opacity="0.6"
    />
  </svg>
)

export const DataAnalysisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
    <circle cx="9" cy="9" r="1" />
    <circle cx="14" cy="14" r="1" />
    <circle cx="19" cy="9" r="1" />
  </svg>
)

export const ConversationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h8" />
    <path d="M8 14h6" />
  </svg>
)

export const DocumentProcessingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
    <circle cx="12" cy="15" r="1" />
  </svg>
)

export const SmartSuggestionsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
    <path d="M8 12h8" />
  </svg>
)

export const KeyboardShortcutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 8h.01" />
    <path d="M10 8h.01" />
    <path d="M14 8h.01" />
    <path d="M18 8h.01" />
    <path d="M8 12h.01" />
    <path d="M12 12h.01" />
    <path d="M16 12h.01" />
    <path d="M7 16h10" />
  </svg>
)

export const StatisticsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 8h10" />
    <path d="M7 12h7" />
    <path d="M7 16h4" />
  </svg>
)

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

// Export all Lucide icons for easy access
export {
  // Core UI
  Search,
  Send,
  Plus,
  Trash2,
  Settings,
  Menu,
  X,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  
  // Communication
  MessageSquare,
  Bot,
  User,
  
  // Files and media
  Paperclip,
  File,
  FileText,
  Image,
  Download,
  Upload,
  
  // Actions
  Copy,
  Eye,
  Edit,
  Save,
  RefreshCw,
  
  // Status
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  
  // Navigation
  Home,
  Archive,
  Bookmark,
  Filter,
  
  // System
  Sun,
  Moon,
  Monitor,
  Wifi,
  WifiOff,
  
  // Data
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Clock,
  
  // Enterprise
  Building,
  Users,
  Shield,
  Key,
  Database,
  Server,
}

// Icon mapping for easy replacement of emojis
export const IconMap = {
  // Emoji replacements
  "💬": ConversationIcon,
  "📄": DocumentProcessingIcon,
  "🔍": Search,
  "📊": StatisticsIcon,
  "📎": Paperclip,
  "📷": Image,
  "📤": Send,
  "💡": SmartSuggestionsIcon,
  "⌨️": KeyboardShortcutIcon,
  "🎯": TargetIcon,
  "📋": FileText,
  
  // Common actions
  search: Search,
  send: Send,
  add: Plus,
  delete: Trash2,
  settings: Settings,
  menu: Menu,
  close: X,
  check: Check,
  
  // Communication
  chat: ConversationIcon,
  message: MessageSquare,
  bot: Bot,
  user: User,
  
  // Files
  attach: Paperclip,
  file: File,
  document: FileText,
  image: Image,
  download: Download,
  upload: Upload,
  
  // Status
  loading: Loader2,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  
  // Data
  analytics: DataAnalysisIcon,
  chart: BarChart3,
  statistics: StatisticsIcon,
  
  // AI & Assistant
  ai: AIAssistantIcon,
  assistant: AIAssistantIcon,
  
  // System
  light: Sun,
  dark: Moon,
  system: Monitor,
  
  // Additional actions
  refresh: RefreshCw,
} as const

export type IconName = keyof typeof IconMap