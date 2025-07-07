import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentInfoDto } from '@repo/api/payment-info/dto/create-payment-info.dto';
import { UpdatePaymentInfoDto } from '@repo/api/payment-info/dto/update-payment-info.dto';
import { db } from '@repo/database';
import type { PaymentInfo, PaymentStatus } from '@repo/database';

@Injectable()
export class PaymentInfoService {
  async create(
    createPaymentInfoDto: CreatePaymentInfoDto
  ): Promise<PaymentInfo> {
    try {
      const order = await db.order.findUnique({
        where: { id: createPaymentInfoDto.orderId },
      });

      if (!order) {
        throw new NotFoundException('指定された注文が見つかりません');
      }

      const site = await db.site.findUnique({
        where: { id: createPaymentInfoDto.siteId },
      });

      if (!site) {
        throw new NotFoundException('指定されたサイトが見つかりません');
      }

      const existingPayment = await db.paymentInfo.findFirst({
        where: { orderId: createPaymentInfoDto.orderId },
      });

      if (existingPayment) {
        throw new BadRequestException('この注文には既に決済情報が存在します');
      }

      const paymentInfo = await db.paymentInfo.create({
        data: {
          orderId: createPaymentInfoDto.orderId,
          siteId: createPaymentInfoDto.siteId,
          paymentAmount: createPaymentInfoDto.paymentAmount,
          transactionId: createPaymentInfoDto.transactionId,
        },
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
        },
      });

      return paymentInfo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('決済情報の作成中にエラーが発生しました');
    }
  }

  async findAll(): Promise<PaymentInfo[]> {
    try {
      return await db.paymentInfo.findMany({
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
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('決済情報一覧の取得中にエラーが発生しました');
    }
  }

  async findOne(id: number): Promise<PaymentInfo> {
    try {
      const paymentInfo = await db.paymentInfo.findUnique({
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
        },
      });

      if (!paymentInfo) {
        throw new NotFoundException('決済情報が見つかりません');
      }

      return paymentInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済情報の取得中にエラーが発生しました');
    }
  }

  async findByOrder(orderId: number): Promise<PaymentInfo[]> {
    try {
      return await db.paymentInfo.findMany({
        where: { orderId },
        include: {
          order: {
            include: {
              user: true,
            },
          },
          site: true,
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('注文の決済情報取得中にエラーが発生しました');
    }
  }

  async findByStatus(status: PaymentStatus): Promise<PaymentInfo[]> {
    try {
      return await db.paymentInfo.findMany({
        where: { paymentStatus: status },
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
        },
        orderBy: {
          id: 'desc',
        },
      });
    } catch {
      throw new Error('ステータス別決済情報の取得中にエラーが発生しました');
    }
  }

  async findByTransactionId(transactionId: string): Promise<PaymentInfo> {
    try {
      const paymentInfo = await db.paymentInfo.findFirst({
        where: { transactionId },
        include: {
          order: {
            include: {
              user: true,
            },
          },
          site: true,
        },
      });

      if (!paymentInfo) {
        throw new NotFoundException(
          '指定された取引IDの決済情報が見つかりません'
        );
      }

      return paymentInfo;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('決済情報の検索中にエラーが発生しました');
    }
  }

  async updateStatus(
    id: number,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<PaymentInfo> {
    try {
      const existingPayment = await db.paymentInfo.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        throw new NotFoundException('決済情報が見つかりません');
      }

      if (existingPayment.paymentStatus === 'REFUNDED') {
        throw new BadRequestException('返金済みの決済は変更できません');
      }

      const updateData: any = {
        paymentStatus: status,
      };

      if (status === 'PAID' || status === 'AUTHORIZED') {
        updateData.paymentDate = new Date();
        if (transactionId) {
          updateData.transactionId = transactionId;
        }
      }

      const paymentInfo = await db.paymentInfo.update({
        where: { id },
        data: updateData,
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
        },
      });

      return paymentInfo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('決済ステータスの更新中にエラーが発生しました');
    }
  }

  async refund(id: number): Promise<PaymentInfo> {
    try {
      const existingPayment = await db.paymentInfo.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        throw new NotFoundException('決済情報が見つかりません');
      }

      if (existingPayment.paymentStatus !== 'PAID') {
        throw new BadRequestException('支払い済みの決済のみ返金できます');
      }

      const paymentInfo = await db.paymentInfo.update({
        where: { id },
        data: {
          paymentStatus: 'REFUNDED',
        },
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
        },
      });

      return paymentInfo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('返金処理中にエラーが発生しました');
    }
  }

  async update(
    id: number,
    updatePaymentInfoDto: UpdatePaymentInfoDto
  ): Promise<PaymentInfo> {
    try {
      const existingPayment = await db.paymentInfo.findUnique({
        where: { id },
      });

      if (!existingPayment) {
        throw new NotFoundException('決済情報が見つかりません');
      }

      if (existingPayment.paymentStatus === 'REFUNDED') {
        throw new BadRequestException('返金済みの決済は変更できません');
      }

      const paymentInfo = await db.paymentInfo.update({
        where: { id },
        data: updatePaymentInfoDto,
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
        },
      });

      return paymentInfo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('決済情報の更新中にエラーが発生しました');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const paymentInfo = await db.paymentInfo.findUnique({
        where: { id },
      });

      if (!paymentInfo) {
        throw new NotFoundException('決済情報が見つかりません');
      }

      if (paymentInfo.paymentStatus !== 'UNPAID') {
        throw new BadRequestException('未払いの決済のみ削除できます');
      }

      await db.paymentInfo.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error('決済情報の削除中にエラーが発生しました');
    }
  }
}
