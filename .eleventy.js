const pluginDate = require('eleventy-plugin-date');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const metagen = require('eleventy-plugin-metagen');
const { DateTime } = require('luxon');

const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

module.exports = function (eleventyConfig) {
  // Use .eleventyignore file instead of .gitignore
  eleventyConfig.setUseGitIgnore(false);

  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('docs/**/assets');
  eleventyConfig.addPassthroughCopy('docs/**/*.png');
  eleventyConfig.addPassthroughCopy('docs/**/*.jpg');
  eleventyConfig.addPassthroughCopy('docs/**/*.gif');
  eleventyConfig.addPassthroughCopy('docs/**/*.svg');
  eleventyConfig.addPlugin(pluginDate);
  eleventyConfig.addPlugin(pluginRSS);
  eleventyConfig.addPlugin(metagen);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addFilter('dateFilter', function (date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
};
