const target = 'http://132.226.238.127:7007';

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  lintOnSave : false,
  devServer: { 
    proxy: { 
      '/session': { 
        target: 'http://132.226.238.127:3000/session',
        changeOrigin: true, 
        pathRewrite: { 
          '^/session': ''
        } 
      } 
    } 
  },
})
