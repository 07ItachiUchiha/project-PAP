import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import adminSlice from './slices/adminSlice';
import adminCouponsSlice from './slices/adminCouponsSlice';
import wishlistSlice from './slices/wishlistSlice';
import returnSlice from './slices/returnSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    cart: cartSlice,
    orders: orderSlice,
    admin: adminSlice,
    adminCoupons: adminCouponsSlice,
    wishlist: wishlistSlice,
    returns: returnSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
