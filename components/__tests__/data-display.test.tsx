import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  StatisticsPanel,
  EnhancedTable,
  SessionCharts,
  ExportDialog,
  exportUtils,
  batchUtils,
  type TableColumn
} from '@/components/data-display'
import type { ChatSession, ChatMessage } from '@/types'

// Mock data
const mockSessions: ChatSession[] = [
  {
    id: 1,
    title: 'Test Session 1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    model: 'gemini-1.5-pro-latest',
    messageCount: 5,
    status: 'active',
    tags: ['test'],
    priority: 'normal',
    metadata: {
      totalTokens: 1000,
      avgResponseTime: 1.5,
      lastActivity: new Date('2024-01-02')
    }
  },
  {
    id: 2,
    title: 'Test Session 2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-03'),
    model: 'gemini-1.5-flash-latest',
    messageCount: 3,
    status: 'archived',
    tags: ['test', 'archived'],
    priority: 'low',
    metadata: {
      totalTokens: 500,
      avgResponseTime: 0.8,
      lastActivity: new Date('2024-01-03')
    }
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: 1,
    sessionId: 1,
    role: 'user',
    content: 'Hello',
    timestamp: new Date('2024-01-01T10:00:00')
  },
  {
    id: 2,
    sessionId: 1,
    role: 'model',
    content: 'Hi there!',
    timestamp: new Date('2024-01-01T10:00:01')
  }
]

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('StatisticsPanel', () => {
  it('renders statistics correctly', () => {
    render(<StatisticsPanel sessions={mockSessions} />)
    
    expect(screen.getByText('总会话数')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('总消息数')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('calculates statistics correctly', () => {
    render(<StatisticsPanel sessions={mockSessions} />)
    
    // Check total sessions
    expect(screen.getByText('2')).toBeInTheDocument()
    
    // Check total messages (5 + 3 = 8)
    expect(screen.getByText('8')).toBeInTheDocument()
    
    // Check token usage (1000 + 500 = 1500, displayed as 1.5K)
    expect(screen.getByText('1.5K')).toBeInTheDocument()
  })

  it('handles empty sessions array', () => {
    render(<StatisticsPanel sessions={[]} />)
    
    expect(screen.getByText('总会话数')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

describe('EnhancedTable', () => {
  const mockColumns: TableColumn<ChatSession>[] = [
    {
      key: 'title',
      label: '标题',
      sortable: true
    },
    {
      key: 'model',
      label: '模型',
      sortable: true,
      filterable: true
    },
    {
      key: 'messageCount',
      label: '消息数',
      sortable: true,
      render: (value) => <span data-testid="message-count">{value || 0}</span>
    }
  ]

  it('renders table with data', () => {
    render(
      <EnhancedTable
        data={mockSessions}
        columns={mockColumns}
      />
    )
    
    expect(screen.getByText('Test Session 1')).toBeInTheDocument()
    expect(screen.getByText('Test Session 2')).toBeInTheDocument()
    expect(screen.getByText('gemini-1.5-pro-latest')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    render(
      <EnhancedTable
        data={mockSessions}
        columns={mockColumns}
        searchable
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索...')
    fireEvent.change(searchInput, { target: { value: 'Session 1' } })
    
    await waitFor(() => {
      expect(screen.getByText('Test Session 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Session 2')).not.toBeInTheDocument()
    })
  })

  it('handles sorting', async () => {
    render(
      <EnhancedTable
        data={mockSessions}
        columns={mockColumns}
      />
    )
    
    const titleHeader = screen.getByText('标题')
    fireEvent.click(titleHeader)
    
    // Should sort by title
    await waitFor(() => {
      const rows = screen.getAllByTestId('message-count')
      expect(rows).toHaveLength(2)
    })
  })

  it('handles row selection', () => {
    const onRowSelect = vi.fn()
    
    render(
      <EnhancedTable
        data={mockSessions}
        columns={mockColumns}
        selectable
        onRowSelect={onRowSelect}
      />
    )
    
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // First data row checkbox
    
    expect(onRowSelect).toHaveBeenCalled()
  })

  it('handles pagination', () => {
    const largeMockData = Array.from({ length: 25 }, (_, i) => ({
      ...mockSessions[0],
      id: i + 1,
      title: `Session ${i + 1}`
    }))
    
    render(
      <EnhancedTable
        data={largeMockData}
        columns={mockColumns}
        pageSize={10}
      />
    )
    
    expect(screen.getByText('下一页')).toBeInTheDocument()
    expect(screen.getByText('显示 1 - 10 共 25 条记录')).toBeInTheDocument()
  })
})

describe('ExportDialog', () => {
  it('renders export dialog', () => {
    const onExport = vi.fn()
    
    render(
      <ExportDialog
        data={mockSessions}
        onExport={onExport}
      />
    )
    
    const exportButton = screen.getByText('导出数据')
    expect(exportButton).toBeInTheDocument()
  })

  it('handles export options', async () => {
    const onExport = vi.fn()
    
    render(
      <ExportDialog
        data={mockSessions}
        onExport={onExport}
      />
    )
    
    // Open dialog
    fireEvent.click(screen.getByText('导出数据'))
    
    await waitFor(() => {
      expect(screen.getByText('选择导出格式和包含的数据类型')).toBeInTheDocument()
    })
    
    // Click export button in dialog
    const exportButton = screen.getByRole('button', { name: /导出/ })
    fireEvent.click(exportButton)
    
    expect(onExport).toHaveBeenCalledWith(
      mockSessions,
      expect.objectContaining({
        format: 'json',
        includeMessages: false,
        includeMetadata: true
      })
    )
  })
})

describe('exportUtils', () => {
  // Mock URL.createObjectURL and related functions
  const mockCreateObjectURL = vi.fn(() => 'mock-url')
  const mockRevokeObjectURL = vi.fn()
  const mockClick = vi.fn()
  const mockAppendChild = vi.fn()
  const mockRemoveChild = vi.fn()

  beforeEach(() => {
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    
    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: mockClick
    }
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)
  })

  it('exports to JSON', () => {
    exportUtils.exportToJSON(mockSessions, 'test')
    
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('exports to CSV', () => {
    exportUtils.exportToCSV(mockSessions, 'test')
    
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
  })

  it('handles empty data for CSV export', () => {
    exportUtils.exportToCSV([], 'test')
    
    // Should not create blob for empty data
    expect(mockCreateObjectURL).not.toHaveBeenCalled()
  })
})

describe('batchUtils', () => {
  it('processes sessions in batches', async () => {
    const processor = vi.fn().mockResolvedValue('processed')
    
    const results = await batchUtils.processSessions(
      mockSessions,
      processor,
      1 // Small batch size for testing
    )
    
    expect(processor).toHaveBeenCalledTimes(2)
    expect(results).toEqual(['processed', 'processed'])
  })

  it('handles batch delete', async () => {
    const deleteFunction = vi.fn().mockResolvedValue(undefined)
    
    const result = await batchUtils.batchDelete([1, 2], deleteFunction)
    
    expect(deleteFunction).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ success: 2, failed: 0 })
  })

  it('handles batch delete with failures', async () => {
    const deleteFunction = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Delete failed'))
    
    const result = await batchUtils.batchDelete([1, 2], deleteFunction)
    
    expect(result).toEqual({ success: 1, failed: 1 })
  })

  it('handles batch update', async () => {
    const updateFunction = vi.fn().mockResolvedValue(undefined)
    
    const result = await batchUtils.batchUpdate(
      mockSessions,
      'status',
      'archived',
      updateFunction
    )
    
    expect(updateFunction).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ success: 2, failed: 0 })
  })
})