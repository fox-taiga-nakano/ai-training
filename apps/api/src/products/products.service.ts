import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from '@repo/api/products/dto/create-product.dto';
import { UpdateProductDto } from '@repo/api/products/dto/update-product.dto';
import { db } from '@repo/database';
import type { Product } from '@repo/database';

@Injectable()
export class ProductsService {
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const existingProduct = await db.product.findUnique({
        where: { code: createProductDto.code },
      });

      if (existingProduct) {
        throw new ConflictException('商品コードが既に存在します');
      }

      const category = await db.category.findUnique({
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('指定されたカテゴリが見つかりません');
      }

      const supplier = await db.supplier.findUnique({
        where: { id: createProductDto.supplierId },
      });

      if (!supplier) {
        throw new NotFoundException('指定されたサプライヤーが見つかりません');
      }

      const product = await db.product.create({
        data: {
          code: createProductDto.code,
          name: createProductDto.name,
          categoryId: createProductDto.categoryId,
          supplierId: createProductDto.supplierId,
          retailPrice: createProductDto.retailPrice,
          purchasePrice: createProductDto.purchasePrice,
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      return product;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new Error('商品の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await db.product.findMany({
        include: {
          category: true,
          supplier: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('商品一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await db.product.findUnique({
        where: { id },
        include: {
          category: true,
          supplier: true,
        },
      });

      if (!product) {
        throw new NotFoundException('商品が見つかりません');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('商品の取得中にエラーが発生しました');
    }
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    try {
      return await db.product.findMany({
        where: { categoryId },
        include: {
          category: true,
          supplier: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('カテゴリ別商品一覧の取得中にエラーが発生しました');
    }
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      return await db.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { code: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          supplier: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('商品検索中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    try {
      const existingProduct = await db.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('商品が見つかりません');
      }

      if (
        updateProductDto.code &&
        updateProductDto.code !== existingProduct.code
      ) {
        const codeExists = await db.product.findUnique({
          where: { code: updateProductDto.code },
        });

        if (codeExists) {
          throw new ConflictException('商品コードが既に存在します');
        }
      }

      if (updateProductDto.categoryId) {
        const category = await db.category.findUnique({
          where: { id: updateProductDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException('指定されたカテゴリが見つかりません');
        }
      }

      if (updateProductDto.supplierId) {
        const supplier = await db.supplier.findUnique({
          where: { id: updateProductDto.supplierId },
        });

        if (!supplier) {
          throw new NotFoundException('指定されたサプライヤーが見つかりません');
        }
      }

      const product = await db.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          category: true,
          supplier: true,
        },
      });

      return product;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('商品の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const product = await db.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new NotFoundException('商品が見つかりません');
      }

      await db.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('商品の削除中にエラーが発生しました');
    }
  }

  async getCategories() {
    try {
      return await db.category.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('カテゴリ一覧の取得中にエラーが発生しました');
    }
  }

  async getSuppliers() {
    try {
      return await db.supplier.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      throw new Error('サプライヤー一覧の取得中にエラーが発生しました');
    }
  }
}
