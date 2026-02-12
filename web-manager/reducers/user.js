import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  username: null,
  email: null,
  newVideoId: null,
  newVideoFilename: null,
  navExpandObject: {
    ManageDb: false,
    VolleyballAdmin: false,
    ScriptingAndVideo: false,
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      // console.log(`- dans Redux: loginUser 🔔`);
      state.token = action.payload.token;
      state.username = action.payload.user.username || "some_name";
      state.email = action.payload.user.email || "some_name@mail.com";
      // console.log(`- finished loginUser 🏁`);
    },
    setNewVideoId: (state, action) => {
      state.newVideoId = action.payload.newVideoId;
      state.newVideoFilename = action.payload.fileName;
    },
    logoutUser: (state) => {
      // console.log(`- dans Redux: logoutUser 🔔`);
      state.token = null;
      state.username = null;
      state.email = null;
      state.newVideoId = null;
      state.newVideoFilename = null;
      state.navExpandObject = {
        ManageDb: false,
        VolleyballAdmin: false,
        ScriptingAndVideo: false,
      };
    },
    toggleNavExpandItem: (state, action) => {
      const item = action.payload;
      state.navExpandObject[item] = !state.navExpandObject[item];
    },
  },
});

export const { loginUser, setNewVideoId, logoutUser, toggleNavExpandItem } =
  userSlice.actions;
export default userSlice.reducer;
