import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from '@repo/api/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@repo/api/suppliers/dto/update-supplier.dto';
import { db } from '@repo/database';
import type { Supplier } from '@repo/database';

@Injectable()
export class SuppliersService {
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    try {
      const existingCodeSupplier = await db.supplier.findUnique({
        where: { code: createSupplierDto.code },
      });

      if (existingCodeSupplier) {
        throw new ConflictException('サプライヤーコードが既に存在します');
      }

      const existingEmailSupplier = await db.supplier.findFirst({
        where: { email: createSupplierDto.email },
      });

      if (existingEmailSupplier) {
        throw new ConflictException('メールアドレスが既に登録されています');
      }

      const supplier = await db.supplier.create({
        data: {
          code: createSupplierDto.code,
          name: createSupplierDto.name,
          email: createSupplierDto.email,
          phoneNumber: createSupplierDto.phoneNumber,
        },
      });

      return supplier;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('サプライヤーの作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Supplier[]> {
    try {
      return await db.supplier.findMany({
        include: {
          products: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('サプライヤー一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Supplier> {
    try {
      const supplier = await db.supplier.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              category: true,
            },
          },
          purchaseOrders: {
            include: {
              order: true,
            },
            orderBy: {
              orderDate: 'desc',
            },
          },
          receivings: {
            include: {
              purchaseOrder: true,
            },
            orderBy: {
              receivedAt: 'desc',
            },
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException('サプライヤーが見つかりません');
      }

      return supplier;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サプライヤーの取得中にエラーが発生しました');
    }
  }

  async findByCode(code: string): Promise<Supplier> {
    try {
      const supplier = await db.supplier.findUnique({
        where: { code },
        include: {
          products: {
            include: {
              category: true,
            },
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException(
          '指定されたコードのサプライヤーが見つかりません'
        );
      }

      return supplier;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サプライヤーの検索中にエラーが発生しました');
    }
  }

  async searchSuppliers(searchTerm: string): Promise<Supplier[]> {
    try {
      return await db.supplier.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          products: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('サプライヤーの検索中にエラーが発生しました');
    }
  }

  async getSupplierProducts(supplierId: number): Promise<any[]> {
    try {
      const supplier = await db.supplier.findUnique({
        where: { id: supplierId },
        include: {
          products: {
            include: {
              category: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      });

      if (!supplier) {
        throw new NotFoundException('サプライヤーが見つかりません');
      }

      return supplier.products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サプライヤー商品の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto
  ): Promise<Supplier> {
    try {
      const existingSupplier = await db.supplier.findUnique({
        where: { id },
      });

      if (!existingSupplier) {
        throw new NotFoundException('サプライヤーが見つかりません');
      }

      if (
        updateSupplierDto.code &&
        updateSupplierDto.code !== existingSupplier.code
      ) {
        const codeExists = await db.supplier.findUnique({
          where: { code: updateSupplierDto.code },
        });

        if (codeExists) {
          throw new ConflictException('サプライヤーコードが既に存在します');
        }
      }

      if (
        updateSupplierDto.email &&
        updateSupplierDto.email !== existingSupplier.email
      ) {
        const emailExists = await db.supplier.findFirst({
          where: { email: updateSupplierDto.email },
        });

        if (emailExists) {
          throw new ConflictException('メールアドレスが既に登録されています');
        }
      }

      const supplier = await db.supplier.update({
        where: { id },
        data: updateSupplierDto,
        include: {
          products: true,
        },
      });

      return supplier;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('サプライヤーの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const supplier = await db.supplier.findUnique({
        where: { id },
        include: {
          products: true,
          purchaseOrders: true,
        },
      });

      if (!supplier) {
        throw new NotFoundException('サプライヤーが見つかりません');
      }

      if (supplier.products.length > 0) {
        throw new ConflictException(
          '商品が登録されているサプライヤーは削除できません'
        );
      }

      if (supplier.purchaseOrders.length > 0) {
        throw new ConflictException(
          '発注履歴があるサプライヤーは削除できません'
        );
      }

      await db.supplier.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('サプライヤーの削除中にエラーが発生しました');
    }
  }
}
