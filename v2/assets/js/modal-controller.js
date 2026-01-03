// Modal Controller - Handle modal animations and content display
import { CONFIG } from './config.js';

export class ModalController {
  constructor(contentManager, router) {
    this.contentManager = contentManager;
    this.router = router;
    this.modal = null;
    this.isOpen = false;
    this.animating = false;
  }

  async open(route, originElement) {
    if (this.animating) return;
    this.animating = true;

    // Load content
    const content = await this.contentManager.loadContent(route);

    // Create modal
    this.createModal();

    // Get origin tile position
    const origin = originElement.getBoundingClientRect();

    // Position modal at tile location
    this.positionModalAtOrigin(origin);

    // Add to DOM (still invisible)
    document.body.appendChild(this.modal);

    // Force reflow
    this.modal.offsetHeight;

    // Render content
    this.renderContent(content, route);

    // Animate to full screen
    await this.animateOpen();

    this.isOpen = true;
    this.animating = false;
  }

  async close(targetElement) {
    if (this.animating || !this.isOpen) return;
    this.animating = true;

    // Get target tile position
    const target = targetElement?.getBoundingClientRect();

    // Animate to tile or fade out
    await this.animateClose(target);

    // Remove from DOM
    this.modal.remove();
    this.modal = null;
    this.isOpen = false;
    this.animating = false;
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'spa-modal';
    modal.innerHTML = `
      <div class="spa-modal-backdrop"></div>
      <div class="spa-modal-container">
        <div class="spa-modal-close-btn">&times;</div>
        <div class="spa-modal-content-wrapper">
          <div class="spa-modal-prev-peek"></div>
          <div class="spa-modal-current-content"></div>
          <div class="spa-modal-next-peek"></div>
        </div>
      </div>
    `;
    this.modal = modal;
  }

  positionModalAtOrigin(rect) {
    const container = this.modal.querySelector('.spa-modal-container');
    container.style.position = 'fixed';
    container.style.left = rect.left + 'px';
    container.style.top = rect.top + 'px';
    container.style.width = rect.width + 'px';
    container.style.height = rect.height + 'px';
    container.style.transform = 'scale(1)';
    container.style.borderRadius = '16px';
  }

  async animateOpen() {
    return new Promise(resolve => {
      const container = this.modal.querySelector('.spa-modal-container');
      const backdrop = this.modal.querySelector('.spa-modal-backdrop');

      // Add transition
      container.style.transition = `all ${CONFIG.animation.modalOpenDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      backdrop.style.transition = `opacity ${CONFIG.animation.modalOpenDuration}ms ease`;

      // Trigger animation
      requestAnimationFrame(() => {
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.borderRadius = '0';
        backdrop.style.opacity = '1';
      });

      setTimeout(resolve, CONFIG.animation.modalOpenDuration);
    });
  }

  async animateClose(targetRect) {
    return new Promise(resolve => {
      const container = this.modal.querySelector('.spa-modal-container');
      const backdrop = this.modal.querySelector('.spa-modal-backdrop');

      container.style.transition = `all ${CONFIG.animation.modalCloseDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      backdrop.style.transition = `opacity ${CONFIG.animation.modalCloseDuration}ms ease`;

      if (targetRect) {
        // Animate back to tile
        container.style.left = targetRect.left + 'px';
        container.style.top = targetRect.top + 'px';
        container.style.width = targetRect.width + 'px';
        container.style.height = targetRect.height + 'px';
        container.style.borderRadius = '16px';
      } else {
        // Fade out if no target
        container.style.opacity = '0';
        container.style.transform = 'scale(0.9)';
      }

      backdrop.style.opacity = '0';

      setTimeout(resolve, CONFIG.animation.modalCloseDuration);
    });
  }

  renderContent(content, route) {
    const currentContent = this.modal.querySelector('.spa-modal-current-content');
    currentContent.innerHTML = content.content;

    // Render peek previews
    this.renderPeekPreviews(route);

    // Update title
    document.title = content.title;
  }

  renderPeekPreviews(currentRoute) {
    const { prev, next } = this.router.getAdjacentRoutes(currentRoute);

    const prevPeek = this.modal.querySelector('.spa-modal-prev-peek');
    const nextPeek = this.modal.querySelector('.spa-modal-next-peek');

    if (prev) {
      prevPeek.innerHTML = `<h3>${prev.title}</h3>`;
      prevPeek.dataset.route = prev.path;
    }

    if (next) {
      nextPeek.innerHTML = `<h3>${next.title}</h3>`;
      nextPeek.dataset.route = next.path;
    }
  }

  async switchContent(newRoute, direction) {
    const contentWrapper = this.modal.querySelector('.spa-modal-content-wrapper');

    // Animate content sliding out
    const slideOut = direction === 'left' ? '-100%' : '100%';
    contentWrapper.style.transition = `transform ${CONFIG.animation.swipeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    contentWrapper.style.transform = `translateX(${slideOut})`;

    await new Promise(resolve => setTimeout(resolve, CONFIG.animation.swipeTransitionDuration));

    // Load and render new content
    const content = await this.contentManager.loadContent(newRoute);
    this.renderContent(content, newRoute);

    // Position off-screen in opposite direction
    const slideIn = direction === 'left' ? '100%' : '-100%';
    contentWrapper.style.transition = 'none';
    contentWrapper.style.transform = `translateX(${slideIn})`;

    // Force reflow
    contentWrapper.offsetHeight;

    // Slide in
    contentWrapper.style.transition = `transform ${CONFIG.animation.swipeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    contentWrapper.style.transform = 'translateX(0)';
  }
}
