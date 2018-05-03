const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const moment = require('moment');

module.exports = {
    entry: './src/scripts/main.js',
    mode: process.env.NODE_ENV || 'development',
    watch: process.env.NODE_ENV !== 'production',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'common',
                    chunks: 'all'
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(glsl|frag|vert)$/,
                use: ['raw-loader', 'glslify-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            },
        ]
    },
    stats: {
        colors: true
    },
    output: {
        filename: 'scripts/[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/template/index.html',
            hash: true,
        }),
        new webpack.DefinePlugin({
            'process.env' : {
                VERSION: JSON.stringify(`${require('./package.json').name}\nVersion: ${require('./package.json').version}\nBuild: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`),
            }
        })
    ],
    devtool: 'source-map'
};
