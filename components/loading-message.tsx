"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingMessage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-4xl mr-auto">
      {/* 头像 */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4" />
      </div>

      {/* 加载内容 */}
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="bg-muted rounded-lg px-4 py-3">
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="space-y-2"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </motion.div>
        </div>

        <div className="text-xs text-muted-foreground px-1">正在思考中...</div>
      </div>
    </motion.div>
  )
}
