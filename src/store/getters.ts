const getters = {
  sidebar: (state:any) => state.app.sidebar,
  device: (state:any) => state.app.device,
  token: (state:any) => state.user.token,
  avatar: (state:any) => state.user.avatar,
  name: (state:any) => state.user.name,
  username: (state:any) => state.user.username,
  roles: (state: any) => state.user.roles,
  roleId: (state: any) => state.user.roleId,
  userId: (state: any) => state.user.userId,
  deptId: (state: any) => state.user.deptId,
  routers:(state:any)=>state.user.routers
};
export default getters;
