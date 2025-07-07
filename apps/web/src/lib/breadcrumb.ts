/**
 * パンくずリストを動的に生成するためのユーティリティ関数
 *
 * @param pathname 現在のパス
 * @returns パンくずリストのアイテム配列
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

/**
 * サイドバーのナビゲーション項目の型定義
 */
interface NavItem {
  title: string;
  url: string;
  icon?: unknown;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

/**
 * サイドバーのデータ構造からパンくずリストのアイテムを検索する
 * 完全一致だけでなく、パスの一部一致も検出する
 *
 * @param navItems サイドバーのナビゲーション項目配列
 * @param pathname 現在のパス
 * @returns 見つかったパンくずアイテム配列、見つからない場合は空配列
 */
function findBreadcrumbsFromNavItems(
  navItems: NavItem[],
  pathname: string
): BreadcrumbItem[] {
  // パスが「/」の場合はトップページとして扱う
  if (pathname === '/') {
    return [
      {
        label: 'トップ',
        href: '/',
        isCurrent: true,
      },
    ];
  }

  // パスの正規化（末尾のスラッシュを削除）
  const normalizedPath =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  // 完全一致を優先して検索
  for (const item of navItems) {
    // 親項目のURLがパスと一致する場合
    if (item.url === normalizedPath) {
      return [
        {
          label: 'トップ',
          href: '/',
          isCurrent: false,
        },
        {
          label: item.title,
          href: item.url,
          isCurrent: true,
        },
      ];
    }

    // 子項目がある場合、子項目を検索
    if (item.items && item.items.length > 0) {
      for (const subItem of item.items) {
        if (subItem.url === normalizedPath) {
          return [
            {
              label: 'トップ',
              href: '/',
              isCurrent: false,
            },
            {
              label: item.title,
              href: item.url,
              isCurrent: false,
            },
            {
              label: subItem.title,
              href: subItem.url,
              isCurrent: true,
            },
          ];
        }
      }
    }
  }

  // 完全一致が見つからない場合、パスの一部一致を検索
  // 例: '/employees/departments/123' のようなパスで '/employees/departments' を検出
  for (const item of navItems) {
    if (normalizedPath.startsWith(item.url) && item.url !== '/') {
      // 子項目を検索
      if (item.items && item.items.length > 0) {
        for (const subItem of item.items) {
          if (normalizedPath.startsWith(subItem.url) && subItem.url !== '/') {
            // 子項目のURLがパスの一部と一致する場合
            return [
              {
                label: 'トップ',
                href: '/',
                isCurrent: false,
              },
              {
                label: item.title,
                href: item.url,
                isCurrent: false,
              },
              {
                label: subItem.title,
                href: subItem.url,
                isCurrent: false,
              },
              // 残りのパスはgeneratePathBasedBreadcrumbsで処理
              ...generatePathBasedBreadcrumbs(
                normalizedPath.substring(subItem.url.length),
                navItems
              )
                .slice(1) // 最初の「トップ」は既に含まれているので除外
                .map((crumb) => ({
                  ...crumb,
                  href: subItem.url + crumb.href, // パスを結合
                  isCurrent: crumb.isCurrent, // 最後の項目のみ現在のページとしてマーク
                })),
            ];
          }
        }
      }

      // 親項目のURLがパスの一部と一致する場合
      return [
        {
          label: 'トップ',
          href: '/',
          isCurrent: false,
        },
        {
          label: item.title,
          href: item.url,
          isCurrent: false,
        },
        // 残りのパスはgeneratePathBasedBreadcrumbsで処理
        ...generatePathBasedBreadcrumbs(
          normalizedPath.substring(item.url.length),
          navItems
        )
          .slice(1) // 最初の「トップ」は既に含まれているので除外
          .map((crumb) => ({
            ...crumb,
            href: item.url + crumb.href, // パスを結合
            isCurrent: crumb.isCurrent, // 最後の項目のみ現在のページとしてマーク
          })),
      ];
    }
  }

  // 一致するものが見つからない場合は、パスベースのパンくずリストを生成
  // navItemsを渡して、可能な限りサイドバーのデータからラベルを推測する
  return generatePathBasedBreadcrumbs(pathname, navItems);
}

/**
 * サイドバーのナビゲーションデータからパスに対応するラベルを取得する
 * 完全一致だけでなく、パスの一部一致も検出する
 *
 * @param navItems サイドバーのナビゲーション項目配列
 * @param path 検索するパス
 * @returns 見つかったラベル、見つからない場合はundefined
 */
function getLabelFromNavItems(
  navItems: NavItem[],
  path: string
): string | undefined {
  // パスの正規化（末尾のスラッシュを削除）
  const normalizedPath =
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  // 完全一致を優先して検索
  // 親項目を検索
  for (const item of navItems) {
    if (item.url === normalizedPath) {
      return item.title;
    }

    // 子項目を検索
    if (item.items && item.items.length > 0) {
      for (const subItem of item.items) {
        if (subItem.url === normalizedPath) {
          return subItem.title;
        }
      }
    }
  }

  // 完全一致が見つからない場合、パスの一部一致を検索
  // 例: '/employees/departments/123' のようなパスで '/employees/departments' を検出
  for (const item of navItems) {
    if (normalizedPath.startsWith(item.url) && item.url !== '/') {
      // 子項目を検索
      if (item.items && item.items.length > 0) {
        for (const subItem of item.items) {
          if (normalizedPath.startsWith(subItem.url) && subItem.url !== '/') {
            return subItem.title;
          }
        }
      }
      return item.title;
    }
  }

  return undefined;
}

/**
 * パスからパンくずリストのアイテムを生成する（フォールバック用）
 * サイドバーのナビゲーションデータを活用して動的にラベルを取得する
 *
 * @param pathname 現在のパス
 * @param navItems サイドバーのナビゲーション項目配列（オプション）
 * @returns パンくずリストのアイテム配列
 */
function generatePathBasedBreadcrumbs(
  pathname: string,
  navItems?: NavItem[]
): BreadcrumbItem[] {
  // パスを分割して配列に変換
  const paths = pathname.split('/').filter(Boolean);

  // ルートページ用のアイテムを追加
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'トップ',
      href: '/',
      isCurrent: paths.length === 0,
    },
  ];

  // パスの各セグメントに対してパンくずアイテムを生成
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;

    // デフォルトのラベルはパスの最初の文字を大文字に変換
    let label = path.charAt(0).toUpperCase() + path.slice(1);

    // サイドバーのナビゲーションデータからラベルを取得（提供されている場合）
    if (navItems) {
      const navLabel = getLabelFromNavItems(navItems, currentPath);
      if (navLabel) {
        label = navLabel;
      }
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrent: index === paths.length - 1,
    });
  });

  return breadcrumbs;
}

/**
 * パスからパンくずリストのアイテムを生成する
 * サイドバーのナビゲーション構造に基づいてパンくずリストを生成し、
 * 一致するものがない場合はパスベースのパンくずリストを生成する
 *
 * @param pathname 現在のパス
 * @param navItems サイドバーのナビゲーション項目配列（オプション）
 * @returns パンくずリストのアイテム配列
 */
export function generateBreadcrumbs(
  pathname: string,
  navItems?: NavItem[]
): BreadcrumbItem[] {
  // navItemsが提供されている場合、サイドバーのデータ構造からパンくずリストを生成
  if (navItems && navItems.length > 0) {
    const breadcrumbs = findBreadcrumbsFromNavItems(navItems, pathname);

    // サイドバーのナビゲーション構造に一致するものがある場合はそれを返す
    if (breadcrumbs.length > 0) {
      return breadcrumbs;
    }
  }

  // サイドバーのナビゲーション構造に一致するものがない場合、パスベースのパンくずリストを生成
  // この場合もnavItemsを渡して、可能な限りサイドバーのデータからラベルを推測する
  return generatePathBasedBreadcrumbs(pathname, navItems);
}
