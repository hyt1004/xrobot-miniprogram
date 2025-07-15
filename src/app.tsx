import React, { useEffect } from 'react'
import * as sensors from './utils/sensors'
import './utils/polyfills'
import Layout from './components/Layout'

import './app.less'

const App: React.FC = ({ children }) => {
  // 神策埋点
  useEffect(() => { sensors.init() }, [])

  return <Layout>{children}</Layout>
}

export default App
