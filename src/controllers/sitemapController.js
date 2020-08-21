const moment = require('moment');
const GhostContentAPI = require('@tryghost/content-api');
const config = require('../config/config');

const sitemapController = {
  get: async (req, res) => {
    let pagesXml = '';
    // First add all static pages
    pagesXml += '<url><loc>https://retrospectacle.io/</loc></url>';
    pagesXml += '<url><loc>https://retrospectacle.io/pricing</loc></url>';
    pagesXml += '<url><loc>https://retrospectacle.io/privacy</loc></url>';
    pagesXml += '<url><loc>https://retrospectacle.io/blog</loc></url>';

    // This is for fetching page and blog information
    const api = new GhostContentAPI({
      url: 'https://cms.retrospectacle.io',
      key: config.keys.ghost,
      version: 'v3',
    });

    // Get all blog posts
    const _posts = await api.posts.browse({
      include: 'tags,authors',
      limit: 'all',
    });
    await Promise.all(
      _posts.map((post) => {
        pagesXml += `<url><loc>https://retrospectacle.io/blog/posts/${
          post.slug
        }</loc><lastmod>${moment(post.updated_at).format(
          'YYYY-MM-DD',
        )}</lastmod><changefreq>yearly</changefreq></url>`;
      }),
    );

    // Get all blog tags
    const _tags = await api.tags.browse({
      include: 'tags,authors',
      limit: 'all',
    });
    await Promise.all(
      _tags.map((tag) => {
        pagesXml += `<url><loc>https://retrospectacle.io/blog/tags/${
          tag.slug
        }</loc><lastmod>${moment(tag.updated_at).format(
          'YYYY-MM-DD',
        )}</lastmod><changefreq>daily</changefreq></url>`;
      }),
    );

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pagesXml}</urlset> `;
    // Set the content to XML and send the message
    res.set('Content-Type', 'text/xml');
    res.send(sitemapXml);
  },
};

module.exports = sitemapController;
