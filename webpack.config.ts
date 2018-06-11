import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import {resolve} from "path";
import {Configuration, DefinePlugin} from "webpack";

const config: Configuration = {
    entry: {
        background: resolve(__dirname, "app/background.ts"),
        carousel: resolve(__dirname, "app/carousel/initialize.ts"),
        inject: resolve(__dirname, "app/inject.ts"),
        options: resolve(__dirname, "app/options/options.ts"),
    },
    module: {
        rules: [{
            loader: "ts-loader",
            test: /\.ts$/,
        }]
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
        new HtmlWebpackPlugin({
            inject: false,
            chunks: ["carousel"],
            filename: "carousel.html",
            template: resolve(__dirname, "app/carousel/carousel.ejs"),
        }),
        new HtmlWebpackPlugin({
            inject: false,
            chunks: ["options"],
            filename: "options.html",
            template: resolve(__dirname, "app/options/options.ejs"),
        })
    ],
    resolve: {
        extensions: [".ts"]
    },
};

export default config;
