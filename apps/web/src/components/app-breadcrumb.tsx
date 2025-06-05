'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';

import { generateBreadcrumbs } from '@/lib/breadcrumb';

import { data } from '@/components/app-sidebar';

/**
 * サイドバーのナビゲーションデータを使用したパンくずリストコンポーネント
 *
 * app-sidebar.tsxのデータ構造に基づいてパンくずリストを動的に生成します。
 * 現在のパスに対応するパンくずリストを表示します。
 */
export function AppBreadcrumb() {
  const pathname = usePathname();

  // app-sidebar.tsxからエクスポートされたナビゲーションデータを使用
  const navItems = React.useMemo(() => {
    return data.navMain;
  }, []);

  // パンくずリストを生成
  const breadcrumbs = React.useMemo(() => {
    return generateBreadcrumbs(pathname, navItems);
  }, [pathname, navItems]);

  // パンくずリストが1つしかない場合（トップページのみ）は表示しない
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
