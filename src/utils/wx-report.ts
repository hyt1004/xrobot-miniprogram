/** @description 微信 we 分析上报自定义事件 */

export enum TapTarget {
  /* 点击-生成 AI 数字人视频 */
  HomeToVideoEditorBtn = 'HomeToVideoEditorBtn',
  /* 点击-我的视频分身 */
  HomeToMyVideosBtn = 'HomeToMyVideosBtn',
  /* 点击-云产品卡片 */
  HomeCloudLandingCard = 'HomeCloudLandingCard',
  /* 点击-一键登录 */
  LoginBtn = 'LoginBtn',
  /* 点击-我的-注册/登录 */
  MineLoginOrRegister = 'MineLoginOrRegister',
  /* 点击-上传或拍摄新视频 */
  VideoUploadArea = 'VideoUploadArea',
  /* 点击-生成视频 */
  GenerateVideoBtn = 'GenerateVideoBtn',
  /* 点击-推荐视频卡片（任意） */
  HomeVideoCard = 'HomeVideoCard',
  /* 点击-播放页领红包 */
  GetRedPackBtn = 'GetRedPackBtn',
  /* 点击-播放页发视频 */
  PlayerToEditorBtn = 'PlayerToEditorBtn',
  /* 点击-（从视频广场打开的）播放页->微信icon */
  ShareVideoBtnFromPublic = 'ShareVideoBtnFromPublic',
  /* 点击-（从我的视频打开的）播放页->微信icon */
  ShareVideoBtnFromMine = 'ShareVideoBtnFromMine',
  /* 点击-（从别人分享的链接打开的）播放页->微信icon */
  ShareVideoBtnFromShare = 'ShareVideoBtnFromShare',
  /* 点击-（从视频广场打开的）播放页->朋友圈icon */
  ShareVideoToTimelineBtnFromPublic = 'ShareVideoToTimelineBtnFromPublic',
  /* 点击-（从我的视频打开的）播放页->朋友圈icon */
  ShareVideoToTimelineBtnFromMine = 'ShareVideoToTimelineBtnFromMine',
  /* 点击-（从视频广场打开的）播放页->朋友圈icon */
  ShareVideoToTimelineBtnFromShare = 'ShareVideoToTimelineBtnFromShare',
  /* 点击-获得喜马拉雅体验卡 */
  ConfirmGetXmlyBtn = 'ConfirmGetXmlyBtn',
  /* 点击-获得红包->收下啦 */
  ConfirmGetRedPackBtn = 'ConfirmGetRedPackBtn',
  /* 点击-获得红包->知道了 */
  ConfirmNotGetRedPackBtn = 'ConfirmNotGetRedPackBtn',
  /* 点击-获得红包->生成 AI 数字人视频 */
  RedPackToVideoEditorBtn = 'RedPackToVideoEditorBtn',
  /* 点击-获得红包->回到视频广场 */
  RedPackToHomeBtn = 'RedPackToHomeBtn',
  /* 点击-红包到账->生成 AI 数字人视频 */
  RedPackReceivedToVideoEditorBtn = 'RedPackReceivedToVideoEditorBtn',
  /* 点击-红包到账->云产品 */
  RedPackReceivedToCloudLandingBtn = 'RedPackReceivedToCloudLandingBtn'
}

export function reportTap(target: TapTarget) {
  wx.reportEvent('generic_click_event', { target })
}

export function reportSignup() {
  wx.reportEvent('signup')
}

export function reportLogin() {
  wx.reportEvent('login')
}
