import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import themeReducer from "./slices/theme.slice";
import notificationReducer from "./slices/notification.slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    notifications: notificationReducer,
  },
});

export default store;
