// Content Manager - Fetch and cache page content
import { CONFIG } from './config.js';

export class ContentManager {
  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }

  async loadContent(route) {
    // Return from cache if available
    if (this.cache.has(route)) {
      return this.cache.get(route);
    }

    // If already loading, return same promise
    if (this.loading.has(route)) {
      return this.loading.get(route);
    }

    // Fetch and parse
    const promise = this.fetchAndParse(route);
    this.loading.set(route, promise);

    try {
      const content = await promise;
      this.cache.set(route, content);
      this.loading.delete(route);
      return content;
    } catch (error) {
      this.loading.delete(route);
      throw error;
    }
  }

  async fetchAndParse(route) {
    const response = await fetch(route);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${route}: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract content based on page type
    const roleContent = doc.querySelector('.role-content');
    const homeContent = doc.querySelector('.homepage-container');
    const rolePage = doc.querySelector('.role-page');

    return {
      title: doc.title,
      content: roleContent?.innerHTML || homeContent?.innerHTML || '',
      role: rolePage?.dataset.role || 'home',
      isRolePage: !!roleContent
    };
  }

  preloadAll() {
    // Preload all routes in background
    Object.values(CONFIG.routes).forEach(route => {
      this.loadContent(route).catch(err => {
        console.warn('Preload failed for', route, err);
      });
    });
  }
}
