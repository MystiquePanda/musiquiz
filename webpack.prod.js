const path = require("path");
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const config = merge(common, {
    mode: "production",
    output: {
        path: path.resolve("public", "bundles"),
        filename: "[name].[contentHash].js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    optimization: {
        minimizer: [new OptimizeCssAssetsWebpackPlugin(), new TerserPlugin()],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].[contentHash].css",
            chunkFilename: "[id].[contentHash].css",
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
          template: '!!raw-loader!' + path.join(__dirname, 'views/template.ejs'),
          filename: '../views/index.ejs' ,
          minify: {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true
          }
        })
    ],
});

module.exports = config;
