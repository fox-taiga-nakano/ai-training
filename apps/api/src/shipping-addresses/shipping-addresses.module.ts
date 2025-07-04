import { Module } from '@nestjs/common';

import { ShippingAddressesController } from './shipping-addresses.controller';
import { ShippingAddressesService } from './shipping-addresses.service';

@Module({
  controllers: [ShippingAddressesController],
  providers: [ShippingAddressesService],
  exports: [ShippingAddressesService],
})
export class ShippingAddressesModule {}
