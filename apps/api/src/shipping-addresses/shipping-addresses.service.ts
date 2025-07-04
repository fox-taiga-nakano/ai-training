import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateShippingAddressDto } from '@repo/api/shipping-addresses/dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from '@repo/api/shipping-addresses/dto/update-shipping-address.dto';
import { db } from '@repo/database';
import type { ShippingAddress } from '@repo/database';

@Injectable()
export class ShippingAddressesService {
  async create(
    createShippingAddressDto: CreateShippingAddressDto
  ): Promise<ShippingAddress> {
    try {
      const shippingAddress = await db.shippingAddress.create({
        data: {
          name: createShippingAddressDto.name,
          postalCode: createShippingAddressDto.postalCode,
          prefecture: createShippingAddressDto.prefecture,
          addressLine: createShippingAddressDto.addressLine,
        },
      });

      return shippingAddress;
    } catch (error) {
      throw new Error('配送先住所の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<ShippingAddress[]> {
    try {
      return await db.shippingAddress.findMany({
        include: {
          shipments: {
            select: {
              id: true,
              trackingNumber: true,
              shippingStatus: true,
              shippedAt: true,
              order: {
                select: {
                  id: true,
                  orderNumber: true,
                  orderDate: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
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
              shipments: true,
            },
          },
        },
        orderBy: [
          {
            prefecture: 'asc',
          },
          {
            name: 'asc',
          },
        ],
      });
    } catch {
      throw new Error('配送先住所一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<ShippingAddress> {
    try {
      const shippingAddress = await db.shippingAddress.findUnique({
        where: { id },
        include: {
          shipments: {
            include: {
              order: {
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
              },
              site: true,
              shop: true,
              deliverySlot: {
                include: {
                  deliveryMethod: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });

      if (!shippingAddress) {
        throw new NotFoundException('配送先住所が見つかりません');
      }

      return shippingAddress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送先住所の取得中にエラーが発生しました');
    }
  }

  async findByPrefecture(prefecture: string): Promise<ShippingAddress[]> {
    try {
      return await db.shippingAddress.findMany({
        where: { prefecture },
        include: {
          _count: {
            select: {
              shipments: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('都道府県別配送先住所一覧の取得中にエラーが発生しました');
    }
  }

  async findByPostalCode(postalCode: string): Promise<ShippingAddress[]> {
    try {
      return await db.shippingAddress.findMany({
        where: { postalCode: { contains: postalCode } },
        include: {
          _count: {
            select: {
              shipments: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('郵便番号による配送先住所検索中にエラーが発生しました');
    }
  }

  async searchShippingAddresses(
    searchTerm: string
  ): Promise<ShippingAddress[]> {
    try {
      return await db.shippingAddress.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { prefecture: { contains: searchTerm, mode: 'insensitive' } },
            { addressLine: { contains: searchTerm, mode: 'insensitive' } },
            { postalCode: { contains: searchTerm } },
          ],
        },
        include: {
          _count: {
            select: {
              shipments: true,
            },
          },
        },
        orderBy: [
          {
            prefecture: 'asc',
          },
          {
            name: 'asc',
          },
        ],
      });
    } catch {
      throw new Error('配送先住所の検索中にエラーが発生しました');
    }
  }

  async getAddressShipments(addressId: number): Promise<any[]> {
    try {
      const shippingAddress = await db.shippingAddress.findUnique({
        where: { id: addressId },
        include: {
          shipments: {
            include: {
              order: {
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
                },
              },
              site: true,
              shop: true,
              deliverySlot: {
                include: {
                  deliveryMethod: true,
                },
              },
            },
            orderBy: {
              id: 'desc',
            },
          },
        },
      });

      if (!shippingAddress) {
        throw new NotFoundException('配送先住所が見つかりません');
      }

      return shippingAddress.shipments;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送先住所の配送一覧取得中にエラーが発生しました');
    }
  }

  async getPrefectures(): Promise<
    Array<{ prefecture: string; count: number }>
  > {
    try {
      const result = await db.shippingAddress.groupBy({
        by: ['prefecture'],
        _count: {
          id: true,
        },
        orderBy: {
          prefecture: 'asc',
        },
      });

      return result.map((item) => ({
        prefecture: item.prefecture,
        count: item._count.id,
      }));
    } catch {
      throw new Error('都道府県一覧の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateShippingAddressDto: UpdateShippingAddressDto
  ): Promise<ShippingAddress> {
    try {
      const existingAddress = await db.shippingAddress.findUnique({
        where: { id },
      });

      if (!existingAddress) {
        throw new NotFoundException('配送先住所が見つかりません');
      }

      const shippingAddress = await db.shippingAddress.update({
        where: { id },
        data: updateShippingAddressDto,
        include: {
          _count: {
            select: {
              shipments: true,
            },
          },
        },
      });

      return shippingAddress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('配送先住所の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const shippingAddress = await db.shippingAddress.findUnique({
        where: { id },
        include: {
          shipments: true,
        },
      });

      if (!shippingAddress) {
        throw new NotFoundException('配送先住所が見つかりません');
      }

      if (shippingAddress.shipments.length > 0) {
        throw new ConflictException('配送履歴がある住所は削除できません');
      }

      await db.shippingAddress.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('配送先住所の削除中にエラーが発生しました');
    }
  }
}
