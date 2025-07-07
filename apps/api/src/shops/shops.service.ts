import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShopDto } from '@repo/api/shops/dto/create-shop.dto';
import { UpdateShopDto } from '@repo/api/shops/dto/update-shop.dto';
import { db } from '@repo/database';
import type { Shop } from '@repo/database';

@Injectable()
export class ShopsService {
  async create(createShopDto: CreateShopDto): Promise<Shop> {
    try {
      const site = await db.site.findUnique({
        where: { id: createShopDto.siteId },
      });

      if (!site) {
        throw new NotFoundException('指定されたサイトが見つかりません');
      }

      const existingShop = await db.shop.findUnique({
        where: { code: createShopDto.code },
      });

      if (existingShop) {
        throw new ConflictException('ショップコードが既に存在します');
      }

      const shop = await db.shop.create({
        data: {
          name: createShopDto.name,
          code: createShopDto.code,
          siteId: createShopDto.siteId,
        },
        include: {
          site: true,
        },
      });

      return shop;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('ショップの作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Shop[]> {
    try {
      return await db.shop.findMany({
        include: {
          site: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              orderStatus: true,
              orderDate: true,
              totalAmount: true,
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
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('ショップ一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Shop> {
    try {
      const shop = await db.shop.findUnique({
        where: { id },
        include: {
          site: true,
          orders: {
            include: {
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

      if (!shop) {
        throw new NotFoundException('ショップが見つかりません');
      }

      return shop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ショップの取得中にエラーが発生しました');
    }
  }

  async findByCode(code: string): Promise<Shop> {
    try {
      const shop = await db.shop.findUnique({
        where: { code },
        include: {
          site: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
            },
          },
        },
      });

      if (!shop) {
        throw new NotFoundException(
          '指定されたコードのショップが見つかりません'
        );
      }

      return shop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ショップの検索中にエラーが発生しました');
    }
  }

  async findBySite(siteId: number): Promise<Shop[]> {
    try {
      return await db.shop.findMany({
        where: { siteId },
        include: {
          site: true,
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
      throw new Error('サイト別ショップ一覧の取得中にエラーが発生しました');
    }
  }

  async searchShops(searchTerm: string): Promise<Shop[]> {
    try {
      return await db.shop.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          site: true,
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
      throw new Error('ショップの検索中にエラーが発生しました');
    }
  }

  async getShopOrders(shopId: number): Promise<any[]> {
    try {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        include: {
          orders: {
            include: {
              user: true,
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

      if (!shop) {
        throw new NotFoundException('ショップが見つかりません');
      }

      return shop.orders;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ショップ注文一覧の取得中にエラーが発生しました');
    }
  }

  async update(id: number, updateShopDto: UpdateShopDto): Promise<Shop> {
    try {
      const existingShop = await db.shop.findUnique({
        where: { id },
      });

      if (!existingShop) {
        throw new NotFoundException('ショップが見つかりません');
      }

      if (updateShopDto.siteId) {
        const site = await db.site.findUnique({
          where: { id: updateShopDto.siteId },
        });

        if (!site) {
          throw new NotFoundException('指定されたサイトが見つかりません');
        }
      }

      if (updateShopDto.code && updateShopDto.code !== existingShop.code) {
        const codeExists = await db.shop.findUnique({
          where: { code: updateShopDto.code },
        });

        if (codeExists) {
          throw new ConflictException('ショップコードが既に存在します');
        }
      }

      const shop = await db.shop.update({
        where: { id },
        data: updateShopDto,
        include: {
          site: true,
        },
      });

      return shop;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('ショップの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const shop = await db.shop.findUnique({
        where: { id },
        include: {
          orders: true,
          shipments: true,
        },
      });

      if (!shop) {
        throw new NotFoundException('ショップが見つかりません');
      }

      if (shop.orders.length > 0) {
        throw new ConflictException('注文履歴があるショップは削除できません');
      }

      if (shop.shipments.length > 0) {
        throw new ConflictException('配送履歴があるショップは削除できません');
      }

      await db.shop.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('ショップの削除中にエラーが発生しました');
    }
  }
}
