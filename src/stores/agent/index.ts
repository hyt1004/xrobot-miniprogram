import { getStorageSync, setStorageSync, removeStorageSync } from 'remax/wechat';

interface UserInfo {
  superAdmin?: number;
  [key: string]: any;
}
interface PubConfig {
  version: string;
  beianIcpNum: string;
  beianGaNum: string;
  allowUserRegister: boolean;
}
interface State {
  token: string;
  userInfo: UserInfo;
  isSuperAdmin: boolean;
  pubConfig: PubConfig;
}

const state: State = {
  token: getStorageSync('agent-mp-token') || '',
  userInfo: {},
  isSuperAdmin: getStorageSync('agent-mp-isSuperAdmin') === 'true',
  pubConfig: {
    version: '',
    beianIcpNum: 'null',
    beianGaNum: 'null',
    allowUserRegister: false,
  },
};

const store = {
  getToken() {
    if (!state.token) {
      state.token = getStorageSync('agent-mp-token') || '';
    }
    return state.token;
  },
  getUserInfo() {
    return state.userInfo;
  },
  getIsSuperAdmin() {
    const val = getStorageSync('agent-mp-isSuperAdmin');
    if (val === undefined || val === null) {
      return state.isSuperAdmin;
    }
    return val === 'true';
  },
  getPubConfig() {
    return state.pubConfig;
  },
  setToken(token: string) {
    state.token = token;
    setStorageSync('agent-mp-token', token);
  },
  setUserInfo(userInfo: UserInfo) {
    state.userInfo = userInfo;
    const isSuperAdmin = userInfo.superAdmin === 1;
    state.isSuperAdmin = isSuperAdmin;
    setStorageSync('agent-mp-isSuperAdmin', String(isSuperAdmin));
  },
  setPubConfig(config: PubConfig) {
    state.pubConfig = config;
  },
  clearAuth() {
    state.token = '';
    state.userInfo = {};
    state.isSuperAdmin = false;
    removeStorageSync('agent-mp-token');
    removeStorageSync('agent-mp-isSuperAdmin');
  }
};

export default store;