import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeDto } from '@repo/api/employees/dto/create-employee.dto';
import { UpdateEmployeeDto } from '@repo/api/employees/dto/update-employee.dto';
import { db } from '@repo/database';
import type { Employee, Status } from '@repo/database';

@Injectable()
export class EmployeesService {
  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      // Check if email already exists
      const existingEmployee = await db.employee.findUnique({
        where: { email: createEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new ConflictException('社員のメールアドレスが既に存在します');
      }

      // Check if department exists (if provided)
      if (createEmployeeDto.departmentId) {
        const department = await db.department.findUnique({
          where: { id: createEmployeeDto.departmentId },
        });

        if (!department) {
          throw new NotFoundException('指定された部署が見つかりません');
        }
      }

      const employee = await db.employee.create({
        data: {
          name: createEmployeeDto.name,
          email: createEmployeeDto.email,
          phone: createEmployeeDto.phone,
          position: createEmployeeDto.position,
          salary: createEmployeeDto.salary,
          hireDate: createEmployeeDto.hireDate
            ? new Date(createEmployeeDto.hireDate)
            : new Date(),
          departmentId: createEmployeeDto.departmentId,
          status: createEmployeeDto.status || 'ACTIVE',
        },
      });

      return employee;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error('社員の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Employee[]> {
    try {
      return await db.employee.findMany({
        include: {
          department: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch {
      throw new Error('社員一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: string): Promise<Employee> {
    try {
      const employee = await db.employee.findUnique({
        where: { id },
        include: {
          department: true,
        },
      });

      if (!employee) {
        throw new NotFoundException('社員が見つかりません');
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('社員の取得中にエラーが発生しました');
    }
  }

  async findByDepartment(departmentId: string): Promise<Employee[]> {
    try {
      return await db.employee.findMany({
        where: { departmentId },
        include: {
          department: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('部署別社員一覧の取得中にエラーが発生しました');
    }
  }

  async findByStatus(status: Status): Promise<Employee[]> {
    try {
      return await db.employee.findMany({
        where: { status },
        include: {
          department: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('ステータス別社員一覧の取得中にエラーが発生しました');
    }
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<Employee> {
    try {
      // Check if employee exists
      const existingEmployee = await db.employee.findUnique({
        where: { id },
      });

      if (!existingEmployee) {
        throw new NotFoundException('社員が見つかりません');
      }

      // Check if email already exists (if email is being updated)
      if (
        updateEmployeeDto.email &&
        updateEmployeeDto.email !== existingEmployee.email
      ) {
        const emailExists = await db.employee.findUnique({
          where: { email: updateEmployeeDto.email },
        });

        if (emailExists) {
          throw new ConflictException('社員のメールアドレスが既に存在します');
        }
      }

      // Check if department exists (if provided)
      if (updateEmployeeDto.departmentId) {
        const department = await db.department.findUnique({
          where: { id: updateEmployeeDto.departmentId },
        });

        if (!department) {
          throw new NotFoundException('指定された部署が見つかりません');
        }
      }

      const updateData: any = {};

      if (updateEmployeeDto.name !== undefined)
        updateData.name = updateEmployeeDto.name;
      if (updateEmployeeDto.email !== undefined)
        updateData.email = updateEmployeeDto.email;
      if (updateEmployeeDto.phone !== undefined)
        updateData.phone = updateEmployeeDto.phone;
      if (updateEmployeeDto.position !== undefined)
        updateData.position = updateEmployeeDto.position;
      if (updateEmployeeDto.salary !== undefined)
        updateData.salary = updateEmployeeDto.salary;
      if (updateEmployeeDto.hireDate !== undefined)
        updateData.hireDate = new Date(updateEmployeeDto.hireDate);
      if (updateEmployeeDto.departmentId !== undefined)
        updateData.departmentId = updateEmployeeDto.departmentId;
      if (updateEmployeeDto.status !== undefined)
        updateData.status = updateEmployeeDto.status;

      const employee = await db.employee.update({
        where: { id },
        data: updateData,
        include: {
          department: true,
        },
      });

      return employee;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('社員の更新中にエラーが発生しました');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const employee = await db.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        throw new NotFoundException('社員が見つかりません');
      }

      await db.employee.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('社員の削除中にエラーが発生しました');
    }
  }

  async count(): Promise<number> {
    try {
      return await db.employee.count();
    } catch {
      throw new Error('社員数の取得中にエラーが発生しました');
    }
  }

  async countByStatus(status: Status): Promise<number> {
    try {
      return await db.employee.count({
        where: { status },
      });
    } catch {
      throw new Error('ステータス別社員数の取得中にエラーが発生しました');
    }
  }
}
