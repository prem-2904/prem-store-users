export interface IProducts {
  _id: string;
  sellerId: SellerId;
  productName: string;
  productDesc: string;
  productImages: string[];
  isAvailableForSale: boolean;
  isDeleted: boolean;
  availabilityStocks: AvailabilityStock[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  sellerName: string;
  mrpPrice: number;
  discount: number;
  salePrice?: number;
  isAddedToCart?: boolean;
  cartId?: string;
  isWishlisted?: boolean;
  wishlistId?: string;
  outOfStock?: boolean;
}

export interface SellerId {
  _id: string;
  sellerName: string;
  sellerMailId: string;
  sellerAddress: string;
  sellerState: string;
  sellerCountry: string;
  sellerContact: string;
  sellerAvailableLocations: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface AvailabilityStock {
  _id: string;
  productId: string;
  addedStockNos: number;
  discount: number;
  mrpPrice: number;
  isDeleted: boolean;
  onSale: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CartDetails {
  cartProduct: CartProduct[];
  totalPrice: string;
  totalDiscount: number;
  totalItems: number;
  discountAmount: string;
  totalPriceBeforeDiscount: string;
}

export interface CartProduct {
  quantity: number;
  _id: string;
  userId: string[];
  itemId: ItemId;
  addedToCart: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
  mrpPrice?: number;
  discount?: number;
  salePrice?: number;
  totalPrice?: string;
  sellerId?: string;
}

export interface ItemId {
  _id: string;
  sellerId: string;
  productName: string;
  productDesc: string;
  productImages: string[];
  isAvailableForSale: boolean;
  isDeleted: boolean;
  availabilityStocks: AvailabilityStock[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
