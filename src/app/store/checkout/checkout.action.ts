import { createAction, props } from '@ngrx/store';
import { IOrder } from '../../utils/orders';

const getCheckoutItems = createAction('[Checkout Component] GetUserCart');

const addCheckoutItems = createAction(
  '[Checkout Component] AddCheckoutItems',
  props<{ order: IOrder }>()
);

export const CheckoutActions = {
  getCheckoutItems,
  addCheckoutItems,
};
