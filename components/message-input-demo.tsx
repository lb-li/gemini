"use client"

import { MessageInput } from './message-input'

/**
 * 增强输入区域功能演示组件
 * 
 * 新增功能：
 * 1. 智能补全功能 - Ctrl+K 打开模板和快捷短语面板
 * 2. 模板和快捷短语系统 - 预设常用模板和短语
 * 3. 优化文件拖拽上传体验 - 带进度指示器的文件上传
 * 4. 实时字符统计和格式预览 - 显示字符数和预览模式
 * 5. 集成快捷键支持系统 - 完整的快捷键体系
 * 
 * 快捷键：
 * - Ctrl+K: 打开智能建议面板
 * - Ctrl+U: 上传文件
 * - Ctrl+P: 切换预览模式
 * - Ctrl+/: 显示快捷键帮助
 * - Enter: 发送消息
 * - Shift+Enter: 换行
 * - Esc: 关闭面板
 */
export function MessageInputDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">增强输入区域功能演示</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold">新增功能</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• 智能补全和模板系统</li>
              <li>• 文件上传进度指示</li>
              <li>• 实时字符统计</li>
              <li>• 格式预览模式</li>
              <li>• 完整快捷键支持</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">快捷键</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+K</kbd> 智能建议</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+U</kbd> 上传文件</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+P</kbd> 预览模式</li>
              <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+/</kbd> 快捷键帮助</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <MessageInput />
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>尝试以下操作来体验新功能：</p>
        <ul className="mt-2 space-y-1 ml-4">
          <li>1. 点击闪电图标或按 Ctrl+K 打开智能建议面板</li>
          <li>2. 拖拽文件到输入区域查看上传进度</li>
          <li>3. 输入文字观察实时字符统计</li>
          <li>4. 按 Ctrl+P 切换预览模式</li>
          <li>5. 点击键盘图标查看所有快捷键</li>
        </ul>
      </div>
    </div>
  )
}