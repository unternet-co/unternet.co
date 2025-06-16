const pluginDate = require('eleventy-plugin-date');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const metagen = require('eleventy-plugin-metagen');
const { DateTime } = require('luxon');

const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');

module.exports = function (eleventyConfig) {
  console.log(eleventyConfig);
  eleventyConfig.addPassthroughCopy('assets');
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
  // Process docs markdown files but also copy any potential dist folder
  // eleventyConfig.ignores.add('docs/**');
  // eleventyConfig.addPassthroughCopy({ 'docs/dist': 'docs' });
};
