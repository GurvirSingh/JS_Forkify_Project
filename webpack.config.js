const path = require('path');

module.exports = {
    // where npm will start looking for files to bundle(ing)
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/js'),
        filename: 'bundle.js'
    }
};