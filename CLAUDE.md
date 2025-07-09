# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
回答は常に日本語でお願いします。

## プロジェクト概要

このプロジェクトは、Turborepo を使用したフルスタック monorepo で、NestJS APIバックエンドと Next.js フロントエンドを含むEC通販システムです。

## アーキテクチャ

### アプリケーション構成

- `apps/api/` - NestJS バックエンド (ポート3000)
- `apps/web/` - Next.js フロントエンド (ポート3001)

### 共有パッケージ

- `@repo/api` - 共有APIリソース（DTO、Entity等）
- `@repo/database` - Prisma ORM データベース管理パッケージ
- `@repo/ui` - 共有React UIコンポーネントライブラリ（shadcn/ui ベース）
- `@repo/eslint-config` - ESLint設定
- `@repo/jest-config` - Jest設定
- `@repo/typescript-config` - TypeScript設定

### フロントエンド構成

- Next.js 15 + React 19
- TailwindCSS v4
- shadcn/ui コンポーネント
- Tanstack Table（データテーブル用）
- React Hook Form + Zod（フォーム管理）
- ダークモード対応（next-themes）

### バックエンド構成

- NestJS フレームワーク
- Prisma ORM + PostgreSQL データベース
- RESTful API エンドポイント
- 注文管理・商品管理・ユーザー管理・決済・配送管理 API

## 開発コマンド

### 開発サーバー起動

```bash
pnpm dev  # 全アプリケーション同時起動
```

### ビルド

```bash
pnpm build  # 全アプリケーションビルド
```

### テスト

```bash
pnpm test        # ユニットテスト実行
pnpm test:e2e    # E2Eテスト実行（Playwright使用）
```

### コード品質

```bash
pnpm lint        # ESLint実行
pnpm format      # Prettier実行
```

### 個別アプリケーション操作

```bash
# APIのみ開発モード
cd apps/api && pnpm dev

# Webのみ開発モード
cd apps/web && pnpm dev

# 個別テスト実行
cd apps/web && pnpm test:watch
```

### 型チェック・品質チェック

```bash
pnpm build          # ビルド時に型チェックが実行される
cd apps/web && pnpm build  # Web アプリケーションの個別型チェック
cd apps/api && pnpm build  # API アプリケーションの個別型チェック
```

### データベース操作

```bash
pnpm db:generate    # Prisma Clientを生成
pnpm db:push        # スキーマをデータベースにプッシュ（開発用）
pnpm db:migrate     # マイグレーション実行（本番用）
pnpm db:seed        # テストデータの投入
pnpm db:studio      # Prisma Studio起動（データベースGUI）
pnpm db:reset       # データベースリセット
```

## コード規約

### UIコンポーネント

- 共有コンポーネントは `@repo/ui` パッケージに配置
- shadcn/ui のパターンに従う
- Tailwind CSS クラスを使用
- バリアント管理には `class-variance-authority` を使用

### APIデザイン

- NestJS の標準的なパターンに従う
- DTO は `@repo/api` パッケージで共有
- エンティティとDTOを明確に分離

### データベース・APIデザイン

- Prisma ORM を使用したデータアクセス
- PostgreSQL データベース
- 型安全なクエリ操作
- マイグレーション管理
- シード機能による初期データ投入
- EC通販システムに特化したスキーマ設計

### 日本語対応

- UIテキストは日本語を使用
- コメントは日本語で記述
- エラーメッセージも日本語対応

  ### フォーム処理

- React Hook Form + Zod の組み合わせを使用
- バリデーションスキーマは型安全に定義

## 主要機能

### 注文管理

- 注文一覧表示（データテーブル）
- 注文詳細・編集フォーム
- 注文ステータス管理
- 決済・配送状況管理

### 商品管理

- 商品一覧表示（データテーブル）
- 商品登録・編集フォーム
- カテゴリ・サプライヤー管理
- 在庫管理

### ユーザー管理

- ユーザー一覧表示
- ユーザー情報管理
- 注文履歴管理

### データテーブル機能

- フィルタリング
- ソート
- ページネーション
- カスタムカラム定義

## 開発時の注意点

- TypeScript strict モードが有効
- ESLint で警告ゼロを維持（max-warnings 0）
- パッケージ間の依存関係は workspace プロトコルを使用
- Node.js 18以上が必要（推奨：Node.js 20+）
- pnpm 10.13.1 を使用（npmやyarnは使用不可）

## Next.js 開発原則

### 1. コア原則

- **App Router** を標準採用
- **TypeScript 必須**（ESLint/型エラーは常にゼロ）
  - any型の使用は避けて下さい
  - ESLintエラーが発生した場合はignoreせず根本的な解決をする
- **API Routes** は使用しない - すべてのサーバー処理は Server Actions で実装

### 2. ディレクトリレイアウト（apps/web/src内）

```
app/         # ルーティング & ページ
components/  # 汎用UI（再利用可能・ロジックなし）
lib/         # ユーティリティ関数
hooks/       # カスタムフック
const/       # 定数（このプロジェクトではsns.tsが存在）
```

- **専用コンポーネント**: 対応する page.tsx と同階層に配置
- **汎用コンポーネント**: components/ または packages/ui/ に配置

### 3. データハンドリング

| 依存条件                 | 実装方法                                    |
| ------------------------ | ------------------------------------------- |
| ユーザー操作に依存しない | Server Components + Server Actions          |
| ユーザー操作に依存する   | Client Components + Server Actions + useSWR |

- 更新は Server Actions、即時反映は useSWR.mutate で楽観的更新

### 4. UI・状態管理

- **UI**: shadcn/ui コンポーネントを優先使用
- **アイコン**: lucide-react を統一使用（このプロジェクトで既に導入済み）
- **グローバル状態**: ライブラリは使用しない（必要時は React Context + useReducer）
- **URL 状態** nuqs に統一

### 5. パフォーマンス

- `use client` / `useEffect` / `useState` は最小限、まず RSC
- クライアント側は Suspense でフォールバック
- 動的 import で遅延読み込み
- 画像は next/image、リンクは next/link
- ルートベースのコード分割を徹底
- 1ファイルの行数は 300 行以下を目安
- できるだけコンポーネントを小さく保つ

#### メモ化と定数の最適化

**定数・固定値の配置:**

- **コンポーネント外**: 依存関係がない配列、オブジェクト、文字列定数
- **別ファイル**: 複数コンポーネントで使用する定数は `const/` ディレクトリ
- **コンポーネント内**: props や state に依存する動的な値のみ

```tsx
// ❌ Bad: 毎回新しいオブジェクトを作成
const Component = () => {
  const options = { style: 'solid', size: 'lg' }
  return <Button {...options} />
}

// ✅ Good: コンポーネント外に定義
const BUTTON_OPTIONS = { style: 'solid', size: 'lg' }
const Component = () => {
  return <Button {...BUTTON_OPTIONS} />
}
```

**メモ化の適用指針:**

- **useMemo**: 重い計算結果、複雑なオブジェクト/配列の生成
- **useCallback**: 子コンポーネントに渡すイベントハンドラー
- **React.memo**: レンダリングコストが高いコンポーネント

```tsx
// ✅ Good: 重い計算をメモ化
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => acc + item.value, 0);
}, [items]);

// ✅ Good: イベントハンドラーをメモ化
const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick]
);

// ❌ Bad: 不要なメモ化
const simpleValue = useMemo(() => 'static string', []); // 定数なのでコンポーネント外へ
```

### 6. フォーム・バリデーション

- 制御コンポーネント + react-hook-form
- スキーマ検証は Zod（packages/ui で既に導入済み）
- クライアント/サーバー両方で入力チェック

### 7. 品質・セキュリティ

#### エラーハンドリング

- ガード節で早期 return、成功パスは最後にまとめる

#### アクセシビリティ

- セマンティック HTML + ARIA、キーボード操作サポート

#### Server Actions セキュリティ

- ユーザーが許可された操作だけを Server Action として実装
- 汎用的・多目的なサーバー関数は実装しない

## コードスタイル規則

- セミコロンなし (`semi: false`)
- シングルクォート (`singleQuote: true`)
- 行長制限 80文字
- インデント 2スペース（一部ファイルタイプは4スペース）
- ES5 形式の末尾コンマ
- Tailwind クラスは自動ソート
- インポート文は自動ソート・グループ化

### className の結合

- **必須**: `cn()` 関数を使用してclassNameを結合する
- テンプレートリテラル（`${}`）による文字列結合は使用しない
- `cn()` は `@workspace/ui/lib/utils` からインポート

```tsx
// ❌ Bad: テンプレートリテラルを使用
className={`${baseClass} ${conditionalClass}`}

// ✅ Good: cn()関数を使用
className={cn(baseClass, conditionalClass)}

// ✅ Good: 条件付きクラス
className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'primary-class' : 'secondary-class'
)}
```

## 実装フロー

1. **設計**: コア原則とディレクトリ構造決定
2. **データ**: Server Components/Actions + useSWR パターン確立
3. **UI**: shadcn/ui + lucide-react 使用
4. **パフォーマンス**: RSC・Suspense・dynamic import で最適化
5. **フォーム**: Zod × react-hook-form
6. **品質管理**: エラー処理 → アクセシビリティ → テスト

## データベース設定

### 環境設定

1. PostgreSQL データベースの起動

```bash
docker-compose up -d  # PostgreSQL コンテナ起動
```

2. 環境変数の設定

```bash
cp packages/database/.env.example packages/database/.env
# DATABASE_URL を適切に設定
```

3. データベースの初期化

```bash
pnpm db:generate  # Prisma Client生成
pnpm db:push      # スキーマをDBに適用
pnpm db:seed      # 初期データ投入
```

### データベーススキーマ

#### 主要テーブル

##### Site（サイト）モデル

- `id`: Int (自動増分)
- `code`: String (unique)
- `name`: String
- `status`: SiteStatus enum (ACTIVE/INACTIVE)

##### Shop（店舗）モデル

- `id`: Int (自動増分)
- `name`: String
- `code`: String (unique)
- `siteId`: Int

##### User（ユーザー）モデル

- `id`: Int (自動増分)
- `email`: String (unique)
- `name`: String

##### Product（商品）モデル

- `id`: Int (自動増分)
- `code`: String (unique)
- `name`: String
- `categoryId`: Int
- `supplierId`: Int
- `retailPrice`: Int
- `purchasePrice`: Int

##### Category（カテゴリ）モデル

- `id`: Int (自動増分)
- `name`: String

##### Supplier（サプライヤー）モデル

- `id`: Int (自動増分)
- `code`: String (unique)
- `name`: String
- `email`: String
- `phoneNumber`: String

##### Order（注文）モデル

- `id`: Int (自動増分)
- `orderNumber`: String (unique)
- `totalAmount`: Decimal
- `shippingFee`: Int
- `orderStatus`: OrderStatus enum (PENDING/CONFIRMED/SHIPPED/COMPLETED/CANCELED)
- `orderDate`: DateTime
- `desiredArrivalDate`: DateTime (optional)

##### OrderItem（注文明細）モデル

- `id`: Int (自動増分)
- `orderId`: Int
- `productId`: Int
- `quantity`: Int
- `unitPrice`: Decimal

##### PaymentInfo（決済情報）モデル

- `id`: Int (自動増分)
- `orderId`: Int
- `paymentStatus`: PaymentStatus enum (UNPAID/AUTHORIZED/PAID/REFUNDED)
- `paymentAmount`: Decimal
- `transactionId`: String (optional)

##### Shipment（配送）モデル

- `id`: Int (自動増分)
- `orderId`: Int
- `trackingNumber`: String (optional)
- `shippingStatus`: ShipmentStatus enum (PREPARING/IN_TRANSIT/DELIVERED/RETURNED)
- `shippedAt`: DateTime (optional)

#### 関連テーブル

##### PaymentMethod（決済方法）モデル

- `id`: Int (自動増分)
- `name`: String
- `code`: String (unique)
- `active`: Boolean

##### DeliveryMethod（配送方法）モデル

- `id`: Int (自動増分)
- `name`: String
- `code`: String (unique)
- `type`: DeliveryMethodType enum (STANDARD/EXPRESS/COOL/MAIL)

##### DeliverySlot（配送時間帯）モデル

- `id`: Int (自動増分)
- `deliveryMethodId`: Int
- `name`: String
- `code`: String

##### ShippingAddress（配送先住所）モデル

- `id`: Int (自動増分)
- `name`: String
- `postalCode`: String
- `prefecture`: String
- `addressLine`: String

##### PurchaseOrder（発注）モデル

- `id`: Int (自動増分)
- `orderId`: Int (optional)
- `supplierId`: Int
- `siteId`: Int
- `purchaserId`: Int
- `invoiceNo`: String
- `orderDate`: DateTime
- `expectedAt`: DateTime

##### Receiving（入荷）モデル

- `id`: Int (自動増分)
- `purchaseOrderId`: Int
- `siteId`: Int
- `supplierId`: Int
- `receivedAt`: DateTime
- `status`: ReceivingStatus enum (PENDING/RECEIVED/INSPECTED)

##### OrderStatusLog（注文ステータスログ）モデル

- `id`: Int (自動増分)
- `orderId`: Int
- `status`: OrderStatus
- `changedAt`: DateTime

## 画面作成ルール

### 基本方針

- **shadcn/ui**: 全てのUIコンポーネントは`@repo/ui`パッケージから使用
- **レスポンシブ対応**: モバイルファースト設計
- **アクセシビリティ**: ARIA属性・キーボードナビゲーション必須
- **統一性**: 全画面で共通のUI・UXパターンを適用

### 一覧画面実装パターン

#### 基本構成

- **レイアウト**: `Card`ベースのグリッド表示
- **検索機能**: `Input`コンポーネント（リアルタイム検索）
- **フィルター**: `Select`コンポーネント（カテゴリ・ステータス等）
- **データテーブル**: `@tanstack/react-table`使用
- **ページネーション**: `@repo/ui/components/pagination`
- **ソート機能**: テーブルヘッダーでのクリックソート

#### 必須機能

- **新規作成ボタン**: 右上に配置（`Button`コンポーネント）
- **アクションリンク**: 各行に詳細・編集・削除リンク
- **ローディング状態**: `Skeleton`コンポーネント
- **エラー状態**: `Alert`コンポーネント
- **空状態**: 専用の空状態表示

#### 実装例

```tsx
// 基本的な一覧画面の構成
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Input placeholder="検索..." />
        <Select>...</Select>
      </div>
      <Button>+ 新規作成</Button>
    </div>
  </CardHeader>
  <CardContent>
    <DataTable columns={columns} data={data} />
    <Pagination />
  </CardContent>
</Card>
```

### 新規作成・編集画面実装パターン

#### 基本構成

- **モーダル**: `Dialog`コンポーネント使用
- **フォーム**: `react-hook-form` + `zod`バリデーション
- **フィールド**: `@repo/ui/components/form`でラップ
- **ボタン**: 保存・キャンセル・削除（編集時）

#### 必須機能

- **バリデーション**: リアルタイム・サブミット時両方
- **エラー表示**: フィールド単位のエラーメッセージ
- **ローディング**: サブミット中のボタン無効化
- **成功通知**: `toast`による成功メッセージ
- **エラー通知**: `toast`によるエラーメッセージ

#### 実装例

```tsx
// フォームの基本構成
<Dialog>
  <DialogContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner />}
            保存
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### 詳細画面実装パターン

#### 基本構成

- **モーダル**: `Sheet`コンポーネント（サイドスライド）
- **レイアウト**: `Card`ベースの情報表示
- **アクション**: 編集・削除・閉じるボタン

#### 必須機能

- **情報表示**: 関連データの階層表示
- **アクションボタン**: 編集・削除の権限チェック
- **ローディング**: `Skeleton`による待機表示
- **エラー処理**: データ取得エラー時の表示

#### 実装例

```tsx
// 詳細画面の基本構成
<Sheet>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>詳細情報</SheetTitle>
    </SheetHeader>
    <div className="space-y-4">
      <Card>
        <CardContent>{/* 詳細情報の表示 */}</CardContent>
      </Card>
    </div>

    <SheetFooter>
      <Button variant="outline" onClick={onEdit}>
        編集
      </Button>
      <Button variant="destructive" onClick={onDelete}>
        削除
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 削除処理実装パターン

#### 基本構成

- **確認ダイアログ**: 既存の`ConfirmModal`コンポーネント使用
- **アクション**: 削除・キャンセルボタン
- **通知**: 成功・エラーメッセージ

#### 必須機能

- **確認メッセージ**: 削除対象の明確な表示
- **詳細情報**: 削除による影響の説明
- **二重削除防止**: 処理中のボタン無効化
- **関連データ**: 削除影響の警告表示

#### 実装例

```tsx
// 削除確認の基本構成
const confirmDelete = useConfirmModal({
  type: 'delete',
  title: '削除確認',
  description: `${item.name}を削除しますか？`,
  details: '削除すると元に戻せません。',
  onConfirm: async () => {
    await deleteItem(item.id);
    toast.success('削除しました');
  },
});
```

### 共通UI・UX要件

#### メッセージ・通知

- **成功メッセージ**: `toast.success()`（緑色）
- **エラーメッセージ**: `toast.error()`（赤色）
- **警告メッセージ**: `toast.warning()`（黄色）
- **情報メッセージ**: `toast.info()`（青色）

#### ローディング状態

- **ページレベル**: `Skeleton`コンポーネント
- **コンポーネントレベル**: `Progress`コンポーネント
- **ボタンレベル**: ボタン内`Spinner`

#### アクセシビリティ

- **キーボードナビゲーション**: Tab・Enter・Escキー対応
- **スクリーンリーダー**: 適切なaria-label設定
- **フォーカス管理**: モーダル開閉時のフォーカス移動
- **色覚対応**: 色だけに依存しない情報伝達

#### レスポンシブ対応

- **ブレークポイント**: Tailwind CSSの標準ブレークポイント
- **モバイル**: 320px以上での表示対応
- **タブレット**: 768px以上での最適化
- **デスクトップ**: 1024px以上での最適化

### 実装チェックリスト

#### 一覧画面

- [ ] データテーブルの実装
- [ ] 検索・フィルター機能
- [ ] ページネーション
- [ ] ソート機能
- [ ] 新規作成ボタン
- [ ] アクションリンク（詳細・編集・削除）
- [ ] ローディング・エラー・空状態

#### フォーム画面

- [ ] react-hook-form設定
- [ ] zodバリデーション
- [ ] フィールドエラー表示
- [ ] サブミット処理
- [ ] 成功・エラー通知
- [ ] ローディング状態

#### 詳細・削除

- [ ] 詳細情報表示
- [ ] 削除確認ダイアログ
- [ ] アクションボタン
- [ ] 権限チェック
- [ ] 通知メッセージ

#### 共通要件

- [ ] レスポンシブ対応
- [ ] アクセシビリティ対応
- [ ] 一貫したUI・UX
- [ ] エラーハンドリング
- [ ] ローディング状態管理

## 注意事項

- **Node.js要件**: 20以上必須
- **パッケージマネージャー**: pnpm@10.13.1使用（npmやyarnは使用不可）
- **Huskyプリコミットフック**: 有効化済み（`pnpm prepare`で初期化）
- **型エラー**: 作業完了前に必ず解決（`pnpm build`で確認）
- **ESLintエラー**: ignoreでの回避禁止、根本的解決必須
- **データベース**: 開発時はDocker Composeを使用してPostgreSQL起動
