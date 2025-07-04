import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '@repo/api/categories/dto/create-category.dto';
import { UpdateCategoryDto } from '@repo/api/categories/dto/update-category.dto';
import { db } from '@repo/database';
import type { Category } from '@repo/database';

@Injectable()
export class CategoriesService {
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const existingCategory = await db.category.findFirst({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('カテゴリ名が既に存在します');
      }

      const category = await db.category.create({
        data: {
          name: createCategoryDto.name,
        },
      });

      return category;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('カテゴリの作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await db.category.findMany({
        include: {
          products: {
            include: {
              supplier: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('カテゴリ一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Category> {
    try {
      const category = await db.category.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              supplier: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('カテゴリが見つかりません');
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('カテゴリの取得中にエラーが発生しました');
    }
  }

  async findByName(name: string): Promise<Category> {
    try {
      const category = await db.category.findFirst({
        where: { name: { contains: name, mode: 'insensitive' } },
        include: {
          products: {
            include: {
              supplier: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('指定された名前のカテゴリが見つかりません');
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('カテゴリの検索中にエラーが発生しました');
    }
  }

  async getProductsInCategory(categoryId: number): Promise<any[]> {
    try {
      const category = await db.category.findUnique({
        where: { id: categoryId },
        include: {
          products: {
            include: {
              supplier: true,
            },
            orderBy: {
              name: 'asc',
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('カテゴリが見つかりません');
      }

      return category.products;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('カテゴリ内商品の取得中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    try {
      const existingCategory = await db.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('カテゴリが見つかりません');
      }

      if (
        updateCategoryDto.name &&
        updateCategoryDto.name !== existingCategory.name
      ) {
        const nameExists = await db.category.findFirst({
          where: { name: updateCategoryDto.name },
        });

        if (nameExists) {
          throw new ConflictException('カテゴリ名が既に存在します');
        }
      }

      const category = await db.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          products: true,
        },
      });

      return category;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('カテゴリの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const category = await db.category.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!category) {
        throw new NotFoundException('カテゴリが見つかりません');
      }

      if (category.products.length > 0) {
        throw new ConflictException(
          '商品が登録されているカテゴリは削除できません'
        );
      }

      await db.category.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('カテゴリの削除中にエラーが発生しました');
    }
  }
}
