const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content: './content.ts',
    background: './background.ts',
    popup: './popup.ts',
    options: './options.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'popup.html', to: 'popup.html' },
        { from: 'options.html', to: 'options.html' },
        { from: 'public/*.png', to: 'icons/[name][ext]' },
      ],
    }),
  ],
  // Chrome Extension 环境配置
  target: 'web',
  // 不生成 source map（可选）
  devtool: false,
  // 优化配置
  optimization: {
    minimize: false, // Chrome Extension 审查时需要可读代码
  },
};
