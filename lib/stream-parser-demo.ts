/**
 * StreamResponseParser 演示和测试文件
 * 用于验证解析器功能是否正常工作
 */

import { StreamResponseParser } from "./stream-parser"

// 测试数据 - 基于用户提供的实际响应格式
const testResponses = {
  // 用户提供的实际响应格式
  userExample: `[{"candidates": [{"content": {"parts": [{"text": "你好！有什么可以帮你的吗？"}],"role": "model"},"finishReason": "STOP","index": 0}],"usageMetadata": {"promptTokenCount": 2,"candidatesTokenCount": 8,"totalTokenCount": 169,"promptTokensDetails": [{"modality": "TEXT","tokenCount": 2}],"thoughtsTokenCount": 159},"modelVersion": "gemini-2.5-flash","responseId": "LdGKaIu3NoKsmtkP0M27iQ8"}]`,
  
  // 标准单个对象格式
  singleObject: `{"candidates": [{"content": {"parts": [{"text": "Hello World!"}],"role": "model"},"finishReason": "STOP","index": 0}],"usageMetadata": {"promptTokenCount": 3,"candidatesTokenCount": 5,"totalTokenCount": 8},"modelVersion": "gemini-1.5-pro","responseId": "test-123"}`,
  
  // SSE 格式（带 data: 前缀）
  sseFormat: `data: {"candidates": [{"content": {"parts": [{"text": "SSE format test"}],"role": "model"},"finishReason": "STOP","index": 0}]}`,
  
  // 多行流式响应
  multiLine: `data: {"candidates": [{"content": {"parts": [{"text": "First "}],"role": "model"},"finishReason": "STOP","index": 0}]}
data: {"candidates": [{"content": {"parts": [{"text": "Second "}],"role": "model"},"finishReason": "STOP","index": 0}]}
data: {"candidates": [{"content": {"parts": [{"text": "Third"}],"role": "model"},"finishReason": "STOP","index": 0}]}`,
  
  // 包含空行和结束标记
  withEmptyLines: `
data: {"candidates": [{"content": {"parts": [{"text": "Before empty lines"}],"role": "model"},"finishReason": "STOP","index": 0}]}

data: {"candidates": [{"content": {"parts": [{"text": "After empty lines"}],"role": "model"},"finishReason": "STOP","index": 0}]}

[DONE]`,
  
  // 错误格式混合
  mixedFormat: `data: {"invalid": json}
data: {"candidates": [{"content": {"parts": [{"text": "Valid after error"}],"role": "model"},"finishReason": "STOP","index": 0}]}
invalid line without data prefix
data: {"candidates": [{"content": {"parts": [{"text": "Another valid"}],"role": "model"},"finishReason": "STOP","index": 0}]}`
}

/**
 * 运行解析器测试
 */
export function runParserDemo() {
  console.log("🚀 StreamResponseParser 演示开始\n")
  
  const parser = new StreamResponseParser(true) // 启用调试模式
  
  // 测试用户提供的实际响应格式
  console.log("📝 测试: 用户提供的实际响应格式")
  const userExample = testResponses.userExample
  console.log(`输入: ${userExample.substring(0, 100)}...`)
  
  try {
    const results = parser.parseChunk(userExample)
    console.log(`✅ 解析结果: [${results.join(', ')}]`)
    
    // 测试详细解析
    const jsonData = JSON.parse(userExample)
    const parseResult = parser.parseResponse(jsonData[0])
    console.log(`📊 详细解析:`, {
      textContent: parseResult.textContent,
      isComplete: parseResult.isComplete,
      tokenCount: parseResult.metadata?.tokenCount
    })
  } catch (error) {
    console.log(`❌ 解析失败: ${error}`)
  }
  
  console.log('---\n')
  
  // 测试多行格式
  console.log("📝 测试: 多行流式响应")
  const multiLine = testResponses.multiLine
  console.log(`输入: 多行数据...`)
  
  try {
    const results = parser.parseChunk(multiLine)
    console.log(`✅ 解析结果: [${results.join(', ')}]`)
  } catch (error) {
    console.log(`❌ 解析失败: ${error}`)
  }
  
  console.log('---\n')
  
  // 测试验证功能
  console.log("🔍 测试响应验证功能")
  
  const validResponse = {
    candidates: [{
      content: {
        parts: [{ text: "Valid response" }],
        role: "model"
      },
      finishReason: "STOP",
      index: 0
    }]
  }
  
  const invalidResponse = { invalid: "structure" }
  
  console.log(`✅ 有效响应验证: ${parser.isValidGeminiResponse(validResponse)}`)
  console.log(`❌ 无效响应验证: ${parser.isValidGeminiResponse(invalidResponse)}`)
  
  console.log("\n🎉 StreamResponseParser 演示完成!")
}