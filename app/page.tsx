"use client"

import { useEffect, useState } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { SessionList } from "@/components/session-list"
import { ChatView } from "@/components/chat-view"
import { MobileSessionList } from "@/components/mobile-session-list"
import { useAppStore } from "@/store/app-store"
import { useResponsiveLayout, type ViewMode } from "@/hooks/use-mobile"
import { 
  LayoutGrid, 
  LayoutList, 
  Maximize2, 
  Monitor, 
  Tablet, 
  Smartphone,
  Settings
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function Home() {
  const { fetchSessions, fetchModels } = useAppStore()
  const { 
    screenSize, 
    viewMode, 
    setViewMode, 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLargeScreen 
  } = useResponsiveLayout()
  
  const [layoutMode, setLayoutMode] = useState<'sidebar' | 'overlay' | 'split'>('sidebar')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    fetchSessions()
    fetchModels()
  }, [fetchSessions, fetchModels])

  // Auto-adjust layout mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setLayoutMode('overlay')
    } else if (isTablet) {
      setLayoutMode('split')
    } else {
      setLayoutMode('sidebar')
    }
  }, [isMobile, isTablet])

  // Calculate panel sizes based on screen size and view mode
  const getPanelSizes = () => {
    if (isLargeScreen) {
      return { sidebar: sidebarCollapsed ? 5 : 18, main: sidebarCollapsed ? 95 : 82 }
    } else if (isDesktop) {
      return { sidebar: sidebarCollapsed ? 8 : 22, main: sidebarCollapsed ? 92 : 78 }
    } else if (isTablet) {
      return { sidebar: sidebarCollapsed ? 10 : 28, main: sidebarCollapsed ? 90 : 72 }
    }
    return { sidebar: 25, main: 75 }
  }

  const { sidebar: sidebarSize, main: mainSize } = getPanelSizes()

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <MobileSessionList />
        <div className="flex-1 relative">
          <ChatView />
        </div>
      </div>
    )
  }

  // Tablet layout with enhanced features
  if (isTablet && layoutMode === 'split') {
    return (
      <div className="h-screen flex flex-col bg-background">
        {/* Tablet header with layout controls */}
        <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <Tablet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">平板模式</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
            <LayoutModeSelector 
              layoutMode={layoutMode} 
              setLayoutMode={setLayoutMode}
              screenSize={screenSize}
            />
          </div>
        </div>

        {/* Split layout for tablet */}
        <div className="flex-1 flex">
          <ResizablePanelGroup direction="horizontal" className="min-h-full">
            <ResizablePanel 
              defaultSize={sidebarSize} 
              minSize={20} 
              maxSize={40}
              className={cn(
                "transition-all duration-200",
                viewMode === 'compact' && "min-w-[280px]",
                viewMode === 'comfortable' && "min-w-[320px]",
                viewMode === 'spacious' && "min-w-[360px]"
              )}
            >
              <SessionList />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={mainSize}>
              <ChatView />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    )
  }

  // Desktop layout with full features
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Desktop header with advanced controls */}
      {isDesktop && (
        <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            {isLargeScreen ? (
              <Monitor className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Monitor className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isLargeScreen ? '大屏模式' : '桌面模式'}
            </span>
            <span className="text-xs text-muted-foreground">
              {screenSize} • {viewMode}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-7 px-2"
            >
              <LayoutList className={cn(
                "h-3 w-3 transition-transform",
                sidebarCollapsed && "rotate-180"
              )} />
            </Button>
            <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
            <LayoutModeSelector 
              layoutMode={layoutMode} 
              setLayoutMode={setLayoutMode}
              screenSize={screenSize}
            />
          </div>
        </div>
      )}

      {/* Main desktop layout */}
      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="min-h-full">
          <ResizablePanel 
            defaultSize={sidebarSize} 
            minSize={isLargeScreen ? 12 : 15} 
            maxSize={isLargeScreen ? 25 : 35}
            className={cn(
              "transition-all duration-300",
              sidebarCollapsed && "min-w-[60px]",
              !sidebarCollapsed && viewMode === 'compact' && "min-w-[280px]",
              !sidebarCollapsed && viewMode === 'comfortable' && "min-w-[320px]",
              !sidebarCollapsed && viewMode === 'spacious' && "min-w-[380px]"
            )}
          >
            <SessionList collapsed={sidebarCollapsed} />
          </ResizablePanel>
          <ResizableHandle withHandle className={cn(
            "transition-opacity duration-200",
            sidebarCollapsed && "opacity-50"
          )} />
          <ResizablePanel defaultSize={mainSize}>
            <ChatView />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

// View Mode Selector Component
function ViewModeSelector({ 
  viewMode, 
  setViewMode 
}: { 
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void 
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <LayoutGrid className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>视图模式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setViewMode('compact')}
          className={cn(viewMode === 'compact' && "bg-accent")}
        >
          紧凑模式
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setViewMode('comfortable')}
          className={cn(viewMode === 'comfortable' && "bg-accent")}
        >
          舒适模式
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setViewMode('spacious')}
          className={cn(viewMode === 'spacious' && "bg-accent")}
        >
          宽松模式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Layout Mode Selector Component
function LayoutModeSelector({ 
  layoutMode, 
  setLayoutMode,
  screenSize
}: { 
  layoutMode: 'sidebar' | 'overlay' | 'split'
  setLayoutMode: (mode: 'sidebar' | 'overlay' | 'split') => void
  screenSize: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Settings className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>布局模式</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {screenSize !== 'mobile' && (
          <DropdownMenuItem 
            onClick={() => setLayoutMode('sidebar')}
            className={cn(layoutMode === 'sidebar' && "bg-accent")}
          >
            侧边栏模式
          </DropdownMenuItem>
        )}
        {screenSize === 'tablet' && (
          <DropdownMenuItem 
            onClick={() => setLayoutMode('split')}
            className={cn(layoutMode === 'split' && "bg-accent")}
          >
            分屏模式
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => setLayoutMode('overlay')}
          className={cn(layoutMode === 'overlay' && "bg-accent")}
        >
          浮层模式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
