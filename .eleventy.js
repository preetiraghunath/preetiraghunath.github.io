module.exports = function(eleventyConfig) {
  // Pass through assets (CSS, images)
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // Dev server: bind to all interfaces so Tailscale can reach it
  eleventyConfig.setServerOptions({
    host: "0.0.0.0"
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
