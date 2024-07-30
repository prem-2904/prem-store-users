import { PrimeIcons } from 'primeng/api';

export interface IOrderedDetail {
  orderData: IOrderDetails;
  orderedItem: IOrderItems;
  orderHistory: IOrderHistory[];
  updatedOrderStatus: UpdatedOrderStatus[];
}

export interface IOrderDetails {
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
  orderItems: IOrderItems;
  orderHistory: IOrderHistory[];
  orderedBy: IOrderedBy;
  orderAmountPaid: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
}

export interface IOrderItems {
  _id: string;
  orderId: string;
  orderItem: IOrderItem;
  orderStockId: string;
  orderedQuantity: number;
  orderItemPrice: string;
  orderTotal: string;
  orderStatus: IOrderStatus;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;

  //orderItemDetails
  orderedproductId: string;
  orderedproductName: string;
  orderedproductDesc: string;
  orderedproductImages: string[];
}

export interface IOrderItem {
  _id: string;
  productName: string;
  productDesc: string;
  productImages: string[];
}

export interface IOrderStatus {
  _id: string;
  statusText: string;
  statusComments: string;
  statusOrder?: number;
}

export interface IOrderHistory {
  _id: string;
  orderStatus: IOrderStatus;
  statusText: string;
  statusComments: string;
  createdAt: string;
}

export interface IOrderedBy {
  _id: string;
  fullName: string;
  email: string;
  profilePicture: string;
  id: string;
}

export interface UpdatedOrderStatus {
  status: IOrderStatus;
  isCompletedStatus: boolean;
  history?: IHistory;
}

export interface IHistory {
  _id: string;
  orderStatus: IOrderStatus;
  statusUpdatePlace: string;
  statusOrder: number;
  createdAt: string;
}

export interface IFinalStatusHistory {
  status: string;
  date: string;
  statusUpdate: string;
  isCompleted: boolean;
  icon: boolean;
}

export const convertOrderItemsDetails = (orderItem: IOrderItems) => {
  orderItem.orderedproductId = orderItem.orderItem._id;
  orderItem.orderedproductName = orderItem.orderItem.productName;
  orderItem.orderedproductDesc = orderItem.orderItem.productDesc;
  orderItem.orderedproductImages = orderItem.orderItem.productImages;
  return orderItem;
};

export const convertOrderHistory = (orderHistory: UpdatedOrderStatus[]) => {
  const orderHistoryStatus = orderHistory.map((status: UpdatedOrderStatus) => {
    return {
      status: status.status.statusText,
      date: status.history?.createdAt,
      statusUpdate: status.history?.statusUpdatePlace,
      isCompleted: status.isCompletedStatus,
      icon: status.isCompletedStatus ? PrimeIcons.CHECK : PrimeIcons.SPINNER,
      color: status.isCompletedStatus ? '#1f9c3a' : '#607D8B',
    };
  });
  console.log('updated-order-history', orderHistoryStatus);
  return orderHistoryStatus;
};
