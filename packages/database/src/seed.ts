import { db } from './index';

async function main() {
  console.log('シードデータを開始します...');

  // サイトを作成
  const site1 = await db.site.create({
    data: {
      code: 'SITE001',
      name: 'メインサイト',
      status: 'ACTIVE',
    },
  });

  const site2 = await db.site.create({
    data: {
      code: 'SITE002',
      name: 'サブサイト',
      status: 'ACTIVE',
    },
  });

  // ショップを作成
  const shop1 = await db.shop.create({
    data: {
      name: '東京店',
      code: 'SHOP001',
      siteId: site1.id,
    },
  });

  const shop2 = await db.shop.create({
    data: {
      name: '大阪店',
      code: 'SHOP002',
      siteId: site1.id,
    },
  });

  // ユーザーを作成
  const user1 = await db.user.create({
    data: {
      email: 'user1@example.com',
      name: '田中太郎',
    },
  });

  const user2 = await db.user.create({
    data: {
      email: 'user2@example.com',
      name: '佐藤花子',
    },
  });

  const user3 = await db.user.create({
    data: {
      email: 'user3@example.com',
      name: '鈴木一郎',
    },
  });

  // カテゴリを作成
  const category1 = await db.category.create({
    data: {
      name: '電子機器',
    },
  });

  const category2 = await db.category.create({
    data: {
      name: '食品',
    },
  });

  const category3 = await db.category.create({
    data: {
      name: '衣類',
    },
  });

  // サプライヤーを作成
  const supplier1 = await db.supplier.create({
    data: {
      code: 'SUP001',
      name: 'テクノロジー株式会社',
      email: 'contact@techno.co.jp',
      phoneNumber: '03-1234-5678',
    },
  });

  const supplier2 = await db.supplier.create({
    data: {
      code: 'SUP002',
      name: 'フード産業',
      email: 'info@food.co.jp',
      phoneNumber: '06-2345-6789',
    },
  });

  const supplier3 = await db.supplier.create({
    data: {
      code: 'SUP003',
      name: 'ファッション商事',
      email: 'sales@fashion.co.jp',
      phoneNumber: '03-3456-7890',
    },
  });

  // 商品を作成
  const product1 = await db.product.create({
    data: {
      code: 'PROD001',
      name: 'スマートフォン',
      categoryId: category1.id,
      supplierId: supplier1.id,
      retailPrice: 89800,
      purchasePrice: 65000,
    },
  });

  const product2 = await db.product.create({
    data: {
      code: 'PROD002',
      name: 'ワイヤレスイヤホン',
      categoryId: category1.id,
      supplierId: supplier1.id,
      retailPrice: 19800,
      purchasePrice: 12000,
    },
  });

  const product3 = await db.product.create({
    data: {
      code: 'PROD003',
      name: 'オーガニックコーヒー',
      categoryId: category2.id,
      supplierId: supplier2.id,
      retailPrice: 1200,
      purchasePrice: 800,
    },
  });

  const product4 = await db.product.create({
    data: {
      code: 'PROD004',
      name: 'プレミアムTシャツ',
      categoryId: category3.id,
      supplierId: supplier3.id,
      retailPrice: 4800,
      purchasePrice: 2500,
    },
  });

  // 支払い方法を作成
  const paymentMethod1 = await db.paymentMethod.create({
    data: {
      name: 'クレジットカード',
      code: 'CREDIT',
      active: true,
    },
  });

  const paymentMethod2 = await db.paymentMethod.create({
    data: {
      name: '銀行振込',
      code: 'BANK',
      active: true,
    },
  });

  const paymentMethod3 = await db.paymentMethod.create({
    data: {
      name: '代金引換',
      code: 'COD',
      active: true,
    },
  });

  // 配送方法を作成
  const deliveryMethod1 = await db.deliveryMethod.create({
    data: {
      name: '通常配送',
      code: 'STANDARD',
      type: 'STANDARD',
    },
  });

  const deliveryMethod2 = await db.deliveryMethod.create({
    data: {
      name: '速達配送',
      code: 'EXPRESS',
      type: 'EXPRESS',
    },
  });

  const deliveryMethod3 = await db.deliveryMethod.create({
    data: {
      name: '冷蔵配送',
      code: 'COOL',
      type: 'COOL',
    },
  });

  // 配送時間帯を作成
  const deliverySlot1 = await db.deliverySlot.create({
    data: {
      deliveryMethodId: deliveryMethod1.id,
      name: '午前中',
      code: 'AM',
    },
  });

  const deliverySlot2 = await db.deliverySlot.create({
    data: {
      deliveryMethodId: deliveryMethod1.id,
      name: '午後',
      code: 'PM',
    },
  });

  const deliverySlot3 = await db.deliverySlot.create({
    data: {
      deliveryMethodId: deliveryMethod2.id,
      name: '当日配送',
      code: 'TODAY',
    },
  });

  // 配送先住所を作成
  const address1 = await db.shippingAddress.create({
    data: {
      name: '田中太郎',
      postalCode: '100-0001',
      prefecture: '東京都',
      addressLine: '千代田区千代田1-1-1',
    },
  });

  const address2 = await db.shippingAddress.create({
    data: {
      name: '佐藤花子',
      postalCode: '530-0001',
      prefecture: '大阪府',
      addressLine: '大阪市北区梅田1-1-1',
    },
  });

  // 注文を作成
  const order1 = await db.order.create({
    data: {
      siteId: site1.id,
      shopId: shop1.id,
      userId: user1.id,
      orderNumber: 'ORD-2024-001',
      totalAmount: 91000,
      shippingFee: 1200,
      discountAmount: 0,
      billingAmount: 91000,
      paymentMethodId: paymentMethod1.id,
      deliveryMethodId: deliveryMethod1.id,
      deliverySlotId: deliverySlot1.id,
      orderStatus: 'CONFIRMED',
      orderDate: new Date('2024-01-15T10:30:00Z'),
      desiredArrivalDate: new Date('2024-01-17T00:00:00Z'),
      memo: '早めの配送をお願いします',
    },
  });

  const order2 = await db.order.create({
    data: {
      siteId: site1.id,
      shopId: shop2.id,
      userId: user2.id,
      orderNumber: 'ORD-2024-002',
      totalAmount: 21000,
      shippingFee: 1200,
      discountAmount: 1000,
      billingAmount: 21200,
      paymentMethodId: paymentMethod2.id,
      deliveryMethodId: deliveryMethod2.id,
      deliverySlotId: deliverySlot3.id,
      orderStatus: 'PENDING',
      orderDate: new Date('2024-01-16T14:15:00Z'),
      memo: null,
    },
  });

  // 注文アイテムを作成
  await db.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        productId: product1.id,
        categoryId: category1.id,
        productCode: product1.code,
        productName: product1.name,
        quantity: 1,
        unitPrice: 89800,
        memo: null,
      },
      {
        orderId: order1.id,
        productId: product3.id,
        categoryId: category2.id,
        productCode: product3.code,
        productName: product3.name,
        quantity: 1,
        unitPrice: 1200,
        memo: null,
      },
      {
        orderId: order2.id,
        productId: product2.id,
        categoryId: category1.id,
        productCode: product2.code,
        productName: product2.name,
        quantity: 1,
        unitPrice: 19800,
        memo: null,
      },
    ],
  });

  // 支払い情報を作成
  await db.paymentInfo.create({
    data: {
      orderId: order1.id,
      siteId: site1.id,
      paymentStatus: 'PAID',
      paymentAmount: 91000,
      paymentDate: new Date('2024-01-15T11:00:00Z'),
      transactionId: 'TXN-20240115-001',
    },
  });

  await db.paymentInfo.create({
    data: {
      orderId: order2.id,
      siteId: site1.id,
      paymentStatus: 'UNPAID',
      paymentAmount: 21200,
      paymentDate: null,
      transactionId: null,
    },
  });

  // 配送情報を作成
  await db.shipment.create({
    data: {
      orderId: order1.id,
      siteId: site1.id,
      shopId: shop1.id,
      addressId: address1.id,
      deliverySlotId: deliverySlot1.id,
      trackingNumber: 'TRACK-001',
      shippedAt: new Date('2024-01-16T09:00:00Z'),
      shippingStatus: 'IN_TRANSIT',
    },
  });

  // 仕入れ注文を作成
  const purchaseOrder1 = await db.purchaseOrder.create({
    data: {
      orderId: order1.id,
      supplierId: supplier1.id,
      siteId: site1.id,
      purchaserId: user3.id,
      invoiceNo: 'INV-2024-001',
      orderDate: new Date('2024-01-10T00:00:00Z'),
      expectedAt: new Date('2024-01-20T00:00:00Z'),
    },
  });

  // 入荷情報を作成
  await db.receiving.create({
    data: {
      purchaseOrderId: purchaseOrder1.id,
      siteId: site1.id,
      supplierId: supplier1.id,
      receivedAt: new Date('2024-01-18T00:00:00Z'),
      status: 'RECEIVED',
    },
  });

  // 注文ステータスログを作成
  await db.orderStatusLog.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'PENDING',
        changedAt: new Date('2024-01-15T10:30:00Z'),
      },
      {
        orderId: order1.id,
        status: 'CONFIRMED',
        changedAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        orderId: order2.id,
        status: 'PENDING',
        changedAt: new Date('2024-01-16T14:15:00Z'),
      },
    ],
  });

  console.log('シードデータの追加が完了しました。');
  console.log('作成されたデータ:');
  console.log(`- サイト: ${await db.site.count()}件`);
  console.log(`- ショップ: ${await db.shop.count()}件`);
  console.log(`- ユーザー: ${await db.user.count()}件`);
  console.log(`- カテゴリ: ${await db.category.count()}件`);
  console.log(`- サプライヤー: ${await db.supplier.count()}件`);
  console.log(`- 商品: ${await db.product.count()}件`);
  console.log(`- 支払い方法: ${await db.paymentMethod.count()}件`);
  console.log(`- 配送方法: ${await db.deliveryMethod.count()}件`);
  console.log(`- 配送時間帯: ${await db.deliverySlot.count()}件`);
  console.log(`- 配送先住所: ${await db.shippingAddress.count()}件`);
  console.log(`- 注文: ${await db.order.count()}件`);
  console.log(`- 注文アイテム: ${await db.orderItem.count()}件`);
  console.log(`- 支払い情報: ${await db.paymentInfo.count()}件`);
  console.log(`- 配送情報: ${await db.shipment.count()}件`);
  console.log(`- 仕入れ注文: ${await db.purchaseOrder.count()}件`);
  console.log(`- 入荷情報: ${await db.receiving.count()}件`);
  console.log(`- 注文ステータスログ: ${await db.orderStatusLog.count()}件`);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
