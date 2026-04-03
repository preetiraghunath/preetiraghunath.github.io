// Swipe navigation handler
class SwipeNavigator {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            threshold: 50,        // Minimum distance for swipe
            velocity: 0.3,        // Minimum velocity (px/ms)
            verticalThreshold: 80, // Threshold for vertical swipe
            ...options
        };

        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.touchStartTime = 0;

        this.init();
    }

    init() {
        this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
        this.touchStartTime = Date.now();
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        const touchEndTime = Date.now();

        this.handleSwipe(touchEndTime);
    }

    handleSwipe(endTime) {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const deltaTime = endTime - this.touchStartTime;

        const velocityX = Math.abs(deltaX) / deltaTime;
        const velocityY = Math.abs(deltaY) / deltaTime;

        // Determine if horizontal or vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > this.options.threshold || velocityX > this.options.velocity) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > this.options.verticalThreshold || velocityY > this.options.velocity) {
                if (deltaY > 0) {
                    this.onSwipeDown();
                }
            }
        }
    }

    onSwipeLeft() {
        const event = new CustomEvent('swipeleft');
        this.element.dispatchEvent(event);
    }

    onSwipeRight() {
        const event = new CustomEvent('swiperight');
        this.element.dispatchEvent(event);
    }

    onSwipeDown() {
        const event = new CustomEvent('swipedown');
        this.element.dispatchEvent(event);
    }
}

// Initialize and expose globally
window.SwipeNavigator = SwipeNavigator;

window.initSwipeNavigation = function() {
    const rolePage = document.querySelector('.role-page');
    if (!rolePage) return;

    const swipeNav = new SwipeNavigator(rolePage);
    window.currentSwipeNavigator = swipeNav;
};

document.addEventListener('DOMContentLoaded', () => {
    window.initSwipeNavigation();
});
