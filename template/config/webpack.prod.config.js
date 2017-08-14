const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const project = require('./project');

const GLOBALS = {
    'process.env': {
        'NODE_ENV': JSON.stringify('production')
    },
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
};

module.exports = {
  target: 'electron-renderer',
  entry: {
    index: path.resolve(project.path.src, 'index.js')
  },
  output: {
    path: project.path.output,
    publicPath: './',
    filename: '[name].js',
    // Export our plugin as a UMD library (compatible with all module definitions - CommonJS, AMD and global variable)
    library: '{{pascalcase name}}Plugin',
    libraryTarget: 'umd'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', 'less'],
    alias: {
      actions: path.join(project.path.src, 'actions'),
      components: path.join(project.path.src, 'components'),
      fonts: path.join(project.path.src, 'assets/fonts'),
      images: path.join(project.path.src, 'assets/images'),
      less: path.join(project.path.src, 'assets/less'),
      plugin: path.join(project.path.src, 'index.js'),
      stores: path.join(project.path.src, 'stores')
    }
  },
  module: {
    rules: [
      // TODO: Extract to external CSS file when compass is configured to pull in plugin css files as well
      // {
      //   test: /\.css$/,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: 'css-loader'
      //   })
      // },
      // {
      //   test: /\.less$/,
      //   exclude: /node_modules/,
      //   use: ExtractTextPlugin.extract({
      //     fallback: 'style-loader',
      //     use: [
      //       {
      //         loader: 'css-loader',
      //         options: {
      //           modules: true,
      //           importLoaders: 1,
      //           localIdentName: '[hash:base64:5]'
      //         }
      //       },
      //       {
      //         loader: 'postcss-loader',
      //         options: {
      //           plugins: function () {
      //             return [
      //               project.plugin.autoprefixer
      //             ];
      //           }
      //         }
      //       },
      //       {
      //         loader: 'less-loader',
      //         options: {
      //           noIeCompat: true
      //         }
      //       }
      //     ]
      //   })
      // },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader'},
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: '{{pascalcase name}}__[hash:base64:5]'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  project.plugin.autoprefixer
                ];
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              noIeCompat: true
            }
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        use: [{ loader: 'babel-loader' }],
        exclude: /(node_modules)/
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [{
          loader: 'url-loader',
          query: {
            limit: 8192,
            name: 'assets/images/[name]__[hash:base64:5].[ext]'
          }
        }]
      },
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader',
          query: {
            limit: 8192,
            name: 'assets/fonts/[name]__[hash:base64:5].[ext]'
          }
        }],
      }
    ]
  },
  plugins: [
    // Do not emit compiled assets that include errors
    new webpack.NoEmitOnErrorsPlugin(),

    // TODO: Extract to external CSS file when compass is configured to pull in plugin css files as well
    // Extract the dependent compoent styles into a single CSS file to avoid FOUC (flash of unstyled content)
    // new ExtractTextPlugin({
    //     filename: 'assets/css/index.css',
    //     allChunks: true,
    //     ignoreOrder: true // When using CSS modules import order of CSS no longer needs to be preserved
    // }),

    // Defines global variables
    new webpack.DefinePlugin(GLOBALS),

    // An ES6+ aware minifier, results in smaller output compared to UglifyJS given that 
    // Chromium in electron supports the majority of ES6 features out of the box.
    new BabiliPlugin()
  ],
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  }
};
