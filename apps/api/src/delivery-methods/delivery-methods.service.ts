import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeliveryMethodDto } from '@repo/api/delivery-methods/dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from '@repo/api/delivery-methods/dto/update-delivery-method.dto';
import { db } from '@repo/database';
import type { DeliveryMethod, DeliveryMethodType } from '@repo/database';

@Injectable()
export class DeliveryMethodsService {
  async create(
    createDeliveryMethodDto: CreateDeliveryMethodDto
  ): Promise<DeliveryMethod> {
    try {
      const existingMethod = await db.deliveryMethod.findUnique({
        where: { code: createDeliveryMethodDto.code },
      });

      if (existingMethod) {
        throw new ConflictException('配送方法コードが既に存在します');
      }

      const deliveryMethod = await db.deliveryMethod.create({
        data: {
          name: createDeliveryMethodDto.name,
          code: createDeliveryMethodDto.code,
          type: createDeliveryMethodDto.type,
        },
      });

      return deliveryMethod;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('配送方法の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<DeliveryMethod[]> {
    try {
      return await db.deliveryMethod.findMany({
        include: {
          deliverySlots: {
            orderBy: {
              name: 'asc',
            },
          },
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
              deliverySlots: true,
              orders: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('配送方法一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<DeliveryMethod> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
        where: { id },
        include: {
          deliverySlots: {
            orderBy: {
              name: 'asc',
            },
          },
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

      if (!deliveryMethod) {
        throw new NotFoundException('配送方法が見つかりません');
      }

      return deliveryMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送方法の取得中にエラーが発生しました');
    }
  }

  async findByCode(code: string): Promise<DeliveryMethod> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
        where: { code },
        include: {
          deliverySlots: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      if (!deliveryMethod) {
        throw new NotFoundException(
          '指定されたコードの配送方法が見つかりません'
        );
      }

      return deliveryMethod;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送方法の検索中にエラーが発生しました');
    }
  }

  async findByType(type: DeliveryMethodType): Promise<DeliveryMethod[]> {
    try {
      return await db.deliveryMethod.findMany({
        where: { type },
        include: {
          deliverySlots: true,
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
      throw new Error('配送タイプ別一覧の取得中にエラーが発生しました');
    }
  }

  async searchDeliveryMethods(searchTerm: string): Promise<DeliveryMethod[]> {
    try {
      return await db.deliveryMethod.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          deliverySlots: true,
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
      throw new Error('配送方法の検索中にエラーが発生しました');
    }
  }

  async getMethodSlots(methodId: number): Promise<any[]> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
        where: { id: methodId },
        include: {
          deliverySlots: {
            include: {
              orders: {
                include: {
                  user: true,
                },
                orderBy: {
                  orderDate: 'desc',
                },
                take: 3,
              },
              shipments: {
                include: {
                  order: {
                    include: {
                      user: true,
                    },
                  },
                },
                orderBy: {
                  id: 'desc',
                },
                take: 3,
              },
              _count: {
                select: {
                  orders: true,
                  shipments: true,
                },
              },
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      });

      if (!deliveryMethod) {
        throw new NotFoundException('配送方法が見つかりません');
      }

      return deliveryMethod.deliverySlots;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送時間帯一覧の取得中にエラーが発生しました');
    }
  }

  async getMethodOrders(methodId: number): Promise<any[]> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
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

      if (!deliveryMethod) {
        throw new NotFoundException('配送方法が見つかりません');
      }

      return deliveryMethod.orders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送方法注文一覧の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateDeliveryMethodDto: UpdateDeliveryMethodDto
  ): Promise<DeliveryMethod> {
    try {
      const existingMethod = await db.deliveryMethod.findUnique({
        where: { id },
      });

      if (!existingMethod) {
        throw new NotFoundException('配送方法が見つかりません');
      }

      if (
        updateDeliveryMethodDto.code &&
        updateDeliveryMethodDto.code !== existingMethod.code
      ) {
        const codeExists = await db.deliveryMethod.findUnique({
          where: { code: updateDeliveryMethodDto.code },
        });

        if (codeExists) {
          throw new ConflictException('配送方法コードが既に存在します');
        }
      }

      const deliveryMethod = await db.deliveryMethod.update({
        where: { id },
        data: updateDeliveryMethodDto,
        include: {
          deliverySlots: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

      return deliveryMethod;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送方法の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
        where: { id },
        include: {
          orders: true,
          deliverySlots: true,
        },
      });

      if (!deliveryMethod) {
        throw new NotFoundException('配送方法が見つかりません');
      }

      if (deliveryMethod.orders.length > 0) {
        throw new ConflictException('注文履歴がある配送方法は削除できません');
      }

      if (deliveryMethod.deliverySlots.length > 0) {
        throw new ConflictException(
          '配送時間帯が登録されている配送方法は削除できません'
        );
      }

      await db.deliveryMethod.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送方法の削除中にエラーが発生しました');
    }
  }
}
