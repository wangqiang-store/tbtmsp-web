import Cookies from 'js-cookie'
const app:any = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    device: 'desktop'
  },
  mutations: {
    TOGGLE_SIDEBAR: (state:any )=> {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state:any , withoutAnimation:any ) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state:any, device:any) => {
      state.device = device
    }
  },
  actions: {
    ToggleSideBar: ({ commit }:any) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }:any, { withoutAnimation }:any) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }:any, device:any) {
      commit('TOGGLE_DEVICE', device)
    }
  }
}

export default app
