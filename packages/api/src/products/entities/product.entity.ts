export class Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  supplierId: number;
  retailPrice: number;
  purchasePrice: number;
  category: Category;
  supplier: Supplier;
}

export class Category {
  id: number;
  name: string;
}

export class Supplier {
  id: number;
  code: string;
  name: string;
  email: string;
  phoneNumber: string;
}
