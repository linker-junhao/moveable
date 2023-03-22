// 引入插件
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  // configureWebpack为vue.config.js里的webpack配置
  configureWebpack: {
    devServer: {
      port: 8888,
      open: true
    },
    // plugins配置里加下面的代码
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
}