var fb = require('fuse-box')
var FuseBox = fb.FuseBox

var fuse = FuseBox.init({
  homeDir: "src",
  outFile: "bundle.js",
  cache : true,
  plugins: [
    fb.CSSPlugin(),
    fb.HTMLPlugin({ useDefault: true }),
    fb.BabelPlugin({
      test: /\.js$/, // test is optional
      config: {
        sourceMaps: true,
        presets: ["es2015-loose", "stage-1"],
        plugins: [
          "syntax-flow",
          "transform-decorators-legacy",
          "transform-flow-strip-types",
          "syntax-async-functions",
          "transform-async-to-generator"
        ]
      }
    })
  ]
})

fuse.devServer("> main.js + **/*.js + **/*.html + aurelia-framework + aurelia-logging-console + aurelia-templating-binding + aurelia-templating-resources + aurelia-event-aggregator + aurelia-history-browser + aurelia-templating-router + babel-polyfill")