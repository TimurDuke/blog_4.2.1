import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    errorMessage: null,
};

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError: (state, action) => {
            state.errorMessage = action.payload;
        },
        clearError: (state) => {
            state.errorMessage = null;
        },
    },
});

export default errorSlice