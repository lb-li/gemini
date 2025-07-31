"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Loader2, Check, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/app-store"
import { GeminiAPI } from "@/lib/gemini"
import { toast } from "sonner"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  apiKey: string
  endpointUrl: string
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { apiKey, endpointUrl, setApiKey, setEndpointUrl, fetchModels } = useAppStore()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      apiKey,
      endpointUrl,
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: FormData) => {
    try {
      setApiKey(data.apiKey)
      setEndpointUrl(data.endpointUrl)

      // 重新获取模型列表
      if (data.apiKey) {
        await fetchModels()
      }

      toast.success("设置已保存")
      reset(data)
      setConnectionStatus("idle")
    } catch (error) {
      toast.error("保存设置失败")
    }
  }

  const testConnection = async () => {
    const currentApiKey = watchedValues.apiKey
    const currentEndpointUrl = watchedValues.endpointUrl

    if (!currentApiKey) {
      toast.error("请先输入 API Key")
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const geminiAPI = new GeminiAPI({
        apiKey: currentApiKey,
        endpointUrl: currentEndpointUrl,
      })

      const isConnected = await geminiAPI.testConnection()

      if (isConnected) {
        setConnectionStatus("success")
        toast.success("连接测试成功")
      } else {
        setConnectionStatus("error")
        toast.error("连接测试失败，请检查 API Key 和端点地址")
      }
    } catch (error) {
      setConnectionStatus("error")
      toast.error("连接测试失败")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const resetToDefaults = () => {
    const defaultValues = {
      apiKey: "",
      endpointUrl: "https://generativelanguage.googleapis.com/v1beta",
    }
    reset(defaultValues)
    setConnectionStatus("idle")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
          <SheetDescription>配置 Gemini AI API 连接参数</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="输入您的 Gemini API Key"
              {...register("apiKey", {
                required: "API Key 是必需的",
                minLength: {
                  value: 10,
                  message: "API Key 长度至少为 10 个字符",
                },
              })}
              className={errors.apiKey ? "border-destructive" : ""}
            />
            {errors.apiKey && <p className="text-sm text-destructive">{errors.apiKey.message}</p>}
            <p className="text-xs text-muted-foreground">
              您可以在{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>{" "}
              获取 API Key
            </p>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-2">
            <Label htmlFor="endpointUrl">API 端点地址</Label>
            <Input
              id="endpointUrl"
              type="url"
              placeholder="https://generativelanguage.googleapis.com/v1beta"
              {...register("endpointUrl", {
                required: "API 端点地址是必需的",
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "请输入有效的 URL",
                },
              })}
              className={errors.endpointUrl ? "border-destructive" : ""}
            />
            {errors.endpointUrl && <p className="text-sm text-destructive">{errors.endpointUrl.message}</p>}
            <p className="text-xs text-muted-foreground">通常使用默认地址即可，除非您使用自定义代理</p>
          </div>

          <Separator />

          {/* 连接测试 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>连接测试</Label>
              {connectionStatus === "success" && (
                <Badge variant="default" className="bg-green-500">
                  <Check className="w-3 h-3 mr-1" />
                  连接成功
                </Badge>
              )}
              {connectionStatus === "error" && (
                <Badge variant="destructive">
                  <X className="w-3 h-3 mr-1" />
                  连接失败
                </Badge>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection || !watchedValues.apiKey}
              className="w-full bg-transparent"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                "测试连接"
              )}
            </Button>
          </div>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={resetToDefaults} className="flex-1 bg-transparent">
              重置默认
            </Button>
            <Button type="submit" disabled={!isDirty} className="flex-1">
              保存设置
            </Button>
          </div>

          {/* 使用说明 */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium">使用说明</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• API Key 将安全地存储在本地浏览器中</li>
              <li>• 支持上传图片、PDF、文本等多种格式文件</li>
              <li>• 所有对话记录仅保存在本地，不会上传到服务器</li>
              <li>• 建议定期备份重要对话内容</li>
            </ul>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
