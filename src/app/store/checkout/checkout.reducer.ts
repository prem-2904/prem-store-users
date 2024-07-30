import { createReducer } from '@ngrx/store';
import { IOrder } from '../../utils/orders';

export interface CheckoutState {
  order: IOrder[];
}

export const initialCheckoutState: CheckoutState = {
  order: [],
};

export const CheckoutReducer = createReducer(initialCheckoutState);
