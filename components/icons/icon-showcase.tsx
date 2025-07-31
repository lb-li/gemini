"use client"

import * as React from "react"
import { EnterpriseIcon } from "./icon-component"
import { IconMap, type IconName } from "./index"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const iconCategories = {
  "Core UI": [
    "search", "send", "add", "delete", "settings", 
    "menu", "close", "check"
  ] as IconName[],
  "Communication": [
    "chat", "message", "bot", "user"
  ] as IconName[],
  "Files & Media": [
    "attach", "file", "document", "image", 
    "download", "upload"
  ] as IconName[],
  "Status": [
    "loading", "success", "warning", "error", "info"
  ] as IconName[],
  "Data & Analytics": [
    "analytics", "chart", "statistics"
  ] as IconName[],
  "System": [
    "light", "dark", "system"
  ] as IconName[]
}

const sizes = [
  { name: "Small (16px)", value: "sm" as const },
  { name: "Medium (20px)", value: "md" as const },
  { name: "Large (24px)", value: "lg" as const },
  { name: "Extra Large (32px)", value: "xl" as const }
]

const variants = [
  { name: "Default", value: "default" as const },
  { name: "Muted", value: "muted" as const },
  { name: "Primary", value: "primary" as const },
  { name: "Success", value: "success" as const },
  { name: "Warning", value: "warning" as const },
  { name: "Error", value: "error" as const },
  { name: "Info", value: "info" as const }
]

export function IconShowcase() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Enterprise Icon System</h1>
        <p className="text-muted-foreground">
          Professional SVG icons with consistent styling and multiple size/color variants
        </p>
      </div>

      {/* Size Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Sizes</CardTitle>
          <CardDescription>
            Four standardized sizes: 16px, 20px, 24px, and 32px
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {sizes.map((size) => (
              <div key={size.value} className="flex flex-col items-center gap-2">
                <EnterpriseIcon name="search" size={size.value} />
                <Badge variant="outline">{size.name}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variant Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variants</CardTitle>
          <CardDescription>
            Semantic color variants for different contexts and states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            {variants.map((variant) => (
              <div key={variant.value} className="flex flex-col items-center gap-2">
                <EnterpriseIcon name="check" size="lg" variant={variant.value} />
                <Badge variant="outline">{variant.name}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Icon Categories */}
      {Object.entries(iconCategories).map(([category, icons]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {icons.length} icons in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {icons.map((iconName) => (
                <div
                  key={iconName}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <EnterpriseIcon name={iconName} size="lg" />
                  <span className="text-xs text-center font-mono">{iconName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Common patterns and implementations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button with icon */}
          <div>
            <h4 className="font-medium mb-2">Button with Icon</h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md">
                <EnterpriseIcon name="send" size="sm" />
                Send Message
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border rounded-md">
                <EnterpriseIcon name="add" size="sm" />
                New Chat
              </button>
            </div>
          </div>

          <Separator />

          {/* Card headers with icons */}
          <div>
            <h4 className="font-medium mb-2">Card Headers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <EnterpriseIcon name="chat" size="sm" variant="primary" />
                  <h5 className="font-medium">Smart Conversation</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Natural dialogue with AI assistant
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <EnterpriseIcon name="analytics" size="sm" variant="primary" />
                  <h5 className="font-medium">Data Analysis</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Comprehensive data insights
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status indicators */}
          <div>
            <h4 className="font-medium mb-2">Status Indicators</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <EnterpriseIcon name="success" size="sm" variant="success" />
                <span className="text-sm">Operation completed successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <EnterpriseIcon name="warning" size="sm" variant="warning" />
                <span className="text-sm">Warning: Check your input</span>
              </div>
              <div className="flex items-center gap-2">
                <EnterpriseIcon name="error" size="sm" variant="error" />
                <span className="text-sm">Error: Something went wrong</span>
              </div>
              <div className="flex items-center gap-2">
                <EnterpriseIcon name="loading" size="sm" className="animate-spin" />
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}