export class User {
  id: number;
  email: string;
  name: string;
  orders: Order[];
}

export class Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}