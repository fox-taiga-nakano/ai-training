'use client';

import * as React from 'react';

import Link from 'next/link';

import { Button } from '@repo/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { DataTablePagination } from './components/data-table-pagination';

/**
 * DataTableコンポーネントの型定義
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

/**
 * データテーブルコンポーネント
 *
 * TanStack Tableを使用した高機能なデータテーブルです。
 * 検索、ソート、ページネーション機能を備えています。
 */
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  console.log('🚀 DataTable - レンダリング開始:', {
    dataLength: data.length,
    columnsLength: columns.length,
    timestamp: new Date().toISOString(),
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});

  // デバッグ: 初期データをログ出力
  React.useEffect(() => {
    console.log('🔄 DataTable - 初期データ:', data);
    console.log('🔄 DataTable - カラム数:', columns.length);
  }, [data, columns]);

  // デバッグ: ソート状態の変化をログ出力
  React.useEffect(() => {
    if (sorting.length > 0) {
      console.log('📊 DataTable - ソート状態変更:', sorting);
    }
  }, [sorting]);

  // デバッグ: フィルター状態の変化をログ出力
  React.useEffect(() => {
    if (columnFilters.length > 0) {
      console.log('🔍 DataTable - カラムフィルター変更:', columnFilters);
    }
  }, [columnFilters]);

  // デバッグ: グローバル検索の変化をログ出力
  React.useEffect(() => {
    if (globalFilter) {
      console.log('🔎 DataTable - グローバル検索:', globalFilter);
    }
  }, [globalFilter]);

  // デバッグ: 行選択状態の変化をログ出力
  React.useEffect(() => {
    const selectedCount = Object.keys(rowSelection).length;
    if (selectedCount > 0) {
      console.log('✅ DataTable - 選択された行数:', selectedCount, rowSelection);
    }
  }, [rowSelection]);

  // TanStack Tableの初期化
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
  });

  // デバッグ: テーブルの状態をログ出力
  React.useEffect(() => {
    const rowModel = table.getRowModel();
    const filteredRowModel = table.getFilteredRowModel();
    const paginationState = table.getState().pagination;

    console.log('📋 DataTable - テーブル状態:', {
      '総行数': rowModel.rows.length,
      'フィルター後行数': filteredRowModel.rows.length,
      '現在のページ': paginationState.pageIndex + 1,
      'ページサイズ': paginationState.pageSize,
      '総ページ数': table.getPageCount(),
    });
  }, [table, globalFilter, columnFilters, sorting]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="名前で検索..."
          value={globalFilter}
          onChange={(event) => {
            const value = event.target.value;
            console.log('🔎 DataTable - 検索入力:', value);
            console.log('🔎 DataTable - 検索前の状態:', {
              currentFilter: globalFilter,
              newValue: value,
              dataLength: data.length
            });
            setGlobalFilter(value);
          }}
          className="max-w-sm"
        />

        <Button asChild>
          <Link href="/employees/create">新規登録</Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {(() => {
              const rows = table.getRowModel().rows;
              console.log('📊 DataTable - TableBody レンダリング:', {
                'レンダリング対象行数': rows.length,
                '全体の行数': table.getCoreRowModel().rows.length,
                '検索クエリ': globalFilter,
                'フィルター適用中': columnFilters.length > 0,
              });
              return rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={() => {
                      console.log('👆 DataTable - 行クリック:', row.original);
                      console.log('👆 DataTable - 行ID:', row.id);
                      console.log('👆 DataTable - 選択状態:', row.getIsSelected());
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    検索結果がありません
                  </TableCell>
                </TableRow>
              );
            })()}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
