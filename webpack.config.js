const path = require('path');

module.exports = {
    entry: './src/scripts/main.js',
    mode: process.env.NODE_ENV || 'development',
    watch: process.env.NODE_ENV !== 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scripts/main.js'
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 3000
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
    devtool: 'source-map'
};
