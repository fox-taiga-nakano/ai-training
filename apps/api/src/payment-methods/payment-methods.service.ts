import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentMethodDto } from '@repo/api/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@repo/api/payment-methods/dto/update-payment-method.dto';
import { db } from '@repo/database';
import type { PaymentMethod } from '@repo/database';

@Injectable()
export class PaymentMethodsService {
  async create(
    createPaymentMethodDto: CreatePaymentMethodDto
  ): Promise<PaymentMethod> {
    try {
      const existingMethod = await db.paymentMethod.findUnique({
        where: { code: createPaymentMethodDto.code },
      });

      if (existingMethod) {
        throw new ConflictException('決済方法コードが既に存在します');
      }

      const paymentMethod = await db.paymentMethod.create({
        data: {
          name: createPaymentMethodDto.name,
          code: createPaymentMethodDto.code,
          active: createPaymentMethodDto.active ?? true,
        },
      });

      return paymentMethod;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('決済方法の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<PaymentMethod[]> {
    try {
      return await db.paymentMethod.findMany({
        include: {
          orders: {
            select: {
              id: true,
              orderNumber: true,
              orderStatus: true,
              orderDate: true,
              totalAmount: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              orderDate: 'desc',
            },
            take: 5,
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('決済方法一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<PaymentMethod> {
    try {
      const paymentMethod = await db.paymentMethod.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
              user: true,
              site: true,
              shop: true,
              items: {
                include: {
                  product: true,
                },
              },
              payments: true,
            },
            orderBy: {
              orderDate: 'desc',
            },
          },
        },
      });

      if (!paymentMethod) {
        throw new NotFoundException('決済方法が見つかりません');
      }

      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済方法の取得中にエラーが発生しました');
    }
  }

  async findByCode(code: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await db.paymentMethod.findUnique({
        where: { code },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      if (!paymentMethod) {
        throw new NotFoundException(
          '指定されたコードの決済方法が見つかりません'
        );
      }

      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済方法の検索中にエラーが発生しました');
    }
  }

  async findByStatus(active: boolean): Promise<PaymentMethod[]> {
    try {
      return await db.paymentMethod.findMany({
        where: { active },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('ステータス別決済方法一覧の取得中にエラーが発生しました');
    }
  }

  async searchPaymentMethods(searchTerm: string): Promise<PaymentMethod[]> {
    try {
      return await db.paymentMethod.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('決済方法の検索中にエラーが発生しました');
    }
  }

  async getMethodOrders(methodId: number): Promise<any[]> {
    try {
      const paymentMethod = await db.paymentMethod.findUnique({
        where: { id: methodId },
        include: {
          orders: {
            include: {
              user: true,
              site: true,
              shop: true,
              items: {
                include: {
                  product: true,
                  category: true,
                },
              },
              payments: true,
              shipments: {
                include: {
                  address: true,
                },
              },
            },
            orderBy: {
              orderDate: 'desc',
            },
          },
        },
      });

      if (!paymentMethod) {
        throw new NotFoundException('決済方法が見つかりません');
      }

      return paymentMethod.orders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済方法注文一覧の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updatePaymentMethodDto: UpdatePaymentMethodDto
  ): Promise<PaymentMethod> {
    try {
      const existingMethod = await db.paymentMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundException('決済方法が見つかりません');
      }

      if (
        updatePaymentMethodDto.code &&
        updatePaymentMethodDto.code !== existingMethod.code
      ) {
        const codeExists = await db.paymentMethod.findUnique({
          where: { code: updatePaymentMethodDto.code },
        });

        if (codeExists) {
          throw new ConflictException('決済方法コードが既に存在します');
        }
      }

      const paymentMethod = await db.paymentMethod.update({
        where: { id },
        data: updatePaymentMethodDto,
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      return paymentMethod;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('決済方法の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const paymentMethod = await db.paymentMethod.findUnique({
        where: { id },
        include: {
          orders: true,
        },
      });

      if (!paymentMethod) {
        throw new NotFoundException('決済方法が見つかりません');
      }

      if (paymentMethod.orders.length > 0) {
        throw new ConflictException('注文履歴がある決済方法は削除できません');
      }

      await db.paymentMethod.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('決済方法の削除中にエラーが発生しました');
    }
  }

  async toggleStatus(id: number): Promise<PaymentMethod> {
    try {
      const existingMethod = await db.paymentMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundException('決済方法が見つかりません');
      }

      const paymentMethod = await db.paymentMethod.update({
        where: { id },
        data: {
          active: !existingMethod.active,
        },
        include: {
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      return paymentMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済方法のステータス切り替え中にエラーが発生しました');
    }
  }
}
