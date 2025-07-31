import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MessageInput } from '../message-input'
import { useAppStore } from '@/store/app-store'

// Mock the store
vi.mock('@/store/app-store')
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn(() => false)
}))

const mockStore = {
  currentSessionId: 1,
  isLoading: false,
  addMessage: vi.fn(),
  setIsLoading: vi.fn(),
  getGeminiAPI: vi.fn(() => ({
    streamGenerateContent: vi.fn(),
    abort: vi.fn()
  })),
  sessions: [{ id: 1, title: '新对话', model: 'gemini-1.5-pro-latest' }],
  updateSessionTitle: vi.fn(),
  updateStreamingMessage: vi.fn(),
  updateMessageInDB: vi.fn(),
  setStreamingMessageId: vi.fn(),
  messages: []
}

describe('MessageInput Enhanced Features', () => {
  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStore)
  })

  it('renders enhanced input area with new features', () => {
    render(<MessageInput />)
    
    // Check for smart suggestions button
    expect(screen.getByLabelText(/智能建议/)).toBeInTheDocument()
    
    // Check for keyboard shortcuts button
    expect(screen.getByLabelText(/快捷键帮助/)).toBeInTheDocument()
    
    // Check for character count
    expect(screen.getByText(/0/)).toBeInTheDocument()
    expect(screen.getByText(/4000/)).toBeInTheDocument()
  })

  it('shows smart suggestions when triggered', async () => {
    render(<MessageInput />)
    
    const suggestionsButton = screen.getByLabelText(/智能建议/)
    fireEvent.click(suggestionsButton)
    
    await waitFor(() => {
      expect(screen.getByPlaceholder(/搜索模板和短语/)).toBeInTheDocument()
    })
  })

  it('updates character count as user types', () => {
    render(<MessageInput />)
    
    const textarea = screen.getByPlaceholderText(/输入消息/)
    fireEvent.change(textarea, { target: { value: 'Hello World' } })
    
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('shows warning when character limit is exceeded', () => {
    render(<MessageInput />)
    
    const textarea = screen.getByPlaceholderText(/输入消息/)
    const longText = 'a'.repeat(4001)
    fireEvent.change(textarea, { target: { value: longText } })
    
    expect(screen.getByText(/超出限制/)).toBeInTheDocument()
  })

  it('handles keyboard shortcuts correctly', () => {
    render(<MessageInput />)
    
    const textarea = screen.getByPlaceholderText(/输入消息/)
    
    // Test Ctrl+K for suggestions
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true })
    expect(screen.getByPlaceholder(/搜索模板和短语/)).toBeInTheDocument()
  })
})