// vue.config.js
const path = require("path");
const resolve = (dir) => path.join(__dirname, dir);
module.exports = {
  // 基本路径
  publicPath: "/",
  // 输出文件目录
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: false,
  runtimeCompiler: false,
  productionSourceMap: false,
  pages: {
    index: {
      entry: "src/main.ts",
      template: "public/index.html",
      title: "电力母线智能测控预警系统",
    },
  },
  chainWebpack: (config) => {
    config.resolve.symlinks(true); // 修复热更新失效
    config.resolve.alias // 添加别名
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@components", resolve("src/components"))
      .set("@views", resolve("src/views"))
      .set("@store", resolve("src/store"));
  },
  configureWebpack: {
    resolve: {
      extensions: [".js", ".json", ".vue", ".ts"],
    },
  },
  css: {
    extract: false,
    sourceMap: false,
    loaderOptions: {
      sass: {
        additionalData: `@import "@/styles/_variable.scss";`,
      },
    },
    requireModuleExtension: true,
  },
  parallel: require("os").cpus().length > 1,
  pwa: {
    iconPaths: {
      favicon32: "favicon.ico",
      favicon16: "favicon.ico",
      appleTouchIcon: "favicon.ico",
      maskIcon: "favicon.ico",
      msTileImage: "favicon.ico",
    },
  },
  devServer: {
    open: true,
    // host: '0.0.0.0',
    port: 9595,
    https: false,
    hotOnly: true,
    // historyApiFallback: true,
    proxy: {
      // 设置代理
      // "/websocket": {
      //   target: "ws://192.168.0.43:7105/websocket", //后端 剑虎
      //   // target: 'http://192.168.0.101:7101',//本地
      //   // target: 'http://8.129.91.146:9526',//测试
      //   // target: "ws://47.112.167.239:7105", //开发
      //   // target: "http://192.168.0.211:7105/websocket", //后端 茂哥
      //   changeOrigin: true,
      //   pathRewrite: {
      //     "^/websocket": "/",
      //   },
      //   ws: true,
      // },
      "/netty2WebSocket": {
        target: "ws://192.168.0.62:7105/netty2WebSocket", //后端 剑虎
        // target: 'http://192.168.0.101:7101',//本地
        // target: "ws://8.129.91.146:9521/netty2WebSocket", //测试
        // target: "ws://47.112.167.239:7105/netty2WebSocket", //开发
        // target: "http://192.168.0.211:7105/netty2WebSocket", //后端 茂哥
        changeOrigin: true,
        pathRewrite: {
          "^/netty2WebSocket": "/",
        },
        ws: true,
      },
      "/homeWebSocket": {
        target: "ws://192.168.0.62:7105/homeWebSocket", //后端 剑虎
        // target: 'http://192.168.0.101:7101',//本地
        // target: "ws://8.129.91.146:9521/homeWebSocket", //测试
        // target: "ws://47.112.167.239:7105/homeWebSocket", //开发
        // target: "http://192.168.0.211:7105/homeWebSocket", //后端 茂哥
        changeOrigin: true,
        pathRewrite: {
          "^/homeWebSocket": "/",
        },
        ws: true,
      },
      "/socket": {
        // target: "ws://192.168.0.62:7104/socket", //后端 剑虎
        // target: 'http://192.168.0.101:7101',//本地
        target: "ws://8.129.91.146:9523/socket", //测试
        // target: "ws://47.112.167.239:7105/socket", //开发
        // target: "ws://192.168.0.211:7105/socket", //后端 茂哥
        changeOrigin: true,
        pathRewrite: {
          "^/socket": "",
        },
        ws: true,
      },
      "/": {
        // target: "http://192.168.0.62:7105", //后端
        // target: 'http://192.168.0.101:7105',//本地
        target: "http://8.129.91.146:8040/", //测试
        // target: "http://47.112.167.239:8041", //开发
        // target: "http://192.168.0.211:7105", //后端 茂哥
        changeOrigin: true,
        pathRewrite: {
          "^/": "/",
        },
        ws: false,
      },
    },
    before: (app) => {},
  },
  // 第三方插件配置
  pluginOptions: {
    // ...
  },
};
