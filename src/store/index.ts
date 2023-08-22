import { createStore } from "vuex";
import user from "./modules/user";
import app from "./modules/app";
import data from "./modules/data";
import getters from "./getters";

export default createStore({
  state: {
    configInfo: {},
  },
  mutations: {
    setConfiginfo(state, data) {
      state.configInfo = data;
    },
  },
  actions: {},
  getters,
  modules: {
    user,
    app,
    data,
  },
});
