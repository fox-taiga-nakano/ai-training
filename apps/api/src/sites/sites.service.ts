import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSiteDto } from '@repo/api/sites/dto/create-site.dto';
import { UpdateSiteDto } from '@repo/api/sites/dto/update-site.dto';
import { db } from '@repo/database';
import type { Site, SiteStatus } from '@repo/database';

@Injectable()
export class SitesService {
  async create(createSiteDto: CreateSiteDto): Promise<Site> {
    try {
      const existingSite = await db.site.findUnique({
        where: { code: createSiteDto.code },
      });

      if (existingSite) {
        throw new ConflictException('サイトコードが既に存在します');
      }

      const site = await db.site.create({
        data: {
          code: createSiteDto.code,
          name: createSiteDto.name,
          status: createSiteDto.status || 'ACTIVE',
        },
      });

      return site;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('サイトの作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Site[]> {
    try {
      return await db.site.findMany({
        include: {
          shops: true,
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
            take: 5,
          },
          _count: {
            select: {
              shops: true,
              orders: true,
              shipments: true,
              payments: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('サイト一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Site> {
    try {
      const site = await db.site.findUnique({
        where: { id },
        include: {
          shops: {
            orderBy: {
              name: 'asc',
            },
          },
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
          payments: {
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
          },
        },
      });

      if (!site) {
        throw new NotFoundException('サイトが見つかりません');
      }

      return site;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サイトの取得中にエラーが発生しました');
    }
  }

  async findByCode(code: string): Promise<Site> {
    try {
      const site = await db.site.findUnique({
        where: { code },
        include: {
          shops: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
              payments: true,
            },
          },
        },
      });

      if (!site) {
        throw new NotFoundException('指定されたコードのサイトが見つかりません');
      }

      return site;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サイトの検索中にエラーが発生しました');
    }
  }

  async findByStatus(status: SiteStatus): Promise<Site[]> {
    try {
      return await db.site.findMany({
        where: { status },
        include: {
          shops: true,
          _count: {
            select: {
              orders: true,
              shipments: true,
              payments: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('ステータス別サイト一覧の取得中にエラーが発生しました');
    }
  }

  async getSiteShops(siteId: number): Promise<any[]> {
    try {
      const site = await db.site.findUnique({
        where: { id: siteId },
        include: {
          shops: {
            include: {
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

      if (!site) {
        throw new NotFoundException('サイトが見つかりません');
      }

      return site.shops;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('サイト店舗一覧の取得中にエラーが発生しました');
    }
  }

  async update(id: number, updateSiteDto: UpdateSiteDto): Promise<Site> {
    try {
      const existingSite = await db.site.findUnique({
        where: { id },
      });

      if (!existingSite) {
        throw new NotFoundException('サイトが見つかりません');
      }

      if (updateSiteDto.code && updateSiteDto.code !== existingSite.code) {
        const codeExists = await db.site.findUnique({
          where: { code: updateSiteDto.code },
        });

        if (codeExists) {
          throw new ConflictException('サイトコードが既に存在します');
        }
      }

      const site = await db.site.update({
        where: { id },
        data: updateSiteDto,
        include: {
          shops: true,
        },
      });

      return site;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('サイトの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const site = await db.site.findUnique({
        where: { id },
        include: {
          shops: true,
          orders: true,
          shipments: true,
          payments: true,
        },
      });

      if (!site) {
        throw new NotFoundException('サイトが見つかりません');
      }

      if (site.orders.length > 0) {
        throw new ConflictException('注文履歴があるサイトは削除できません');
      }

      if (site.shops.length > 0) {
        throw new ConflictException(
          '店舗が登録されているサイトは削除できません'
        );
      }

      await db.site.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('サイトの削除中にエラーが発生しました');
    }
  }
}
