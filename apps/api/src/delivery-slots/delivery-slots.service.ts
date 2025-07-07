import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeliverySlotDto } from '@repo/api/delivery-slots/dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from '@repo/api/delivery-slots/dto/update-delivery-slot.dto';
import { db } from '@repo/database';
import type { DeliverySlot } from '@repo/database';

@Injectable()
export class DeliverySlotsService {
  async create(
    createDeliverySlotDto: CreateDeliverySlotDto
  ): Promise<DeliverySlot> {
    try {
      const deliveryMethod = await db.deliveryMethod.findUnique({
        where: { id: createDeliverySlotDto.deliveryMethodId },
      });

      if (!deliveryMethod) {
        throw new NotFoundException('指定された配送方法が見つかりません');
      }

      const existingSlot = await db.deliverySlot.findFirst({
        where: {
          deliveryMethodId: createDeliverySlotDto.deliveryMethodId,
          code: createDeliverySlotDto.code,
        },
      });

      if (existingSlot) {
        throw new ConflictException(
          '同じ配送方法内で配送時間帯コードが既に存在します'
        );
      }

      const deliverySlot = await db.deliverySlot.create({
        data: {
          deliveryMethodId: createDeliverySlotDto.deliveryMethodId,
          name: createDeliverySlotDto.name,
          code: createDeliverySlotDto.code,
        },
        include: {
          deliveryMethod: true,
        },
      });

      return deliverySlot;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送時間帯の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<DeliverySlot[]> {
    try {
      return await db.deliverySlot.findMany({
        include: {
          deliveryMethod: true,
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
            take: 3,
          },
          _count: {
            select: {
              orders: true,
              shipments: true,
            },
          },
        },
        orderBy: [
          {
            deliveryMethod: {
              name: 'asc',
            },
          },
          {
            name: 'asc',
          },
        ],
      });
    } catch {
      throw new Error('配送時間帯一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<DeliverySlot> {
    try {
      const deliverySlot = await db.deliverySlot.findUnique({
        where: { id },
        include: {
          deliveryMethod: true,
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
            },
            orderBy: {
              orderDate: 'desc',
            },
          },
          shipments: {
            include: {
              order: {
                include: {
                  user: true,
                },
              },
              address: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });

      if (!deliverySlot) {
        throw new NotFoundException('配送時間帯が見つかりません');
      }

      return deliverySlot;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送時間帯の取得中にエラーが発生しました');
    }
  }

  async findByDeliveryMethod(
    deliveryMethodId: number
  ): Promise<DeliverySlot[]> {
    try {
      return await db.deliverySlot.findMany({
        where: { deliveryMethodId },
        include: {
          deliveryMethod: true,
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
      });
    } catch {
      throw new Error('配送方法別時間帯一覧の取得中にエラーが発生しました');
    }
  }

  async findByCode(
    deliveryMethodId: number,
    code: string
  ): Promise<DeliverySlot> {
    try {
      const deliverySlot = await db.deliverySlot.findFirst({
        where: {
          deliveryMethodId,
          code,
        },
        include: {
          deliveryMethod: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
            },
          },
        },
      });

      if (!deliverySlot) {
        throw new NotFoundException(
          '指定されたコードの配送時間帯が見つかりません'
        );
      }

      return deliverySlot;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送時間帯の検索中にエラーが発生しました');
    }
  }

  async searchDeliverySlots(searchTerm: string): Promise<DeliverySlot[]> {
    try {
      return await db.deliverySlot.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
            {
              deliveryMethod: {
                name: { contains: searchTerm, mode: 'insensitive' },
              },
            },
          ],
        },
        include: {
          deliveryMethod: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
            },
          },
        },
        orderBy: [
          {
            deliveryMethod: {
              name: 'asc',
            },
          },
          {
            name: 'asc',
          },
        ],
      });
    } catch {
      throw new Error('配送時間帯の検索中にエラーが発生しました');
    }
  }

  async getSlotOrders(slotId: number): Promise<any[]> {
    try {
      const deliverySlot = await db.deliverySlot.findUnique({
        where: { id: slotId },
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

      if (!deliverySlot) {
        throw new NotFoundException('配送時間帯が見つかりません');
      }

      return deliverySlot.orders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送時間帯注文一覧の取得中にエラーが発生しました');
    }
  }

  async getSlotShipments(slotId: number): Promise<any[]> {
    try {
      const deliverySlot = await db.deliverySlot.findUnique({
        where: { id: slotId },
        include: {
          shipments: {
            include: {
              order: {
                include: {
                  user: true,
                  items: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              address: true,
              site: true,
              shop: true,
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });

      if (!deliverySlot) {
        throw new NotFoundException('配送時間帯が見つかりません');
      }

      return deliverySlot.shipments;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送時間帯配送一覧の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateDeliverySlotDto: UpdateDeliverySlotDto
  ): Promise<DeliverySlot> {
    try {
      const existingSlot = await db.deliverySlot.findUnique({
        where: { id },
      });

      if (!existingSlot) {
        throw new NotFoundException('配送時間帯が見つかりません');
      }

      if (updateDeliverySlotDto.deliveryMethodId) {
        const deliveryMethod = await db.deliveryMethod.findUnique({
          where: { id: updateDeliverySlotDto.deliveryMethodId },
        });

        if (!deliveryMethod) {
          throw new NotFoundException('指定された配送方法が見つかりません');
        }
      }

      if (
        updateDeliverySlotDto.code &&
        (updateDeliverySlotDto.code !== existingSlot.code ||
          (updateDeliverySlotDto.deliveryMethodId &&
            updateDeliverySlotDto.deliveryMethodId !==
              existingSlot.deliveryMethodId))
      ) {
        const codeExists = await db.deliverySlot.findFirst({
          where: {
            deliveryMethodId:
              updateDeliverySlotDto.deliveryMethodId ||
              existingSlot.deliveryMethodId,
            code: updateDeliverySlotDto.code,
            NOT: { id },
          },
        });

        if (codeExists) {
          throw new ConflictException(
            '同じ配送方法内で配送時間帯コードが既に存在します'
          );
        }
      }

      const deliverySlot = await db.deliverySlot.update({
        where: { id },
        data: updateDeliverySlotDto,
        include: {
          deliveryMethod: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
            },
          },
        },
      });

      return deliverySlot;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送時間帯の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const deliverySlot = await db.deliverySlot.findUnique({
        where: { id },
        include: {
          orders: true,
          shipments: true,
        },
      });

      if (!deliverySlot) {
        throw new NotFoundException('配送時間帯が見つかりません');
      }

      if (deliverySlot.orders.length > 0) {
        throw new ConflictException('注文履歴がある配送時間帯は削除できません');
      }

      if (deliverySlot.shipments.length > 0) {
        throw new ConflictException('配送履歴がある配送時間帯は削除できません');
      }

      await db.deliverySlot.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送時間帯の削除中にエラーが発生しました');
    }
  }
}
