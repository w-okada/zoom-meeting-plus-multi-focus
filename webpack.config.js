/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
    mode: "development",
    // mode: "production",
    entry: path.resolve(__dirname, "src/index.tsx"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules")],
        extensions: [".ts", ".tsx", ".js"],
        fallback: {
            buffer: require.resolve("buffer/"),
            "path": false,
            "fs":false,
            "crypto": false,
        },
    },
    module: {
        rules: [
            { test: /resources\/.*\.json/, type: "asset/source" },
            { test: /resources\/.*\.mp3/, type: "asset/inline" },
            {
                test: [/\.ts$/, /\.tsx$/],
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                            plugins: ["@babel/plugin-transform-runtime"],
                        },
                    },
                ],
            },
            { test: /\.wasm$/, type: "asset/inline" },
            {
                test: /\.css$/,
                use: ["style-loader", { loader: "css-loader", options: { importLoaders: 1 } }, "postcss-loader"],
            },
            {
                test: /\.html$/,
                loader: "html-loader",
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public/index.html"),
            filename: "./index.html",
        }),
        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser",
        }),
        new CopyPlugin({
            patterns: [{ from: "models/*.onnx", to: "" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/tfjs", to: "models" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/youtu_reid", to: "models/youtu_reid" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/reid", to: "models/reid" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/cs", to: "models/cs" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/cs_512", to: "models/cs_512" }],
        }),
        new CopyPlugin({
            patterns: [{ from: "models/cs_256", to: "models/cs_256" }],
        }),


    ],
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:8888",
            },
        },
        static: {
            directory: path.join(__dirname, "dist"),
        },
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
        open: true,
        port: 3000,
        // host: "0.0.0.0",
        https: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
};
