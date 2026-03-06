import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications = [action.payload, ...state.notifications].slice(0, 20);
            state.unreadCount += 1;
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        incrementUnreadCount: (state) => {
            state.unreadCount += 1;
        },
        markRead: (state, action) => {
            const id = action.payload;
            if (id === "all") {
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            } else {
                const notification = state.notifications.find(n => n._id === id);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const {
    setNotifications,
    addNotification,
    setUnreadCount,
    incrementUnreadCount,
    markRead,
    setLoading
} = notificationSlice.actions;

export default notificationSlice.reducer;
