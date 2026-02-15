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

    // Animate to centered position
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
        <button class="spa-modal-nav-arrow spa-modal-nav-prev" aria-label="Previous role">&#8249;</button>
        <button class="spa-modal-nav-arrow spa-modal-nav-next" aria-label="Next role">&#8250;</button>
        <div class="spa-modal-content-wrapper">
          <div class="spa-modal-current-content"></div>
        </div>
      </div>
    `;
    this.modal = modal;
  }

  positionModalAtOrigin(rect) {
    const container = this.modal.querySelector('.spa-modal-container');
    const contentWrapper = this.modal.querySelector('.spa-modal-content-wrapper');

    container.style.position = 'fixed';
    container.style.left = rect.left + 'px';
    container.style.top = rect.top + 'px';
    container.style.width = rect.width + 'px';
    container.style.height = rect.height + 'px';
    container.style.transform = 'scale(1)';
    container.style.borderRadius = '16px';

    // Hide content during animation to prevent visual glitches
    contentWrapper.style.visibility = 'hidden';
    contentWrapper.style.transform = 'translateX(0)';
    contentWrapper.style.transition = 'none';
  }

  async animateOpen() {
    return new Promise(resolve => {
      const container = this.modal.querySelector('.spa-modal-container');
      const backdrop = this.modal.querySelector('.spa-modal-backdrop');
      const contentWrapper = this.modal.querySelector('.spa-modal-content-wrapper');

      // Calculate centered modal dimensions
      const maxWidth = Math.min(1000, window.innerWidth * 0.9);
      const maxHeight = window.innerHeight * 0.85;
      const left = (window.innerWidth - maxWidth) / 2;
      const top = (window.innerHeight - maxHeight) / 2;

      // Add transition
      container.style.transition = `all ${CONFIG.animation.modalOpenDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      backdrop.style.transition = `opacity ${CONFIG.animation.modalOpenDuration}ms ease`;

      // Trigger animation to centered position
      requestAnimationFrame(() => {
        container.style.left = left + 'px';
        container.style.top = top + 'px';
        container.style.width = maxWidth + 'px';
        container.style.height = maxHeight + 'px';
        container.style.borderRadius = '16px';
        backdrop.style.opacity = '1';
      });

      // Show content after animation completes
      setTimeout(() => {
        contentWrapper.style.visibility = 'visible';
        resolve();
      }, CONFIG.animation.modalOpenDuration);
    });
  }

  async animateClose(targetRect) {
    return new Promise(resolve => {
      const container = this.modal.querySelector('.spa-modal-container');
      const backdrop = this.modal.querySelector('.spa-modal-backdrop');
      const contentWrapper = this.modal.querySelector('.spa-modal-content-wrapper');

      // Hide content immediately so it doesn't squish during shrink
      contentWrapper.style.visibility = 'hidden';

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

    // Update title
    document.title = content.title;
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
