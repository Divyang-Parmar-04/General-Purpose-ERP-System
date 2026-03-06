import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { fetchCurrentUserAPI } from "./utils/auth/auth.util";
import { loginSuccess, logout, setIsModuleChange } from "./store/slices/auth.slice";

function App() {


  const { mode } = useSelector((state) => state.theme);
  const { isModuleChange } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isUserLogin = localStorage.getItem('isUserLogin')

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {


    const autoLogin = async () => {
      const data = await fetchCurrentUserAPI();


      if (data?.user) {

        dispatch(
          loginSuccess({
            user: data.user,
            role: data?.user?.role?.name,
          })
        );


      } else {

        dispatch(logout());
        navigate("/")
      }
    };

    if (isUserLogin == "true") autoLogin();

  }, [dispatch, isModuleChange]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </>
  )
}

export default App