const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const path = require("path");

function resolve(name) {
  return path.resolve(__dirname, name);
}

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    path: resolve("dist"),
    filename: "[name].[contenthash].js",
    environment: {
      arrowFunction: false,
    },
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    ie: "11",
                    browsers: "last 2 versions, > 5%, safari tp",
                  },
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
    ],
  },

  resolve: {
    extensions: [".js", ".json", ".vue"],
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "vue table",
      template: "index.html",
    }),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
  ],

  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  //   runtimeChunk: {
  //     name: "runtime",
  //   },
  //   splitChunks: {
  //     chunks: "all",
  //   },
  // },

  devServer: {
    port: 8080,
    open: true,
  },
};
