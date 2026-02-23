/**
 * ============================================================================
 * WEBPACK CONFIGURATION
 * ============================================================================
 * 
 * PURPOSE:
 * This is the webpack configuration file. Webpack is a module bundler that:
 * - Transpiles TypeScript to JavaScript
 * - Bundles all modules into a single file
 * - Handles CSS and other assets
 * - Provides hot module replacement during development
 * 
 * WHY WE NEED IT:
 * - Browsers don't understand TypeScript directly
 * - We need to bundle our code for production
 * - We need to handle CSS and other assets
 * - We want a fast development workflow
 * 
 * HOW TO USE:
 * - webpack --mode development: Development build with source maps
 * - webpack --mode production: Optimized production build
 * - webpack serve --mode development: Development server with HMR
 * 
 * BEGINNER TIP:
 * Webpack configuration can be complex. This config is set up to work
 * out-of-the-box for this project. You typically won't need to change it.
 */

const path = require('path');

module.exports = {
  // Entry point: The first file that gets loaded
  entry: './src/main.ts',
  
  // Output: Where the bundled code goes
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  
  // Module rules: How different file types are processed
  module: {
    rules: [
      // TypeScript files
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            // Disable type checking in webpack (we use tsc separately)
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext'
            }
          }
        },
        exclude: /node_modules/
      },
      
      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      
      // SVG files - copy them to output directory
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'icons/[name][ext]'
        }
      }
    ]
  },
  
  // Resolve: How modules are found
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  // Dev server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 9000,
    hot: true,
    open: false,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    }
  },
  
  // Performance hints
  performance: {
    hints: false
  },
  
  // Source maps for debugging
  devtool: 'source-map',
  
  // Watch mode options
  watchOptions: {
    // Ignore node_modules to speed up rebuilds
    ignored: /node_modules/,
    // Aggregate changes before rebuilding
    aggregateTimeout: 300
  }
};