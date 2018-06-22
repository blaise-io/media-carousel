import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import { resolve } from "path";
import * as webpack from "webpack";
import * as ZipPlugin from "zip-webpack-plugin";

function polyfill(asset) {
    return (process.env.BROWSER === "chrome") ?
        ["webextension-polyfill/dist/browser-polyfill.js", asset] :
        [asset];
}

const config: webpack.Configuration = {
    entry: {
        manifest: resolve(__dirname, "app/manifest/index.js"),
        carousel: resolve(__dirname, "app/carousel/initialize.ts"),
        background: polyfill(resolve(__dirname, "app/background.ts")),
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
            },
            {
                test: /index\.js$/,
                use: ExtractTextPlugin.extract({
                    use: []
                })
            },
            {
                test: /\.(png|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            context: resolve(__dirname, "app"),
                            name: "[path][name].[ext]",
                            outputPath: "",
                            publicPath: "/",
                        }
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
        new CleanWebpackPlugin([
            resolve(`dist/${process.env.BROWSER}`),
        ], { verbose: false }),
        new webpack.EnvironmentPlugin([
            "BROWSER",
            "npm_package_name",
            "npm_package_version",
            "npm_package_description",
            "npm_package_homepage",
        ]),
        new ExtractTextPlugin("manifest.json"),
        new MiniCssExtractPlugin({
            chunkFilename: "[id].css",
            filename: "[name].css",
        }),
        new HtmlWebpackPlugin({
            chunks: ["carousel"],
            filename: "carousel.html",
            template: resolve(__dirname, "app/carousel/carousel.ejs"),
        }),
        new HtmlWebpackPlugin({
            chunks: ["options"],
            filename: "options.html",
            template: resolve(__dirname, "app/options/options.ejs"),
        }),
        new ZipPlugin({
            filename: [
                process.env.npm_package_name,
                process.env.npm_package_version,
                process.env.BROWSER,
            ].join("-") + ".zip"
        }),
    ],
    resolve: {
        extensions: [".ts", ".svg", ".png"]
    },
};

export default config;
