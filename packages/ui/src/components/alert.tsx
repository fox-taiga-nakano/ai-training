import * as React from 'react';

import { cn } from '@repo/ui/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground border-border',
        destructive:
          'border-red-200 bg-red-50 text-red-800 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400 [&>svg]:text-red-600 dark:[&>svg]:text-red-400 *:data-[slot=alert-description]:text-red-700 dark:*:data-[slot=alert-description]:text-red-300',
        success:
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800/30 dark:bg-green-950/20 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400 *:data-[slot=alert-description]:text-green-700 dark:*:data-[slot=alert-description]:text-green-300',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800/30 dark:bg-yellow-950/20 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400 *:data-[slot=alert-description]:text-yellow-700 dark:*:data-[slot=alert-description]:text-yellow-300',
        info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/30 dark:bg-blue-950/20 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400 *:data-[slot=alert-description]:text-blue-700 dark:*:data-[slot=alert-description]:text-blue-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
