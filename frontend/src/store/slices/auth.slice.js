import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading:true,
  isModuleChange:false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.loading=false
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      localStorage.setItem('isUserLogin', "false")
      localStorage.removeItem('token')
      state.isAuthenticated = false;
    },
    setIsModuleChange:(state)=>{
      state.isModuleChange= !state.isModuleChange
    }
  },
});

export const { loginSuccess, logout, setIsModuleChange} = authSlice.actions;
export default authSlice.reducer;
