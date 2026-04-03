// Touch Controller - Handle swipe gestures with visual feedback
import { CONFIG } from './config.js';

export class TouchController {
  constructor(modalController, router) {
    this.modalController = modalController;
    this.router = router;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isDragging = false;
    this.startTime = 0;
    this.boundTouchStart = null;
    this.boundTouchMove = null;
    this.boundTouchEnd = null;
  }

  init(modalElement) {
    this.modal = modalElement;
    this.contentWrapper = modalElement.querySelector('.spa-modal-content-wrapper');
    this.scrollableContent = modalElement.querySelector('.spa-modal-current-content');
    this.backdrop = modalElement.querySelector('.spa-modal-backdrop');

    // Bind methods
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    // Touch events
    this.modal.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    this.modal.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    this.modal.addEventListener('touchend', this.boundTouchEnd, { passive: false });
  }

  onTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.currentX = this.touchStartX;
    this.currentY = this.touchStartY;
    this.startTime = Date.now();
    this.isDragging = true;
    this.scrollTopAtStart = this.scrollableContent.scrollTop;

    // Remove transitions for smooth dragging
    this.contentWrapper.style.transition = 'none';
    this.backdrop.style.transition = 'none';
  }

  onTouchMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.touches[0].clientX;
    this.currentY = e.touches[0].clientY;

    const deltaX = this.currentX - this.touchStartX;
    const deltaY = this.currentY - this.touchStartY;

    // Determine direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe - prevent default to avoid back navigation
      e.preventDefault();

      // Apply damping for resistance
      const dampedDelta = deltaX * CONFIG.touch.dampingFactor;

      // Transform content wrapper
      this.contentWrapper.style.transform = `translateX(${dampedDelta}px)`;
    } else if (deltaY > 0 && this.scrollableContent.scrollTop <= 0) {
      // Vertical down swipe - only when content is scrolled to top
      e.preventDefault();

      const dampedDelta = deltaY * CONFIG.touch.dampingFactor;
      this.contentWrapper.style.transform = `translateY(${dampedDelta}px)`;
      this.backdrop.style.opacity = Math.max(0, 1 - (dampedDelta / 500));
    }
  }

  onTouchEnd(e) {
    if (!this.isDragging) return;

    const deltaX = this.currentX - this.touchStartX;
    const deltaY = this.currentY - this.touchStartY;
    const deltaTime = Date.now() - this.startTime;
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Reset
    this.isDragging = false;

    // Add transition back
    this.contentWrapper.style.transition = `transform ${CONFIG.animation.swipeTransitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    this.backdrop.style.transition = `opacity ${CONFIG.animation.swipeTransitionDuration}ms ease`;

    // Determine action
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > CONFIG.touch.swipeThreshold || velocityX > CONFIG.touch.swipeVelocity) {
        if (deltaX > 0) {
          this.navigatePrev();
        } else {
          this.navigateNext();
        }
      } else {
        // Reset position
        this.resetPosition();
      }
    } else {
      // Vertical swipe - only close if content was at scroll top when gesture started
      if (this.scrollTopAtStart <= 0 && deltaY > 0 &&
          (deltaY > CONFIG.touch.verticalThreshold || velocityY > CONFIG.touch.swipeVelocity)) {
        this.closeModal();
      } else {
        // Reset position
        this.resetPosition();
      }
    }
  }

  resetPosition() {
    this.contentWrapper.style.transform = 'translateX(0) translateY(0)';
    this.backdrop.style.opacity = '1';
  }

  async navigateNext() {
    const { next } = this.router.getAdjacentRoutes(this.router.currentRoute);
    if (next) {
      await this.modalController.switchContent(next.path, 'left');
      this.router.navigate(next.path);
    } else {
      this.resetPosition();
    }
  }

  async navigatePrev() {
    const { prev } = this.router.getAdjacentRoutes(this.router.currentRoute);
    if (prev) {
      await this.modalController.switchContent(prev.path, 'right');
      this.router.navigate(prev.path);
    } else {
      this.resetPosition();
    }
  }

  closeModal() {
    // Trigger modal close through modal controller
    if (this.modalController.isOpen) {
      this.modalController.close();
    }
  }

  destroy() {
    // Clean up event listeners
    if (this.modal) {
      this.modal.removeEventListener('touchstart', this.boundTouchStart);
      this.modal.removeEventListener('touchmove', this.boundTouchMove);
      this.modal.removeEventListener('touchend', this.boundTouchEnd);
    }
    this.modal = null;
    this.contentWrapper = null;
    this.backdrop = null;
  }
}
