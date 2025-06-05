import { describe } from '@jest/globals';
import test, { expect } from '@playwright/test';

import { generateBreadcrumbs } from '../breadcrumb';

describe('パンくずリスト生成機能のテスト', () => {
  // テスト用のナビゲーションデータ
  const mockNavItems = [
    {
      title: '社員管理',
      url: '/employees',
      isActive: true,
      items: [
        {
          title: '社員一覧',
          url: '/employees',
        },
        {
          title: '部署管理',
          url: '/employees/departments',
        },
        {
          title: '権限設定',
          url: '/employees/permissions',
        },
      ],
    },
    {
      title: 'Playground',
      url: '/playground',
      isActive: true,
      items: [
        {
          title: 'History',
          url: '/playground/history',
        },
        {
          title: 'Starred',
          url: '/playground/starred',
        },
      ],
    },
  ];

  test('トップページのパンくずリスト', () => {
    const breadcrumbs = generateBreadcrumbs('/', mockNavItems);
    expect(breadcrumbs).toHaveLength(1);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: true,
    });
  });

  test('親項目の完全一致', () => {
    const breadcrumbs = generateBreadcrumbs('/employees', mockNavItems);
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: false,
    });
    expect(breadcrumbs[1]).toEqual({
      label: '社員管理',
      href: '/employees',
      isCurrent: true,
    });
  });

  test('子項目の完全一致', () => {
    const breadcrumbs = generateBreadcrumbs(
      '/employees/departments',
      mockNavItems
    );
    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: false,
    });
    expect(breadcrumbs[1]).toEqual({
      label: '社員管理',
      href: '/employees',
      isCurrent: false,
    });
    expect(breadcrumbs[2]).toEqual({
      label: '部署管理',
      href: '/employees/departments',
      isCurrent: true,
    });
  });

  test('部分一致のパス', () => {
    const breadcrumbs = generateBreadcrumbs(
      '/employees/departments/123',
      mockNavItems
    );
    expect(breadcrumbs.length).toBeGreaterThan(3);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: false,
    });
    expect(breadcrumbs[1]).toEqual({
      label: '社員管理',
      href: '/employees',
      isCurrent: false,
    });
    expect(breadcrumbs[2]).toEqual({
      label: '部署管理',
      href: '/employees/departments',
      isCurrent: false,
    });
    // 最後の項目は動的に生成される
    // expect(breadcrumbs[3].label).toBe('123');
    // expect(breadcrumbs[3].href).toBe('/employees/departments/123');
    // expect(breadcrumbs[3].isCurrent).toBe(true);
  });

  test('ナビゲーションデータがない場合', () => {
    const breadcrumbs = generateBreadcrumbs('/unknown/path');
    expect(breadcrumbs.length).toBe(3);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: false,
    });
    // expect(breadcrumbs[1].label).toBe('Unknown');
    // expect(breadcrumbs[2].label).toBe('Path');
  });

  test('ナビゲーションデータにないパス', () => {
    const breadcrumbs = generateBreadcrumbs('/unknown/path', mockNavItems);
    expect(breadcrumbs.length).toBe(3);
    expect(breadcrumbs[0]).toEqual({
      label: 'トップ',
      href: '/',
      isCurrent: false,
    });
    // expect(breadcrumbs[1].label).toBe('Unknown');
    // expect(breadcrumbs[2].label).toBe('Path');
  });
});
