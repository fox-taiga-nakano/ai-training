export class CreateProductDto {
  code: string;
  name: string;
  categoryId: number;
  supplierId: number;
  retailPrice: number;
  purchasePrice: number;
}

export class UpdateProductDto {
  code?: string;
  name?: string;
  categoryId?: number;
  supplierId?: number;
  retailPrice?: number;
  purchasePrice?: number;
}
