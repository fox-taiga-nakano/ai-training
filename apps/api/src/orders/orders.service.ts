import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from '@repo/api/orders/dto/create-order.dto';
import { UpdateOrderStatusDto } from '@repo/api/orders/dto/update-order.dto';
import { db } from '@repo/database';
import type { Order, OrderStatus } from '@repo/database';

@Injectable()
export class OrdersService {
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      const user = await db.user.findUnique({
        where: { id: createOrderDto.userId },
      });

      if (!user) {
        throw new NotFoundException('指定されたユーザーが見つかりません');
      }

      const site = await db.site.findUnique({
        where: { id: createOrderDto.siteId },
      });

      if (!site) {
        throw new NotFoundException('指定されたサイトが見つかりません');
      }

      const shop = await db.shop.findUnique({
        where: { id: createOrderDto.shopId },
      });

      if (!shop) {
        throw new NotFoundException('指定されたショップが見つかりません');
      }

      const orderNumber = this.generateOrderNumber();

      return await db.$transaction(async (tx) => {
        const shippingAddress = await tx.shippingAddress.create({
          data: createOrderDto.shippingAddress,
        });

        const order = await tx.order.create({
          data: {
            siteId: createOrderDto.siteId,
            shopId: createOrderDto.shopId,
            userId: createOrderDto.userId,
            orderNumber,
            totalAmount: createOrderDto.totalAmount,
            shippingFee: createOrderDto.shippingFee,
            discountAmount: createOrderDto.discountAmount,
            billingAmount: createOrderDto.billingAmount,
            paymentMethodId: createOrderDto.paymentMethodId,
            deliveryMethodId: createOrderDto.deliveryMethodId,
            deliverySlotId: createOrderDto.deliverySlotId,
            orderDate: new Date(),
            desiredArrivalDate: createOrderDto.desiredArrivalDate,
            memo: createOrderDto.memo,
          },
          include: {
            site: true,
            shop: true,
            user: true,
            paymentMethod: true,
            deliveryMethod: true,
            deliverySlot: true,
            items: {
              include: {
                product: true,
                category: true,
              },
            },
          },
        });

        for (const item of createOrderDto.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { category: true },
          });

          if (!product) {
            throw new NotFoundException(
              `商品ID ${item.productId} が見つかりません`
            );
          }

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              categoryId: product.categoryId,
              productCode: product.code,
              productName: product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              memo: item.memo,
            },
          });
        }

        await tx.paymentInfo.create({
          data: {
            orderId: order.id,
            siteId: createOrderDto.siteId,
            paymentAmount: createOrderDto.billingAmount,
          },
        });

        await tx.shipment.create({
          data: {
            orderId: order.id,
            siteId: createOrderDto.siteId,
            shopId: createOrderDto.shopId,
            addressId: shippingAddress.id,
            deliverySlotId: createOrderDto.deliverySlotId,
          },
        });

        return order;
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('注文の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      return await db.order.findMany({
        include: {
          site: true,
          shop: true,
          user: true,
          paymentMethod: true,
          deliveryMethod: true,
          deliverySlot: true,
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
      });
    } catch {
      throw new Error('注文一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Order> {
    try {
      const order = await db.order.findUnique({
        where: { id },
        include: {
          site: true,
          shop: true,
          user: true,
          paymentMethod: true,
          deliveryMethod: true,
          deliverySlot: true,
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
          statusLogs: {
            orderBy: {
              changedAt: 'desc',
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('注文が見つかりません');
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('注文の取得中にエラーが発生しました');
    }
  }

  async findByUser(userId: number): Promise<Order[]> {
    try {
      return await db.order.findMany({
        where: { userId },
        include: {
          site: true,
          shop: true,
          paymentMethod: true,
          deliveryMethod: true,
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
      });
    } catch {
      throw new Error('ユーザー注文履歴の取得中にエラーが発生しました');
    }
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      return await db.order.findMany({
        where: { orderStatus: status },
        include: {
          site: true,
          shop: true,
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });
    } catch {
      throw new Error('ステータス別注文一覧の取得中にエラーが発生しました');
    }
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateOrderStatusDto
  ): Promise<Order> {
    try {
      const existingOrder = await db.order.findUnique({
        where: { id },
      });

      if (!existingOrder) {
        throw new NotFoundException('注文が見つかりません');
      }

      if (
        existingOrder.orderStatus === 'COMPLETED' ||
        existingOrder.orderStatus === 'CANCELED'
      ) {
        throw new BadRequestException(
          '完了またはキャンセル済みの注文は変更できません'
        );
      }

      return await db.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: { id },
          data: {
            orderStatus: updateStatusDto.orderStatus,
          },
          include: {
            site: true,
            shop: true,
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        await tx.orderStatusLog.create({
          data: {
            orderId: id,
            status: updateStatusDto.orderStatus,
          },
        });

        return order;
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('注文ステータスの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const order = await db.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new NotFoundException('注文が見つかりません');
      }

      if (order.orderStatus !== 'PENDING') {
        throw new BadRequestException('保留中の注文のみ削除できます');
      }

      await db.order.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('注文の削除中にエラーが発生しました');
    }
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);

    return `ORD${year}${month}${day}${timestamp}`;
  }
}
