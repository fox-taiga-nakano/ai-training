import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from '@repo/api/departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '@repo/api/departments/dto/update-department.dto';
import { db } from '@repo/database';
import type { Department } from '@repo/database';

@Injectable()
export class DepartmentsService {
  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      // Check if department name already exists
      const existingDepartment = await db.department.findUnique({
        where: { name: createDepartmentDto.name },
      });

      if (existingDepartment) {
        throw new ConflictException('部署名が既に存在します');
      }

      const department = await db.department.create({
        data: {
          name: createDepartmentDto.name,
          description: createDepartmentDto.description,
        },
      });

      return department;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('部署の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Department[]> {
    try {
      return await db.department.findMany({
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              status: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('部署一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: string): Promise<Department> {
    try {
      const department = await db.department.findUnique({
        where: { id },
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              status: true,
              hireDate: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      });

      if (!department) {
        throw new NotFoundException('部署が見つかりません');
      }

      return department;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('部署の取得中にエラーが発生しました');
    }
  }

  async findByName(name: string): Promise<Department | null> {
    try {
      return await db.department.findUnique({
        where: { name },
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              status: true,
            },
          },
        },
      });
    } catch {
      throw new Error('部署の検索中にエラーが発生しました');
    }
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto
  ): Promise<Department> {
    try {
      // Check if department exists
      const existingDepartment = await db.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        throw new NotFoundException('部署が見つかりません');
      }

      // Check if department name already exists (if name is being updated)
      if (
        updateDepartmentDto.name &&
        updateDepartmentDto.name !== existingDepartment.name
      ) {
        const nameExists = await db.department.findUnique({
          where: { name: updateDepartmentDto.name },
        });

        if (nameExists) {
          throw new ConflictException('部署名が既に存在します');
        }
      }

      const updateData: any = {};

      if (updateDepartmentDto.name !== undefined)
        updateData.name = updateDepartmentDto.name;
      if (updateDepartmentDto.description !== undefined)
        updateData.description = updateDepartmentDto.description;

      const department = await db.department.update({
        where: { id },
        data: updateData,
        include: {
          employees: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              status: true,
            },
          },
        },
      });

      return department;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('部署の更新中にエラーが発生しました');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const department = await db.department.findUnique({
        where: { id },
        include: {
          employees: true,
        },
      });

      if (!department) {
        throw new NotFoundException('部署が見つかりません');
      }

      // Check if department has employees
      if (department.employees.length > 0) {
        throw new ConflictException('社員が所属している部署は削除できません');
      }

      await db.department.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('部署の削除中にエラーが発生しました');
    }
  }

  async count(): Promise<number> {
    try {
      return await db.department.count();
    } catch {
      throw new Error('部署数の取得中にエラーが発生しました');
    }
  }

  async getEmployeeCount(id: string): Promise<number> {
    try {
      return await db.employee.count({
        where: { departmentId: id },
      });
    } catch {
      throw new Error('部署の社員数取得中にエラーが発生しました');
    }
  }

  async getDepartmentStats(): Promise<
    Array<{
      departmentId: string;
      departmentName: string;
      employeeCount: number;
    }>
  > {
    try {
      const departments = await db.department.findMany({
        include: {
          _count: {
            select: {
              employees: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return departments.map((dept) => ({
        departmentId: dept.id,
        departmentName: dept.name,
        employeeCount: dept._count.employees,
      }));
    } catch {
      throw new Error('部署統計の取得中にエラーが発生しました');
    }
  }
}
