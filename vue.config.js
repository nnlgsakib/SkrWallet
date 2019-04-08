const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");


module.exports = {
    publicPath: './',
    devServer: {
        port: 3000,
        compress: true
    },

    productionSourceMap: false,
    css: {
        extract: true,
        sourceMap: false,
        loaderOptions: {
            css: {},
            postcss: {}
        },
        modules: false
    },


    configureWebpack: {

        mode: 'production',
        externals: {
            Vue: "Vue",
            Vuex: "Vuex",
            VueRouter: "VueRouter",
            Vuetify: "Vuetify",
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            warnings: false,
                            drop_debugger: true,
                            drop_console: true
                        },
                    }
                })
            ],
        },

        module: {
            rules:[

            ]
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                Web3: "web3",
                axios: "axios",
            }),

            new CompressionPlugin(),


            new CleanWebpackPlugin({
                dry: false
            }),

        ]

    }
};