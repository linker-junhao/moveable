// 引入插件
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = {
  chainWebpack: config => {
    config.devServer
      .port(8080)
      .open(true)
    try {
      config.plugins('AutoImport')
        .use(AutoImport, [{ resolvers: [ElementPlusResolver()] }])
      config.plugins('Components')
        .use(Components, [{ resolvers: [ElementPlusResolver()] }])
    } catch (e) {
      console.log(e)
    }
  }
}
