import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AppLayout from '../pages/layout/AppLayout'

const ProtectedRoute = ({ allowedRoles }) => {

  const { isAuthenticated, role, loading , user } = useSelector(
    (state) => state.auth
  );
  

  const isUserLogin = localStorage.getItem('isUserLogin')


  if (isUserLogin == "false") {
    return <Navigate to="/auth" replace />
  }
  
  // WAIT until auth state is resolved
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Checking authentication...</p>
      </div>
    );
  }

  //  Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles != role ) {
    return <Navigate to="/unauthorized" replace />;
  }

  //  Authenticated & authorized
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  )
};

export default ProtectedRoute;
