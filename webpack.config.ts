import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import { resolve } from "path";
import { Configuration, DefinePlugin } from "webpack";

function polyfill(asset) {
    return (process.env.BROWSER === "chrome") ?
        ["webextension-polyfill/dist/browser-polyfill.js", asset] :
        [asset];
}

const config: Configuration = {
    entry: {
        background: polyfill(resolve(__dirname, "app/background.ts")),
        carousel: resolve(__dirname, "app/carousel/initialize.ts"),
        inject: polyfill(resolve(__dirname, "app/inject.ts")),
        options: polyfill(resolve(__dirname, "app/options/options.ts")),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: { minimize: true }
                    }
                ]
            }
        ]
    },
    output: {
        filename: "[name].js",
        path: resolve(`dist/${process.env.BROWSER}`),
    },
    plugins: [
        new DefinePlugin({
            "process.env.BROWSER": JSON.stringify(process.env.BROWSER),
        }),
        new CleanWebpackPlugin([
            resolve(`dist/${process.env.BROWSER}`),
        ]),
        new MiniCssExtractPlugin({
            chunkFilename: "[id].css",
            filename: "[name].css",
        }),
        new HtmlWebpackPlugin({
            chunks: ["carousel"],
            filename: "carousel.html",
            inject: false,
            template: resolve(__dirname, "app/carousel/carousel.ejs"),
        }),
        new HtmlWebpackPlugin({
            chunks: ["options"],
            filename: "options.html",
            inject: false,
            template: resolve(__dirname, "app/options/options.ejs"),
        })
    ],
    resolve: {
        extensions: [".ts"]
    },
};

export default config;
