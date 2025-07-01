export class Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  salary?: number;
  hireDate: Date;
  departmentId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}
