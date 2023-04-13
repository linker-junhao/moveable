// 引入插件
const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const IconsResolver  = require('unplugin-icons/resolver')
const Icons  = require('unplugin-icons/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = ({
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep']
          })
        ],
      }),
      Icons({
        autoInstall: true,
      }),
    ]
  }
})
