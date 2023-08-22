let data: any = {
  state: {
    // 绑定状态
    BindingState: "",
    // 角色
    roleList: [],
    // 主机列表
    hostList: [],
    // 电房列表
    electricRoomList: [],
    // 短信数据
    SMSData: {},
    // 短信通知列表
    notifyList: [],
    // 当前用户短信通知列表
    userNotifyList: [],
    // 首页点击电房数据
    electricRoomData: {},
    // 首页点击母线槽数据
    buswaryInfo: [],
    // 节点大小
    nodeSize: 35,
    // websocket
    SOCKET: null,
    // 商场区域
    UnitNameList: [],
    // 全局定时器 刷新Token
    tokenTimer: null,
    // 保存报警数据  弹框
    warningList: [],
    // 保存首页marking 数据
    warkingList: [],
    // 首页socket
    homeSocket: null,
    // 实时socket
    realtimeSocket: null,
    // 用于判断导航栏是否点击首页
    isGoMain:false
  },
  mutations: {
    // 修改首页的componentName
    setisGoMain: (state: any, data: string) => {
      state.isGoMain = data;
    },
    // 修改绑定状态
    setBindingState: (state: any, data: string) => {
      state.BindingState = data;
    },
    // 修改主机列表
    setHostList: (state: any, data: any[]) => {
      state.hostList = data;
    },
    // 修改角色列表
    setRoleList: (state: any, data: any[]) => {
      state.roleList = data;
    },
    // 修改电房列表
    setElectricRoomList: (state: any, data: Array<any>) => {
      state.electricRoomList = data;
    },
    // 修改短信数据
    setSMSData: (state: any, data: object) => {
      state.SMSData = data;
    },
    // 修改短信通知列表
    setNotifyList: (state: any, data: Array<any>) => {
      state.notifyList = data;
    },
    // 修改母线槽
    setElectricRoomData: (state: any, data: object) => {
      state.electricRoomData = data;
    },
    // 修改节点
    setBuswaryInfo: (state: any, data: Array<any>) => {
      state.buswaryInfo = data;
    },
    // 修改节点大小
    setNodeSize: (state: any, data: number) => {
      state.nodeSize = data;
    },
    // 修改wensocket
    SET_SOCKET: (state: any, data: WebSocket) => {
      state.SOCKET = data;
    },
    // 修改商场区域
    SET_UnitNameList: (state: any, data: Array<any>) => {
      state.UnitNameList = data;
    },
    // 修改全局定时器
    setTokenTimer: (state: any, data: number | null) => {
      state.tokenTimer = data;
    },
    // 修改报警数据
    setWarningList: (state: any, data: Array<any>) => {
      state.warningList = data;
    },
    // 修改首页标识数据
    setWarkingList: (state: any, data: Array<any>) => {
      state.warkingList = data;
    },
    setHomeSocket: (state: any, data: any) => {
      state.homeSocket = data;
    },
    setRealtimeSocket: (state: any, data: any) => {
      state.realtimeSocket = data;
    },
  },
};

export default data;
