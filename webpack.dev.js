const path = require("path");
const common = require("./webpack.common");
const {merge} = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = merge(common, {
    mode: "development",
    output: {
        path: path.resolve("public", "bundles"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: '!!raw-loader!' + path.join(__dirname, 'views/template.ejs'),
        filename: '../views/index.ejs' 
      })
    ],
});

module.exports = config;
