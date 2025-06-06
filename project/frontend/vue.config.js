const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        assert: require.resolve('assert/'),
        path: require.resolve('path-browserify'),
        fs: false,
        module: false,
        worker_threads: false,
      },
    },
  },
  devServer: {
    allowedHosts: 'all',
    https: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
      },
    },
  },
});