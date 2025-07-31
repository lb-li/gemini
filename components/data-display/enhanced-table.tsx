"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react"

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

export interface TableFilter {
  key: string
  label: string
  options: { label: string; value: string }[]
}

interface EnhancedTableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  filters?: TableFilter[]
  searchable?: boolean
  selectable?: boolean
  exportable?: boolean
  pageSize?: number
  className?: string
  onRowSelect?: (selectedRows: T[]) => void
  onExport?: (data: T[]) => void
  onBatchAction?: (action: string, selectedRows: T[]) => void
}

type SortConfig<T> = {
  key: keyof T
  direction: 'asc' | 'desc'
} | null

export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  searchable = true,
  selectable = false,
  exportable = false,
  pageSize = 10,
  className,
  onRowSelect,
  onExport,
  onBatchAction,
}: EnhancedTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T>>(null)
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({})
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => String(row[key]) === value)
      }
    })

    return result
  }, [data, searchTerm, activeFilters, columns])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sorting
  const handleSort = (key: keyof T) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  // Handle row selection
  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(index)
    } else {
      newSelected.delete(index)
    }
    setSelectedRows(newSelected)
    
    if (onRowSelect) {
      const selectedData = Array.from(newSelected).map(i => sortedData[i])
      onRowSelect(selectedData)
    }
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(paginatedData.map((_, index) => index))
      setSelectedRows(allIndices)
      if (onRowSelect) {
        onRowSelect(paginatedData)
      }
    } else {
      setSelectedRows(new Set())
      if (onRowSelect) {
        onRowSelect([])
      }
    }
  }

  // Handle export
  const handleExport = () => {
    if (onExport) {
      const dataToExport = selectedRows.size > 0 
        ? Array.from(selectedRows).map(i => sortedData[i])
        : sortedData
      onExport(dataToExport)
    }
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 items-center">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          
          {filters.map(filter => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || ""}
              onValueChange={(value) => 
                setActiveFilters(prev => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex gap-2">
          {selectedRows.size > 0 && onBatchAction && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  批量操作 ({selectedRows.size})
                  <MoreHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBatchAction('delete', Array.from(selectedRows).map(i => sortedData[i]))}>
                  删除选中
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchAction('archive', Array.from(selectedRows).map(i => sortedData[i]))}>
                  归档选中
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBatchAction('export', Array.from(selectedRows).map(i => sortedData[i]))}>
                  导出选中
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead 
                  key={String(column.key)} 
                  className={cn(
                    column.sortable && "cursor-pointer hover:bg-muted/50",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onCheckedChange={(checked) => handleRowSelect(index, checked as boolean)}
                      />
                    </TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell key={String(column.key)}>
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '-')
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} 
            共 {sortedData.length} 条记录
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}