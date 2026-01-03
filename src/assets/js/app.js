// Main App Orchestrator - Initialize and coordinate all components
import { CONFIG } from './config.js';
import { Router } from './router.js';
import { ContentManager } from './content-manager.js';
import { ModalController } from './modal-controller.js';
import { TouchController } from './touch-controller.js';

class PortfolioApp {
  constructor() {
    this.contentManager = new ContentManager();
    this.router = new Router();
    this.modalController = new ModalController(this.contentManager, this.router);
    this.touchController = null;

    this.init();
  }

  async init() {
    // Preload all content in background
    this.contentManager.preloadAll();

    // Set up router event listener
    this.router.addEventListener('routechange', (e) => {
      this.handleRouteChange(e.detail);
    });

    // Set up tile click handlers
    this.setupTileHandlers();

    // Handle initial route if not home
    const initialPath = window.location.pathname;
    if (!this.router.isHomePage(initialPath)) {
      // Direct navigation to role page
      const tile = this.findTileForRoute(initialPath);
      if (tile) {
        await this.modalController.open(initialPath, tile);
        this.initTouchController();
      }
    }
  }

  setupTileHandlers() {
    const tiles = document.querySelectorAll('.role-tile');
    tiles.forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const route = tile.getAttribute('href');
        this.openRole(route, tile);
      });
    });
  }

  async openRole(route, originElement) {
    await this.modalController.open(route, originElement);
    this.router.navigate(route);
    this.initTouchController();
  }

  initTouchController() {
    // Destroy existing controller
    if (this.touchController) {
      this.touchController.destroy();
      this.touchController = null;
    }

    if (this.modalController.modal) {
      this.touchController = new TouchController(
        this.modalController,
        this.router
      );
      this.touchController.init(this.modalController.modal);

      // Set up close button
      const closeBtn = this.modalController.modal.querySelector('.spa-modal-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeRole());
      }

      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();
    }
  }

  setupKeyboardShortcuts() {
    const keyHandler = (e) => {
      if (!this.modalController.isOpen) return;

      if (e.key === 'Escape') {
        this.closeRole();
      } else if (e.key === 'ArrowLeft') {
        const { prev } = this.router.getAdjacentRoutes(this.router.currentRoute);
        if (prev) {
          this.modalController.switchContent(prev.path, 'right');
          this.router.navigate(prev.path);
        }
      } else if (e.key === 'ArrowRight') {
        const { next } = this.router.getAdjacentRoutes(this.router.currentRoute);
        if (next) {
          this.modalController.switchContent(next.path, 'left');
          this.router.navigate(next.path);
        }
      }
    };

    // Remove old listener if exists
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }

    this.keyHandler = keyHandler;
    document.addEventListener('keydown', keyHandler);
  }

  async closeRole() {
    const targetTile = this.findTileForRoute(this.router.currentRoute);
    await this.modalController.close(targetTile);
    this.router.navigate(CONFIG.routes.HOME);

    // Clean up
    if (this.touchController) {
      this.touchController.destroy();
      this.touchController = null;
    }

    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  findTileForRoute(route) {
    // Normalize routes for comparison
    const normalizedRoute = route.endsWith('/') ? route : route + '/';
    return document.querySelector(`.role-tile[href="${route}"], .role-tile[href="${normalizedRoute}"]`);
  }

  async handleRouteChange({ from, to, isInitial }) {
    // Handle browser back/forward
    if (isInitial) return;

    if (this.router.isHomePage(to) && this.modalController.isOpen) {
      // Navigating to home while modal is open - close it
      await this.closeRole();
    } else if (!this.router.isHomePage(to) && !this.modalController.isOpen) {
      // Navigating to role page while no modal - open it
      const tile = this.findTileForRoute(to);
      if (tile) {
        await this.openRole(to, tile);
      }
    } else if (!this.router.isHomePage(to) && this.modalController.isOpen && from !== to) {
      // Navigating between role pages - switch content
      const direction = this.getSwipeDirection(from, to);
      await this.modalController.switchContent(to, direction);
    }
  }

  getSwipeDirection(from, to) {
    const roles = CONFIG.roles;
    const fromIndex = roles.findIndex(r => r.path === from);
    const toIndex = roles.findIndex(r => r.path === to);

    if (fromIndex === -1 || toIndex === -1) return 'left';

    // If going forward in array, slide left; backward, slide right
    return toIndex > fromIndex ? 'left' : 'right';
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
  });
} else {
  window.portfolioApp = new PortfolioApp();
}
