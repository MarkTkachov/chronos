import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import refreshOnDemand from "../helpers/refreshOnDemand";
import { IAuthState, ISignInData, ISignInResult } from "../types/auth";
import chronosApi from "./chronosAPI";




const initialState: IAuthState = {
    user: null,
    error: null,
    status: null,
    silentLoginStatus: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthSliceData: (state, action) => {
            state.user = action.payload?.user === undefined ? state.user : action.payload?.user;
            state.status = action.payload?.status === undefined ? state.status : action.payload?.status;
            state.error = action.payload?.error === undefined ? state.error : action.payload?.error;
            state.silentLoginStatus = action.payload?.silentLoginStatus === undefined ? state.silentLoginStatus : action.payload?.silentLoginStatus;
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLoginAction.pending, (state) => {
                state.error = null;
                state.status = 'loading';
                state.user = null;
            })
            .addCase(fetchLoginAction.fulfilled, (state, action) => {
                state.error = null;
                state.status = 'fulfilled';
                state.silentLoginStatus = 'fulfilled';
                state.user = action.payload;
            })
            .addCase(fetchLoginAction.rejected, (state, action) => {
                state.error = action.error;
                state.status = 'rejected';
                state.user = null;
            })
            .addCase(fetchLogoutAction.pending, (state) => {
                state.error = null;
                state.status = 'loading';
            })
            .addCase(fetchLogoutAction.fulfilled, (state, action) => {
                state.user = null;
                state.status = null;
                state.error = null;
                state.silentLoginStatus = null;
            })
            .addCase(fetchLogoutAction.rejected, (state, action) => {
                // state.error = action.error;
                state.status = 'rejected';
                state.user = null;
            })
    }

})

export const fetchLoginAction = createAsyncThunk("auth/login",
    async (payload: ISignInData, thunkAPI) => {
        const resp = await axios.post('/auth/login', payload);
        const data: ISignInResult = resp.data;
        thunkAPI.dispatch(chronosApi.util.invalidateTags(['userInfo']));
        return data.data;
    }
)

export const fetchLogoutAction = createAsyncThunk("auth/logout",
    async (payload: undefined, thunkAPI) => {
        const resp = await refreshOnDemand(() => axios.post('/auth/logout'));
        thunkAPI.dispatch(chronosApi.util.invalidateTags(['userInfo']));
        return resp.data;
    }
)

export default authSlice.reducer;

export const { setAuthSliceData } = authSlice.actions;
