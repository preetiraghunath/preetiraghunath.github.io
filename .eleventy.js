module.exports = function(eleventyConfig) {
  // Pass through assets (CSS, images)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Dev server: bind to all interfaces so Tailscale can reach it
  eleventyConfig.setServerOptions({
    host: "0.0.0.0"
  });

  return {
    pathPrefix: "/v2/",  // CRITICAL: for subdirectory deployment
    dir: {
      input: "src",
      output: "v2",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
