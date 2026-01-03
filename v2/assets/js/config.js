// Configuration constants for the SPA
export const CONFIG = {
  routes: {
    HOME: '/v2/',
    RESEARCHER: '/v2/researcher',
    CONSULTANT: '/v2/consultant'
  },

  roles: [
    { id: 'researcher', path: '/v2/researcher', title: 'Academic Researcher' },
    { id: 'consultant', path: '/v2/consultant', title: 'Research Consultant' }
  ],

  animation: {
    modalOpenDuration: 350,      // Tile to modal animation (ms)
    modalCloseDuration: 300,     // Modal to tile animation (ms)
    swipeTransitionDuration: 350, // Role switching animation (ms)
    peekWidth: 25                // Percentage of next page visible
  },

  touch: {
    swipeThreshold: 50,          // Min pixels to trigger navigation
    swipeVelocity: 0.3,          // Min velocity (px/ms)
    verticalThreshold: 100,      // Min vertical swipe to close
    dampingFactor: 0.6           // Resistance during drag
  }
};
