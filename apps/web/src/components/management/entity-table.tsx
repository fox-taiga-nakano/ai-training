'use client';

import { useState } from 'react';

import type { BaseEntity, TableAction, TableColumn } from '@/types/management';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Input } from '@repo/ui/components/input';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { cn } from '@repo/ui/lib/utils';
import { MoreHorizontal, Search } from 'lucide-react';

interface EntityTableProps<T extends BaseEntity> {
  title: string;
  description?: string;
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  createButton?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
}

export function EntityTable<T extends BaseEntity>({
  title,
  description,
  data,
  columns,
  actions = [],
  isLoading = false,
  searchPlaceholder = '検索...',
  searchValue = '',
  onSearchChange,
  onRowClick,
  emptyMessage,
  createButton,
  filters,
  className,
}: EntityTableProps<T>) {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const currentSearchValue = onSearchChange ? searchValue : internalSearchValue;
  const handleSearchChange = onSearchChange || setInternalSearchValue;

  // フィルタリングされたデータ
  const filteredData = onSearchChange
    ? data // 外部で管理されている場合
    : data.filter((item) => {
        if (!internalSearchValue) return true;
        return columns.some((column) => {
          const value = item[column.key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(internalSearchValue.toLowerCase());
        });
      });

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {createButton}
        </div>
      </CardHeader>
      <CardContent>
        {/* 検索・フィルター */}
        <div className="mb-4 flex items-center space-x-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={currentSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          {filters}
        </div>

        {/* テーブル */}
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right">アクション</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions
                            .filter(
                              (action) => !action.show || action.show(row)
                            )
                            .map((action, index) => {
                              const IconComponent = action.icon;
                              return (
                                <DropdownMenuItem
                                  key={index}
                                  onClick={() => action.onClick(row)}
                                  className={
                                    action.variant === 'destructive'
                                      ? 'text-destructive'
                                      : ''
                                  }
                                >
                                  {IconComponent && (
                                    <IconComponent className="mr-2 h-4 w-4" />
                                  )}
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="py-8 text-center"
                >
                  <div className="text-muted-foreground">
                    {emptyMessage ||
                      (currentSearchValue
                        ? '検索結果が見つかりません'
                        : 'データがありません')}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
