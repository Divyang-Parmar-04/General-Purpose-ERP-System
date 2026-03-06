import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { BellIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addNotification } from '../store/slices/notification.slice';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {

    const [socket, setSocket] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {

        const userId = user?.id || user?._id;

        if (user && userId) {
            const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on("connect", () => {
                newSocket.emit("register", userId);
            });


            newSocket.on("notification", (data) => {
                dispatch(addNotification(data));
                toast(`New Notification`,{icon:<BellIcon className="w-5 h-5" />},{duration:5000})
            });

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user?.id, user?._id, dispatch]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
