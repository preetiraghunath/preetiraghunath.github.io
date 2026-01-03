// View Transitions API manager
class ViewTransitionsManager {
    constructor() {
        this.supported = 'startViewTransition' in document;
    }

    async transition(updateCallback) {
        if (!this.supported) {
            // Fallback: just execute callback
            await updateCallback();
            return;
        }

        // Use View Transitions API
        const transition = document.startViewTransition(updateCallback);

        try {
            await transition.finished;
        } catch (error) {
            console.error('View transition failed:', error);
        }
    }

    // Intercept navigation clicks
    interceptNavigation() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (!link) return;
            if (link.origin !== location.origin) return;
            if (link.target === '_blank') return;

            const url = new URL(link.href);

            // Only intercept /v2/ paths
            if (!url.pathname.startsWith('/v2/')) return;

            e.preventDefault();

            this.transition(async () => {
                // Fetch new page
                const response = await fetch(url);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Update head - replace all link and script tags
                const oldLinks = document.head.querySelectorAll('link[rel="stylesheet"]');
                const newLinks = doc.head.querySelectorAll('link[rel="stylesheet"]');

                // Remove old stylesheet links
                oldLinks.forEach(link => link.remove());

                // Add new stylesheet links
                newLinks.forEach(link => {
                    document.head.appendChild(link.cloneNode(true));
                });

                // Update scripts in head (preserve existing scripts, add new ones)
                const oldScripts = Array.from(document.head.querySelectorAll('script'));
                const newScripts = Array.from(doc.head.querySelectorAll('script'));

                newScripts.forEach(newScript => {
                    const exists = oldScripts.some(oldScript =>
                        oldScript.src === newScript.src
                    );

                    if (!exists && newScript.src) {
                        const scriptElement = document.createElement('script');
                        scriptElement.src = newScript.src;
                        scriptElement.defer = true;
                        document.head.appendChild(scriptElement);
                    }
                });

                // Update body
                document.body.innerHTML = doc.body.innerHTML;

                // Update title
                document.title = doc.title;

                // Update URL
                history.pushState({}, '', url);

                // Re-initialize scripts
                this.reinitializeScripts();
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.transition(async () => {
                location.reload();
            });
        });
    }

    reinitializeScripts() {
        // Re-run swipe navigation initialization if on role page
        if (typeof window.initSwipeNavigation === 'function') {
            window.initSwipeNavigation();
        }
        if (typeof window.initRoleNavigation === 'function') {
            window.initRoleNavigation();
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const vtManager = new ViewTransitionsManager();
    vtManager.interceptNavigation();

    // Make available globally
    window.viewTransitionsManager = vtManager;
});
