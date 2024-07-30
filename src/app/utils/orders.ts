export interface IOrder {
  totalAmount: string;
  typeOfPayment: string;
  paymentOrderId: string;
  paymentTransactionId: string;
  orderFullName: string;
  orderAddressLine1: string;
  orderAddressLine2: string;
  orderAddressPincode: string;
  orderEmail: string;
  orderPhone: string;
  orderStatus: string;
  orderItems: OrderItem[];
  orderAmountPaid: string;
  orderedBy: string;
}

export interface OrderItem {
  orderItem: string;
  orderedQuantity: number;
  orderItemPrice: number;
  orderTotal: number;
  orderStatus: string;
  itemStockId: string;
  cartId: string;
}

export interface ICartDetails {
  orderItems: OrderItem[];
  totalPrice: number;
  totalItems: number;
  totalDiscount: number;
  discountAmount: number;
}

export interface IPaymentOrder {
  amount: number;
  currency: string;
  receipt: string;
  notes: Notes;
}

export interface ITransactionOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: any;
  status: string;
  attempts: number;
  notes: Notes;
  created_at: number;
}

export interface Notes {
  notes_key_1: string;
  notes_key_2: string;
}

// export type Root = Root2[]
export interface OrderDetails {
  _id: string;
  totalAmount: string;
  typeOfPayment: string;
  paymentOrderId: string;
  paymentTransactionId: string;
  orderFullName: string;
  orderAddressLine1: string;
  orderAddressLine2: string;
  orderAddressPincode: number;
  orderEmail: string;
  orderPhone: string;
  orderStatus: string;
  orderItems: string[][];
  orderHistory: string[][];
  orderedBy: OrderedBy[];
  orderAmountPaid: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface OrderedBy {
  _id: string;
  fullName: string;
  email: string;
  accountMode: string;
  profilePicture: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}
