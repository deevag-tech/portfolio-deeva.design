/* Shared state for the hero intro, so the DOM clouds (hero.js) and the
   3D title (scene.js) stay in step. */
export const intro = {
  start: null,      // performance.now() when the clouds begin to part
  ready: false,     // the 3D world has drawn its first frame with the title
};
