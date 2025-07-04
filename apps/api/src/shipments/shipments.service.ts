import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShipmentDto } from '@repo/api/shipments/dto/create-shipment.dto';
import { UpdateShipmentDto } from '@repo/api/shipments/dto/update-shipment.dto';
import { db } from '@repo/database';
import type { Shipment, ShipmentStatus } from '@repo/database';

@Injectable()
export class ShipmentsService {
  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    try {
      const order = await db.order.findUnique({
        where: { id: createShipmentDto.orderId },
      });

      if (!order) {
        throw new NotFoundException('指定された注文が見つかりません');
      }

      const site = await db.site.findUnique({
        where: { id: createShipmentDto.siteId },
      });

      if (!site) {
        throw new NotFoundException('指定されたサイトが見つかりません');
      }

      const shop = await db.shop.findUnique({
        where: { id: createShipmentDto.shopId },
      });

      if (!shop) {
        throw new NotFoundException('指定されたショップが見つかりません');
      }

      const address = await db.shippingAddress.findUnique({
        where: { id: createShipmentDto.addressId },
      });

      if (!address) {
        throw new NotFoundException('指定された配送先住所が見つかりません');
      }

      if (createShipmentDto.deliverySlotId) {
        const deliverySlot = await db.deliverySlot.findUnique({
          where: { id: createShipmentDto.deliverySlotId },
        });

        if (!deliverySlot) {
          throw new NotFoundException('指定された配送時間帯が見つかりません');
        }
      }

      const shipment = await db.shipment.create({
        data: {
          orderId: createShipmentDto.orderId,
          siteId: createShipmentDto.siteId,
          shopId: createShipmentDto.shopId,
          addressId: createShipmentDto.addressId,
          deliverySlotId: createShipmentDto.deliverySlotId,
          trackingNumber: createShipmentDto.trackingNumber,
          shippedAt: createShipmentDto.shippedAt,
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          site: true,
          shop: true,
          address: true,
          deliverySlot: true,
        },
      });

      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送情報の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Shipment[]> {
    try {
      return await db.shipment.findMany({
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
          site: true,
          shop: true,
          address: true,
          deliverySlot: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('配送一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Shipment> {
    try {
      const shipment = await db.shipment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                  category: true,
                },
              },
            },
          },
          site: true,
          shop: true,
          address: true,
          deliverySlot: true,
        },
      });

      if (!shipment) {
        throw new NotFoundException('配送情報が見つかりません');
      }

      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送情報の取得中にエラーが発生しました');
    }
  }

  async findByOrder(orderId: number): Promise<Shipment[]> {
    try {
      return await db.shipment.findMany({
        where: { orderId },
        include: {
          site: true,
          shop: true,
          address: true,
          deliverySlot: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('注文の配送情報取得中にエラーが発生しました');
    }
  }

  async findByStatus(status: ShipmentStatus): Promise<Shipment[]> {
    try {
      return await db.shipment.findMany({
        where: { shippingStatus: status },
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
          site: true,
          shop: true,
          address: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('ステータス別配送一覧の取得中にエラーが発生しました');
    }
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment> {
    try {
      const shipment = await db.shipment.findFirst({
        where: { trackingNumber },
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
          deliverySlot: true,
        },
      });

      if (!shipment) {
        throw new NotFoundException(
          '指定された追跡番号の配送情報が見つかりません'
        );
      }

      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送情報の検索中にエラーが発生しました');
    }
  }

  async updateStatus(
    id: number,
    status: ShipmentStatus,
    trackingNumber?: string
  ): Promise<Shipment> {
    try {
      const existingShipment = await db.shipment.findUnique({
        where: { id },
      });

      if (!existingShipment) {
        throw new NotFoundException('配送情報が見つかりません');
      }

      if (existingShipment.shippingStatus === 'DELIVERED') {
        throw new BadRequestException(
          '配送完了済みの商品のステータスは変更できません'
        );
      }

      const updateData: any = {
        shippingStatus: status,
      };

      if (status === 'IN_TRANSIT' && trackingNumber) {
        updateData.trackingNumber = trackingNumber;
        updateData.shippedAt = new Date();
      }

      const shipment = await db.shipment.update({
        where: { id },
        data: updateData,
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          address: true,
        },
      });

      return shipment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('配送ステータスの更新中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto
  ): Promise<Shipment> {
    try {
      const existingShipment = await db.shipment.findUnique({
        where: { id },
      });

      if (!existingShipment) {
        throw new NotFoundException('配送情報が見つかりません');
      }

      if (updateShipmentDto.addressId) {
        const address = await db.shippingAddress.findUnique({
          where: { id: updateShipmentDto.addressId },
        });

        if (!address) {
          throw new NotFoundException('指定された配送先住所が見つかりません');
        }
      }

      if (updateShipmentDto.deliverySlotId) {
        const deliverySlot = await db.deliverySlot.findUnique({
          where: { id: updateShipmentDto.deliverySlotId },
        });

        if (!deliverySlot) {
          throw new NotFoundException('指定された配送時間帯が見つかりません');
        }
      }

      const shipment = await db.shipment.update({
        where: { id },
        data: updateShipmentDto,
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
          site: true,
          shop: true,
          address: true,
          deliverySlot: true,
        },
      });

      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送情報の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const shipment = await db.shipment.findUnique({
        where: { id },
      });

      if (!shipment) {
        throw new NotFoundException('配送情報が見つかりません');
      }

      if (shipment.shippingStatus !== 'PREPARING') {
        throw new BadRequestException('準備中の配送のみ削除できます');
      }

      await db.shipment.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('配送情報の削除中にエラーが発生しました');
    }
  }
}
