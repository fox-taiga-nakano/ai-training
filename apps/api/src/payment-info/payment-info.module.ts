import { Module } from '@nestjs/common';

import { PaymentInfoController } from './payment-info.controller';
import { PaymentInfoService } from './payment-info.service';

@Module({
  controllers: [PaymentInfoController],
  providers: [PaymentInfoService],
  exports: [PaymentInfoService],
})
export class PaymentInfoModule {}
