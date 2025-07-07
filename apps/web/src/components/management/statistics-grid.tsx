'use client';

import type { StatisticCard } from '@/types/management';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';

interface StatisticsGridProps {
  statistics: StatisticCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatisticsGrid({
  statistics,
  columns = 4,
  className,
}: StatisticsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {statistics.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {stat.description}
                </p>
                {stat.trend && (
                  <div
                    className={cn(
                      'text-xs font-medium',
                      stat.trend.isPositive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {stat.trend.isPositive ? '+' : ''}
                    {stat.trend.value}% {stat.trend.label}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
