import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '@repo/api/users/dto/create-user.dto';
import { UpdateUserDto } from '@repo/api/users/dto/update-user.dto';
import { db } from '@repo/database';
import type { User } from '@repo/database';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await db.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('メールアドレスが既に登録されています');
      }

      const user = await db.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('ユーザーの作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await db.user.findMany({
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('ユーザー一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await db.user.findUnique({
        where: { id },
        include: {
          orders: {
            include: {
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
              payments: true,
            },
            orderBy: {
              orderDate: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('ユーザーが見つかりません');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ユーザーの取得中にエラーが発生しました');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(
          '指定されたメールアドレスのユーザーが見つかりません'
        );
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ユーザーの検索中にエラーが発生しました');
    }
  }

  async getOrderHistory(userId: number): Promise<any[]> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('ユーザーが見つかりません');
      }

      return await db.order.findMany({
        where: { userId },
        include: {
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
          payments: true,
        },
        orderBy: {
          orderDate: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('注文履歴の取得中にエラーが発生しました');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const existingUser = await db.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('ユーザーが見つかりません');
      }

      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await db.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (emailExists) {
          throw new ConflictException('メールアドレスが既に登録されています');
        }
      }

      const user = await db.user.update({
        where: { id },
        data: updateUserDto,
      });

      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('ユーザーの更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const user = await db.user.findUnique({
        where: { id },
        include: {
          orders: true,
        },
      });

      if (!user) {
        throw new NotFoundException('ユーザーが見つかりません');
      }

      if (user.orders.length > 0) {
        throw new ConflictException('注文履歴があるユーザーは削除できません');
      }

      await db.user.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('ユーザーの削除中にエラーが発生しました');
    }
  }
}
