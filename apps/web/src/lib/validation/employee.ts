import * as z from 'zod';

// セキュリティ強化：入力値のサニタイゼーション用正規表現
const SAFE_TEXT_REGEX =
  /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s\-_.@+()（）]+$/;
const PHONE_REGEX = /^\+?[0-9\-\s()]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 共通バリデーション関数
export const createSafeTextValidator = (
  fieldName: string,
  minLength = 1,
  maxLength = 100
) =>
  z
    .string()
    .min(minLength, `${fieldName}は${minLength}文字以上で入力してください`)
    .max(maxLength, `${fieldName}は${maxLength}文字以下で入力してください`)
    .regex(SAFE_TEXT_REGEX, `${fieldName}に使用できない文字が含まれています`)
    .transform((val) => val.trim()) // 前後の空白を削除
    .refine((val) => val.length >= minLength, `${fieldName}は必須項目です`);

// 電話番号バリデーション
export const phoneValidator = z
  .string()
  .min(10, '電話番号は10文字以上で入力してください')
  .max(20, '電話番号は20文字以下で入力してください')
  .regex(PHONE_REGEX, '電話番号の形式が正しくありません')
  .transform((val) => val.trim());

// メールアドレスバリデーション
export const emailValidator = z
  .string()
  .min(1, 'メールアドレスは必須項目です')
  .max(254, 'メールアドレスは254文字以下で入力してください')
  .regex(EMAIL_REGEX, 'メールアドレスの形式が正しくありません')
  .transform((val) => val.trim().toLowerCase());

// 社員ステータス（厳密な型チェック）
export const EmployeeStatus = z.enum(
  ['active', 'inactive', 'suspended', 'invited'],
  {
    errorMap: () => ({ message: '無効なステータスです' }),
  }
);

// 社員役割（厳密な型チェック）
export const EmployeeRole = z.enum(
  ['admin', 'manager', 'cashier', 'superadmin'],
  {
    errorMap: () => ({ message: '無効な役割です' }),
  }
);

// 編集用バリデーションスキーマ（セキュリティ強化版）
export const editEmployeeFormSchema = z.object({
  name: createSafeTextValidator('名前', 1, 50),
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(30, 'ユーザー名は30文字以下で入力してください')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'ユーザー名は英数字とアンダースコアのみ使用できます'
    )
    .transform((val) => val.trim()),
  email: emailValidator,
  phone: phoneValidator,
  status: EmployeeStatus,
  role: EmployeeRole,
});

// 新規作成用バリデーションスキーマ
export const createEmployeeFormSchema = editEmployeeFormSchema
  .extend({
    confirmEmail: z.string().email('有効なメールアドレスを入力してください'),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'メールアドレスが一致しません',
    path: ['confirmEmail'],
  });

// 型エクスポート
export type EditEmployeeFormValues = z.infer<typeof editEmployeeFormSchema>;
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeFormSchema>;
export type EmployeeStatusType = z.infer<typeof EmployeeStatus>;
export type EmployeeRoleType = z.infer<typeof EmployeeRole>;

// バリデーションエラーのサニタイズ
export const sanitizeValidationError = (
  error: z.ZodError
): Record<string, string> => {
  const errorMap: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    // エラーメッセージから潜在的な危険な文字を除去
    const sanitizedMessage = err.message.replace(/[<>\"'&]/g, '');
    errorMap[path] = sanitizedMessage;
  });

  return errorMap;
};
