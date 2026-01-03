// Role page navigation controls
class RoleNavigation {
    constructor() {
        this.rolePage = document.querySelector('.role-page');
        if (!this.rolePage) return;

        this.roleType = this.rolePage.dataset.role;
        this.prevPage = this.rolePage.dataset.prev;
        this.nextPage = this.rolePage.dataset.next;

        this.init();
    }

    init() {
        // Close button
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.navigateHome());
        }

        // Swipe gestures
        this.rolePage.addEventListener('swipeleft', () => this.navigateNext());
        this.rolePage.addEventListener('swiperight', () => this.navigatePrev());
        this.rolePage.addEventListener('swipedown', () => this.navigateHome());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.navigateHome();
            if (e.key === 'ArrowLeft') this.navigatePrev();
            if (e.key === 'ArrowRight') this.navigateNext();
        });
    }

    navigateHome() {
        this.navigate('/v2/');
    }

    navigateNext() {
        if (this.nextPage) {
            this.navigate(this.nextPage);
        }
    }

    navigatePrev() {
        if (this.prevPage) {
            this.navigate(this.prevPage);
        }
    }

    navigate(url) {
        // Use View Transitions if available
        if (window.viewTransitionsManager) {
            const link = document.createElement('a');
            link.href = url;
            link.click();
        } else {
            window.location.href = url;
        }
    }
}

// Initialize
window.initRoleNavigation = function() {
    const roleNav = new RoleNavigation();
    window.currentRoleNavigation = roleNav;
};

document.addEventListener('DOMContentLoaded', () => {
    window.initRoleNavigation();
});
