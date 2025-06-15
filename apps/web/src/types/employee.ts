// 厳密な型定義を提供

/**
 * 社員ID（UUID形式）
 */
export type EmployeeId = string & { readonly brand: unique symbol };

/**
 * 社員ステータス（厳密な型チェック）
 */
export const EMPLOYEE_STATUSES = [
  'active',
  'inactive',
  'suspended',
  'invited',
] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/**
 * 社員役割（厳密な型チェック）
 */
export const EMPLOYEE_ROLES = [
  'admin',
  'manager',
  'cashier',
  'superadmin',
] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

/**
 * メールアドレス（ブランド型）
 */
export type Email = string & { readonly brand: unique symbol };

/**
 * 電話番号（ブランド型）
 */
export type PhoneNumber = string & { readonly brand: unique symbol };

/**
 * ユーザー名（ブランド型）
 */
export type Username = string & { readonly brand: unique symbol };

/**
 * 社員名（ブランド型）
 */
export type EmployeeName = string & { readonly brand: unique symbol };

/**
 * 社員情報（厳密な型定義）
 */
export interface Employee {
  readonly id: EmployeeId;
  readonly name: EmployeeName;
  readonly username: Username;
  readonly email: Email;
  readonly phone: PhoneNumber;
  readonly status: EmployeeStatus;
  readonly role: EmployeeRole;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

/**
 * 社員更新データ（部分更新用）
 */
export interface EmployeeUpdateData {
  readonly name?: EmployeeName;
  readonly username?: Username;
  readonly email?: Email;
  readonly phone?: PhoneNumber;
  readonly status?: EmployeeStatus;
  readonly role?: EmployeeRole;
}

/**
 * 社員作成データ
 */
export interface EmployeeCreateData {
  readonly name: EmployeeName;
  readonly username: Username;
  readonly email: Email;
  readonly phone: PhoneNumber;
  readonly status: EmployeeStatus;
  readonly role: EmployeeRole;
}

/**
 * 型ガード関数
 */
export const isValidEmployeeStatus = (
  status: string
): status is EmployeeStatus => {
  return EMPLOYEE_STATUSES.includes(status as EmployeeStatus);
};

export const isValidEmployeeRole = (role: string): role is EmployeeRole => {
  return EMPLOYEE_ROLES.includes(role as EmployeeRole);
};

/**
 * ファクトリー関数（型安全なオブジェクト作成）
 */
export const createEmployeeId = (id: string): EmployeeId => id as EmployeeId;
export const createEmail = (email: string): Email => email as Email;
export const createPhoneNumber = (phone: string): PhoneNumber =>
  phone as PhoneNumber;
export const createUsername = (username: string): Username =>
  username as Username;
export const createEmployeeName = (name: string): EmployeeName =>
  name as EmployeeName;

/**
 * 権限チェック関数
 */
export const canEditEmployee = (
  currentUserRole: EmployeeRole,
  targetEmployeeRole: EmployeeRole
): boolean => {
  const roleHierarchy: Record<EmployeeRole, number> = {
    cashier: 1,
    manager: 2,
    admin: 3,
    superadmin: 4,
  };

  return roleHierarchy[currentUserRole] >= roleHierarchy[targetEmployeeRole];
};

/**
 * 社員データの妥当性検証
 */
export const validateEmployee = (employee: Partial<Employee>): string[] => {
  const errors: string[] = [];

  if (!employee.name || employee.name.trim().length === 0) {
    errors.push('名前は必須です');
  }

  if (!employee.username || employee.username.trim().length === 0) {
    errors.push('ユーザー名は必須です');
  }

  if (!employee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.push('有効なメールアドレスが必要です');
  }

  if (!employee.phone || employee.phone.trim().length === 0) {
    errors.push('電話番号は必須です');
  }

  if (!employee.status || !isValidEmployeeStatus(employee.status)) {
    errors.push('有効なステータスが必要です');
  }

  if (!employee.role || !isValidEmployeeRole(employee.role)) {
    errors.push('有効な役割が必要です');
  }

  return errors;
};
