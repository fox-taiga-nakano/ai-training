import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentInfoModule } from './payment-info/payment-info.module';
import { ProductsModule } from './products/products.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { ShopsModule } from './shops/shops.module';
import { SitesModule } from './sites/sites.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    UsersModule,
    ShipmentsModule,
    PaymentInfoModule,
    CategoriesModule,
    SuppliersModule,
    SitesModule,
    ShopsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
