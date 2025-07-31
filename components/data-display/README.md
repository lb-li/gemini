# 数据展示组件库

企业级数据展示组件库，提供统计面板、增强表格、图表可视化和数据导出功能。

## 组件概览

### 1. StatisticsPanel - 统计面板组件

展示会话数据概览的统计面板，包含关键指标和趋势信息。

```tsx
import { StatisticsPanel } from '@/components/data-display'

<StatisticsPanel sessions={sessions} />
```

**功能特性：**
- 自动计算会话统计数据
- 显示趋势指示器
- 响应式网格布局
- 支持暗色主题

### 2. EnhancedTable - 增强表格组件

功能丰富的数据表格，支持排序、筛选、分页和批量操作。

```tsx
import { EnhancedTable, type TableColumn } from '@/components/data-display'

const columns: TableColumn<ChatSession>[] = [
  {
    key: 'title',
    label: '标题',
    sortable: true,
    render: (value) => <span className="font-medium">{value}</span>
  },
  // ... 更多列定义
]

<EnhancedTable
  data={sessions}
  columns={columns}
  searchable
  selectable
  exportable
  onBatchAction={handleBatchAction}
/>
```

**功能特性：**
- 列排序和筛选
- 全文搜索
- 多选和批量操作
- 分页导航
- 自定义渲染函数
- 导出功能

### 3. SessionCharts - 会话图表组件

基于 Recharts 的数据可视化组件，展示会话数据的多维度图表。

```tsx
import { SessionCharts } from '@/components/data-display'

<SessionCharts sessions={sessions} />
```

**包含图表：**
- 每日活动趋势线图
- 模型使用分布饼图
- 消息量统计柱状图
- 会话状态分布环形图

### 4. ExportDialog - 导出对话框

提供灵活的数据导出功能，支持多种格式和自定义选项。

```tsx
import { ExportDialog } from '@/components/data-display'

<ExportDialog
  data={sessions}
  messages={messages}
  onExport={handleExport}
/>
```

**支持格式：**
- JSON
- CSV
- Excel (XLSX)

**导出选项：**
- 包含消息内容
- 包含元数据
- 日期范围筛选

### 5. DataDashboard - 数据仪表板

综合性数据展示组件，整合所有数据展示功能。

```tsx
import { DataDashboard } from '@/components/data-display'

<DataDashboard
  sessions={sessions}
  messages={messages}
  onSessionUpdate={handleUpdate}
  onSessionDelete={handleDelete}
/>
```

## 工具函数

### exportUtils - 导出工具

```tsx
import { exportUtils } from '@/components/data-display'

// 导出为 JSON
exportUtils.exportToJSON(data, 'filename')

// 导出为 CSV
exportUtils.exportToCSV(data, 'filename')

// 导出为 Excel
exportUtils.exportToExcel(data, 'filename')
```

### batchUtils - 批量处理工具

```tsx
import { batchUtils } from '@/components/data-display'

// 批量删除
const result = await batchUtils.batchDelete(sessionIds, deleteFunction)

// 批量更新
const result = await batchUtils.batchUpdate(sessions, 'status', 'archived', updateFunction)

// 批量处理
const results = await batchUtils.processSessions(sessions, processor, batchSize)
```

## 类型定义

### TableColumn

```tsx
interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}
```

### TableFilter

```tsx
interface TableFilter {
  key: string
  label: string
  options: { label: string; value: string }[]
}
```

### ExportOptions

```tsx
interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  includeMessages: boolean
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}
```

## 使用示例

### 基础统计面板

```tsx
function SessionOverview({ sessions }: { sessions: ChatSession[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">会话概览</h2>
      <StatisticsPanel sessions={sessions} />
    </div>
  )
}
```

### 自定义表格

```tsx
function SessionTable({ sessions }: { sessions: ChatSession[] }) {
  const columns: TableColumn<ChatSession>[] = [
    {
      key: 'title',
      label: '会话标题',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'model',
      label: '模型',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant="secondary">
          {value.replace('gemini-', '').replace('-latest', '')}
        </Badge>
      )
    }
  ]

  const filters: TableFilter[] = [
    {
      key: 'model',
      label: '模型',
      options: [
        { label: '1.5 Pro', value: 'gemini-1.5-pro-latest' },
        { label: '1.5 Flash', value: 'gemini-1.5-flash-latest' }
      ]
    }
  ]

  return (
    <EnhancedTable
      data={sessions}
      columns={columns}
      filters={filters}
      searchable
      selectable
      exportable
      pageSize={20}
    />
  )
}
```

### 完整仪表板

```tsx
function SessionDashboard() {
  const { sessions, messages } = useAppStore()

  const handleSessionUpdate = async (id: number, updates: Partial<ChatSession>) => {
    // 更新会话逻辑
  }

  const handleSessionDelete = async (id: number) => {
    // 删除会话逻辑
  }

  return (
    <DataDashboard
      sessions={sessions}
      messages={messages}
      onSessionUpdate={handleSessionUpdate}
      onSessionDelete={handleSessionDelete}
    />
  )
}
```

## 样式定制

所有组件都使用 Tailwind CSS 和 shadcn/ui 设计系统，支持主题定制：

```css
/* 自定义统计卡片样式 */
.statistics-panel .card {
  @apply border-l-4 border-l-primary;
}

/* 自定义表格样式 */
.enhanced-table .table-row:hover {
  @apply bg-muted/30;
}
```

## 性能优化

- 使用 React.memo 优化组件渲染
- 虚拟化大数据集表格
- 懒加载图表组件
- 防抖搜索和筛选

## 可访问性

- 完整的键盘导航支持
- 屏幕阅读器兼容
- 高对比度主题支持
- ARIA 标签和角色定义

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+