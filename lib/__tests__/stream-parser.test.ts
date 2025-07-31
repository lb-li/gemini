import { StreamResponseParser, parseStreamChunk } from "../stream-parser"

describe("StreamResponseParser", () => {
  let parser: StreamResponseParser

  beforeEach(() => {
    parser = new StreamResponseParser(false)
  })

  describe("parseChunk", () => {
    it("should parse single JSON response correctly", () => {
      const chunk = `{"candidates": [{"content": {"parts": [{"text": "你好！有什么可以帮你的吗？"}],"role": "model"},"finishReason": "STOP","index": 0}],"usageMetadata": {"promptTokenCount": 2,"candidatesTokenCount": 8,"totalTokenCount": 169},"modelVersion": "gemini-2.5-flash","responseId": "LdGKaIu3NoKsmtkP0M27iQ8"}`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(1)
      expect(results[0]).toBe("你好！有什么可以帮你的吗？")
    })

    it("should parse JSON array response correctly", () => {
      const chunk = `[{"candidates": [{"content": {"parts": [{"text": "你好！有什么可以帮你的吗？"}],"role": "model"},"finishReason": "STOP","index": 0}],"usageMetadata": {"promptTokenCount": 2,"candidatesTokenCount": 8,"totalTokenCount": 169},"modelVersion": "gemini-2.5-flash","responseId": "LdGKaIu3NoKsmtkP0M27iQ8"}]`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(1)
      expect(results[0]).toBe("你好！有什么可以帮你的吗？")
    })

    it("should handle data: prefix format", () => {
      const chunk = `data: {"candidates": [{"content": {"parts": [{"text": "Hello"}],"role": "model"},"finishReason": "STOP","index": 0}]}`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(1)
      expect(results[0]).toBe("Hello")
    })

    it("should handle multiple lines", () => {
      const chunk = `data: {"candidates": [{"content": {"parts": [{"text": "Hello"}],"role": "model"},"finishReason": "STOP","index": 0}]}
data: {"candidates": [{"content": {"parts": [{"text": " World"}],"role": "model"},"finishReason": "STOP","index": 0}]}`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(2)
      expect(results[0]).toBe("Hello")
      expect(results[1]).toBe(" World")
    })

    it("should skip empty lines and [DONE] markers", () => {
      const chunk = `
data: {"candidates": [{"content": {"parts": [{"text": "Hello"}],"role": "model"},"finishReason": "STOP","index": 0}]}

[DONE]`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(1)
      expect(results[0]).toBe("Hello")
    })

    it("should handle malformed JSON gracefully", () => {
      const chunk = `data: {"invalid": json}
data: {"candidates": [{"content": {"parts": [{"text": "Valid"}],"role": "model"},"finishReason": "STOP","index": 0}]}`

      const results = parser.parseChunk(chunk)
      
      expect(results).toHaveLength(1)
      expect(results[0]).toBe("Valid")
    })

    it("should return empty array for empty input", () => {
      expect(parser.parseChunk("")).toEqual([])
      expect(parser.parseChunk("   ")).toEqual([])
      expect(parser.parseChunk("\n\n")).toEqual([])
    })
  })

  describe("extractTextContent", () => {
    it("should extract text from valid response", () => {
      const jsonData = {
        candidates: [{
          content: {
            parts: [{ text: "Hello World" }],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }]
      }

      const result = parser.extractTextContent(jsonData)
      expect(result).toBe("Hello World")
    })

    it("should extract text from array response", () => {
      const jsonData = [{
        candidates: [{
          content: {
            parts: [{ text: "Hello from array" }],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }]
      }]

      const result = parser.extractTextContent(jsonData)
      expect(result).toBe("Hello from array")
    })

    it("should return null for invalid structure", () => {
      expect(parser.extractTextContent({})).toBeNull()
      expect(parser.extractTextContent({ candidates: [] })).toBeNull()
      expect(parser.extractTextContent({ candidates: [{}] })).toBeNull()
      expect(parser.extractTextContent(null)).toBeNull()
    })

    it("should find text part among multiple parts", () => {
      const jsonData = {
        candidates: [{
          content: {
            parts: [
              { inlineData: { mimeType: "image/png", data: "base64data" } },
              { text: "Found it!" }
            ],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }]
      }

      const result = parser.extractTextContent(jsonData)
      expect(result).toBe("Found it!")
    })
  })

  describe("parseResponse", () => {
    it("should parse complete response with metadata", () => {
      const jsonData = {
        candidates: [{
          content: {
            parts: [{ text: "Complete response" }],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }],
        usageMetadata: {
          promptTokenCount: 5,
          candidatesTokenCount: 10,
          totalTokenCount: 15
        },
        modelVersion: "gemini-1.5-pro",
        responseId: "test-123"
      }

      const result = parser.parseResponse(jsonData)
      
      expect(result.textContent).toBe("Complete response")
      expect(result.isComplete).toBe(true)
      expect(result.metadata).toEqual({
        tokenCount: 10,
        finishReason: "STOP",
        modelVersion: "gemini-1.5-pro",
        responseId: "test-123"
      })
    })

    it("should handle incomplete response", () => {
      const jsonData = {
        candidates: [{
          content: {
            parts: [{ text: "Incomplete" }],
            role: "model"
          },
          finishReason: "MAX_TOKENS",
          index: 0
        }]
      }

      const result = parser.parseResponse(jsonData)
      
      expect(result.textContent).toBe("Incomplete")
      expect(result.isComplete).toBe(false)
      expect(result.metadata?.finishReason).toBe("MAX_TOKENS")
    })
  })

  describe("isValidGeminiResponse", () => {
    it("should validate correct response structure", () => {
      const validResponse = {
        candidates: [{
          content: {
            parts: [{ text: "Valid" }],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }]
      }

      expect(parser.isValidGeminiResponse(validResponse)).toBe(true)
    })

    it("should validate array response", () => {
      const validArrayResponse = [{
        candidates: [{
          content: {
            parts: [{ text: "Valid array" }],
            role: "model"
          },
          finishReason: "STOP",
          index: 0
        }]
      }]

      expect(parser.isValidGeminiResponse(validArrayResponse)).toBe(true)
    })

    it("should reject invalid structures", () => {
      expect(parser.isValidGeminiResponse({})).toBe(false)
      expect(parser.isValidGeminiResponse(null)).toBe(false)
      expect(parser.isValidGeminiResponse({ candidates: [] })).toBe(false)
      expect(parser.isValidGeminiResponse({ candidates: [{}] })).toBe(false)
    })
  })

  describe("debug mode", () => {
    it("should enable debug mode", () => {
      const debugParser = new StreamResponseParser(true)
      
      // Mock console.warn to test debug output
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      debugParser.parseChunk('invalid json')
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })

    it("should toggle debug mode", () => {
      parser.setDebugMode(true)
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      parser.parseChunk('invalid json')
      
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })
})

describe("parseStreamChunk utility function", () => {
  it("should work as standalone function", () => {
    const chunk = `{"candidates": [{"content": {"parts": [{"text": "Utility test"}],"role": "model"},"finishReason": "STOP","index": 0}]}`
    
    const results = parseStreamChunk(chunk)
    
    expect(results).toHaveLength(1)
    expect(results[0]).toBe("Utility test")
  })
})