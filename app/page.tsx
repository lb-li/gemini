"use client"

import { useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { SessionList } from "@/components/session-list"
import { ChatView } from "@/components/chat-view"
import { MobileSessionList } from "@/components/mobile-session-list"
import { useAppStore } from "@/store/app-store"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Home() {
  const { fetchSessions, fetchModels } = useAppStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    fetchSessions()
    fetchModels()
  }, [fetchSessions, fetchModels])

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        <MobileSessionList />
        <div className="flex-1">
          <ChatView />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <SessionList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <ChatView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
