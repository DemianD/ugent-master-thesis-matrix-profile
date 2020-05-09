module.exports = {
  content: [
    './public/index.html',
    './src/**/*.js',
    './src/!(theme**)/**/*.css'
  ],
  css: ['./src/theme/theme-generated.css'],
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};
