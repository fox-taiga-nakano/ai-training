'use client';

import type {
  BaseEntity,
  DetailSection,
  RelatedData,
} from '@/types/management';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Edit, Trash2 } from 'lucide-react';

interface EntityDetailSheetProps<T extends BaseEntity> {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: T | null;
  sections: DetailSection<T>[];
  relatedData?: RelatedData[];
  actions?: Array<{
    label: string;
    icon?: any;
    variant?: 'default' | 'destructive' | 'outline';
    onClick: (data: T) => void;
    show?: (data: T) => boolean;
  }>;
  isLoading?: boolean;
}

export function EntityDetailSheet<T extends BaseEntity>({
  title,
  description,
  isOpen,
  onOpenChange,
  data,
  sections,
  relatedData = [],
  actions = [],
  isLoading = false,
}: EntityDetailSheetProps<T>) {
  if (!data && !isLoading) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[700px] overflow-y-auto sm:w-[640px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-6">
            {/* 基本情報スケルトン */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="mb-1 h-4 w-20" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : data ? (
          <div className="mt-6 space-y-6">
            {/* 基本情報セクション */}
            {sections.map((section, sectionIndex) => (
              <Card key={sectionIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className={
                          field.label.includes('ID') ||
                          field.label.includes('コード')
                            ? 'col-span-1'
                            : field.label.includes('メール') ||
                                field.label.includes('名')
                              ? 'col-span-2'
                              : 'col-span-1'
                        }
                      >
                        <p className="text-muted-foreground text-sm font-medium">
                          {field.label}
                        </p>
                        <div className="mt-1">
                          {field.formatter ? (
                            field.formatter(data[field.key], data)
                          ) : (
                            <p
                              className={
                                field.key.includes('id') ||
                                field.key.includes('code')
                                  ? 'font-mono'
                                  : ''
                              }
                            >
                              {data[field.key] || '未設定'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 関連データセクション */}
            {relatedData.map((related, relatedIndex) => (
              <Card key={relatedIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">{related.title}</CardTitle>
                  {related.description && (
                    <CardDescription>{related.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {related.data.length > 0 ? (
                    <div className="space-y-3">
                      {related.data.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="space-y-1">
                            {related.columns.map((column, columnIndex) => {
                              if (columnIndex === 0) {
                                return (
                                  <p key={columnIndex} className="font-medium">
                                    {column.render
                                      ? column.render(item[column.key], item)
                                      : item[column.key]}
                                  </p>
                                );
                              } else if (columnIndex === 1) {
                                return (
                                  <p
                                    key={columnIndex}
                                    className="text-muted-foreground text-sm"
                                  >
                                    {column.render
                                      ? column.render(item[column.key], item)
                                      : item[column.key]}
                                  </p>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <div className="text-right">
                            {related.columns
                              .slice(2)
                              .map((column, columnIndex) => (
                                <div
                                  key={columnIndex}
                                  className={
                                    columnIndex === 0
                                      ? 'font-medium'
                                      : 'text-muted-foreground text-sm'
                                  }
                                >
                                  {column.render
                                    ? column.render(item[column.key], item)
                                    : item[column.key]}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center">
                      {related.emptyMessage || 'データがありません'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* アクションボタン */}
            {actions.length > 0 && (
              <div className="flex gap-2">
                {actions
                  .filter((action) => !action.show || action.show(data))
                  .map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        onClick={() => action.onClick(data)}
                      >
                        {IconComponent && (
                          <IconComponent className="mr-2 h-4 w-4" />
                        )}
                        {action.label}
                      </Button>
                    );
                  })}
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
