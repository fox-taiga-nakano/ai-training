'use client';

import { useForm } from 'react-hook-form';

import type {
  BaseEntity,
  FormField as FormFieldType,
} from '@/types/management';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';

interface EntityFormDialogProps<T extends BaseEntity> {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FormFieldType[];
  schema: any; // Zod schema
  defaultValues?: Partial<T>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function EntityFormDialog<T extends BaseEntity>({
  title,
  description,
  isOpen,
  onOpenChange,
  fields,
  schema,
  defaultValues = {},
  onSubmit,
  isLoading = false,
  submitLabel = '保存',
  cancelLabel = 'キャンセル',
}: EntityFormDialogProps<T>) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const handleSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  };

  const renderField = (field: FormFieldType) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FormLabel>
            <FormControl>
              {field.type === 'textarea' ? (
                <Textarea placeholder={field.placeholder} {...formField} />
              ) : field.type === 'select' ? (
                <Select
                  onValueChange={formField.onChange}
                  value={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  {...formField}
                  className={field.type === 'tel' ? 'font-mono' : ''}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="max-h-[60vh] space-y-4 overflow-y-auto">
              {fields.map(renderField)}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? `${submitLabel}中...` : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
