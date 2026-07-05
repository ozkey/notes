import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

export default {
  entry: './src/index.tsx',
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            // Import CSS as raw string when using ?raw query
            resourceQuery: /raw/,
            use: 'raw-loader',
          },
          {
            // Normal CSS imports (injected into DOM)
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/public', to: 'public' },
      ],
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
    setupExitSignals: true,
    onListening(devServer) {
      const port = devServer.server.address().port;
      const url = `http://localhost:${port}`;
      console.log(`\n📱 App is running at: ${url}\n`);
    },
  },
};

