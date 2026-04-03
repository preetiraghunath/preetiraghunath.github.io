// Router - Handle URL changes and browser history
import { CONFIG } from './config.js';

export class Router extends EventTarget {
  constructor() {
    super();
    this.currentRoute = null;
    this.init();
  }

  init() {
    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname, false);
    });

    // Handle initial load
    this.handleRoute(window.location.pathname, true);
  }

  navigate(path, pushState = true) {
    if (path === this.currentRoute) return;

    const route = this.resolveRoute(path);
    if (!route) {
      console.error('Route not found:', path);
      return;
    }

    if (pushState) {
      history.pushState({ path }, '', path);
    }

    this.handleRoute(path, false);
  }

  handleRoute(path, isInitial) {
    const previousRoute = this.currentRoute;
    this.currentRoute = path;

    // Emit route change event
    this.dispatchEvent(new CustomEvent('routechange', {
      detail: {
        from: previousRoute,
        to: path,
        isInitial
      }
    }));
  }

  resolveRoute(path) {
    // Normalize path (handle trailing slashes)
    const normalized = path.endsWith('/') ? path : path + '/';
    const found = Object.values(CONFIG.routes).find(r => {
      const routeNormalized = r.endsWith('/') ? r : r + '/';
      return routeNormalized === normalized;
    });
    return found || null;
  }

  getAdjacentRoutes(currentPath) {
    const roles = CONFIG.roles;
    const current = roles.find(r => r.path === currentPath);

    if (!current) return { prev: null, next: null };

    const index = roles.indexOf(current);
    const prevIndex = (index - 1 + roles.length) % roles.length;
    const nextIndex = (index + 1) % roles.length;

    return {
      prev: roles[prevIndex],
      next: roles[nextIndex]
    };
  }

  isHomePage(path) {
    const normalized = path.endsWith('/') ? path : path + '/';
    const homeNormalized = CONFIG.routes.HOME.endsWith('/') ? CONFIG.routes.HOME : CONFIG.routes.HOME + '/';
    return normalized === homeNormalized;
  }
}
