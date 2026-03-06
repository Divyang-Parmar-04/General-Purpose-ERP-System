
import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopNavbar from "../../components/layout/TopNavbar";
import { useSelector } from "react-redux";
import { Toaster } from 'react-hot-toast'

const AppLayout = ({ children }) => {

  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const user = useSelector((state) => state.auth.user)
   

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* <Toaster /> */}
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
        {/* Mobile Overlay */}
        {!collapsed && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setCollapsed(true)}
          />
        )}

        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} user={user} />

        <div className="flex flex-col flex-1">
          <TopNavbar
            collapsed={collapsed}
            user={user}
            setCollapsed={setCollapsed}
          />

          <main className="flex-1 p-5 sm:p-6 overflow-y-auto dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </>

  );
};

export default AppLayout;
