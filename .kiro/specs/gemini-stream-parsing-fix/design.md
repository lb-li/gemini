# Design Document

## Overview

当前 Gemini API 流式响应解析存在问题，无法正确处理 API 返回的 JSON 格式数据。根据用户提供的响应格式示例，Gemini API 返回的是完整的 JSON 对象数组，而不是传统的 Server-Sent Events (SSE) 格式。需要重新设计流式解析逻辑以正确处理这种响应格式。

## Architecture

### 当前问题分析

1. **响应格式不匹配**: 当前代码期望的是 SSE 格式（带 "data: " 前缀的行），但实际 API 返回的是 JSON 数组格式
2. **解析逻辑错误**: 按行分割和逐行解析的方式不适用于完整的 JSON 响应
3. **数据提取路径**: 需要从 `candidates[0].content.parts[0].text` 路径提取文本内容

### 新架构设计

```
GeminiAPI.streamGenerateContent()
├── 发送请求到 Gemini API
├── 检查响应状态
├── 创建 ReadableStream 读取器
├── 使用改进的解析器处理响应
│   ├── StreamResponseParser.parseChunk()
│   ├── StreamResponseParser.extractTextContent()
│   └── StreamResponseParser.handleParsingError()
└── 生成文本内容流
```

## Components and Interfaces

### 1. StreamResponseParser 类

负责解析 Gemini API 的流式响应数据。

```typescript
interface StreamResponseParser {
  parseChunk(chunk: string): string[]
  extractTextContent(jsonData: any): string | null
  handleParsingError(error: Error, chunk: string): void
}
```

### 2. 改进的 GeminiAPI.streamGenerateContent 方法

```typescript
interface StreamGenerateContentOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
}

async *streamGenerateContent(
  messages: ChatMessage[],
  options?: StreamGenerateContentOptions
): AsyncGenerator<string, void, unknown>
```

### 3. 响应数据类型定义

```typescript
interface GeminiStreamResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
      role: string
    }
    finishReason?: string
    index: number
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
  modelVersion?: string
  responseId?: string
}
```

## Data Models

### 流式响应处理状态

```typescript
interface StreamingState {
  buffer: string           // 累积的响应数据缓冲区
  isComplete: boolean      // 是否完成响应
  totalTokens: number      // 总 token 数量
  currentChunk: number     // 当前处理的数据块编号
}
```

### 解析结果

```typescript
interface ParseResult {
  textContent: string      // 提取的文本内容
  isComplete: boolean      // 是否为完整响应
  metadata?: {
    tokenCount: number
    finishReason: string
  }
}
```

## Error Handling

### 1. 网络错误处理
- HTTP 状态码错误
- 网络连接超时
- 请求被中止

### 2. 解析错误处理
- JSON 格式错误
- 数据结构不匹配
- 缺少必要字段

### 3. 流式处理错误
- 读取流中断
- 数据块不完整
- 编码解析错误

### 错误恢复策略

```typescript
interface ErrorRecoveryStrategy {
  retryCount: number
  fallbackToNonStreaming: boolean
  preservePartialContent: boolean
}
```

## Testing Strategy

### 1. 单元测试

#### StreamResponseParser 测试
- 测试正确的 JSON 解析
- 测试错误格式的处理
- 测试文本内容提取

#### GeminiAPI 流式方法测试
- 模拟正常的流式响应
- 模拟网络错误情况
- 测试中止请求功能

### 2. 集成测试

#### 端到端流式对话测试
- 发送消息并接收流式响应
- 验证 UI 实时更新
- 测试多轮对话场景

#### 错误场景测试
- API 密钥无效
- 网络连接问题
- 响应格式异常

### 3. 性能测试

#### 流式响应性能
- 大文本响应的处理速度
- 内存使用情况
- UI 更新频率优化

## Implementation Details

### 1. 响应格式适配

根据实际 API 响应格式，需要处理以下情况：
- 完整 JSON 对象（如用户提供的示例）
- 可能的流式 JSON 片段
- 错误响应格式

### 2. 缓冲区管理

```typescript
class ResponseBuffer {
  private buffer: string = ""
  
  append(chunk: string): void
  tryParseComplete(): GeminiStreamResponse | null
  clear(): void
}
```

### 3. 文本提取逻辑

```typescript
function extractTextFromResponse(response: GeminiStreamResponse): string {
  return response.candidates?.[0]?.content?.parts?.[0]?.text || ""
}
```

### 4. 流式更新优化

- 实现防抖机制避免过于频繁的 UI 更新
- 批量处理多个文本块
- 优化长文本的渲染性能

## Security Considerations

### 1. 输入验证
- 验证 API 响应的数据结构
- 防止 XSS 攻击（文本内容转义）
- 限制响应大小避免内存溢出

### 2. 错误信息处理
- 不暴露敏感的 API 错误信息
- 记录详细错误日志用于调试
- 用户友好的错误提示

## Performance Optimizations

### 1. 解析优化
- 使用流式 JSON 解析器（如需要）
- 避免重复的字符串操作
- 优化正则表达式使用

### 2. UI 更新优化
- 使用 requestAnimationFrame 控制更新频率
- 实现虚拟滚动处理长对话
- 延迟渲染复杂的 Markdown 内容

### 3. 内存管理
- 及时清理不需要的缓冲区
- 限制历史消息的内存占用
- 实现消息分页加载