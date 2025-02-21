import { Component, Stream } from '@marcellejs/core';
import BrushView from './brush.view.svelte';

export class Brush extends Component {
  #sketchCtx;
  #thumbnailCanvas;
  #thumbnailCtx;
  #thumbnailCanvasWidth = 100;
  #thumbnailCanvasHeight = 100;
  
  // Cache event listeners if $$.app isn't available yet.
  _cachedEvents = [];

  constructor(imageStream) {
    super();
    this.title = 'Brush window';
    this.imageStream = imageStream;
    this.$images = new Stream();
    this.$thumbnails = new Stream();
    this.$strokeStart = new Stream();
    this.$strokeEnd = new Stream();

    this.sketchElement = null;

    this.setupCapture();

    // Subscribe to strokeEnd stream to capture the image.
    this.$strokeEnd.subscribe(() => {
      this.capture();
    });

    this.start(); // Assuming start is defined elsewhere.
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) {
      console.error("No valid target for Brush mount.");
      this.destroy();
      return;
    }
    this.$$.app = new BrushView({
      target: t,
      props: {
        title: this.title,
        strokeStart: this.$strokeStart,
        strokeEnd: this.$strokeEnd,
        imageStream: this.imageStream,
      },
    });
    // Listen for the canvasElement event from the view.
    this.$$.app.$on('canvasElement', (e) => {
      this.sketchElement = e.detail;
      this.#sketchCtx = this.sketchElement.getContext('2d');
    });
    // Now flush cached event listeners.
    this._cachedEvents.forEach(({ event, callback }) => {
      console.log("Attaching cached event listener for", event);
      this.$$.app.$on(event, callback);
    });
    this._cachedEvents = [];
  }

  // Proxy $on method: if the view isn't mounted, cache the event.
  $on(event, callback) {
    if (this.$$.app && typeof this.$$.app.$on === 'function') {
      console.log("Attaching event listener for", event);
      return this.$$.app.$on(event, callback);
    } else {
      console.warn("Brush component not mounted yet; caching event:", event);
      this._cachedEvents.push({ event, callback });
    }
  }

  setupCapture() {
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvas.width = this.#thumbnailCanvasWidth;
    this.#thumbnailCanvas.height = this.#thumbnailCanvasHeight;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
  }

  capture() {
    if (!this.sketchElement) {
      console.error('sketchElement is not initialized');
      return;
    }
    const thumb = this.captureThumbnail();
    this.$thumbnails.set(thumb);
    this.$images.set(this.captureImage());
  }

  captureThumbnail() {
    if (!this.sketchElement) {
      console.error('sketchElement is not initialized');
      return;
    }
    this.#thumbnailCtx.drawImage(
      this.sketchElement,
      0,
      0,
      this.#thumbnailCanvas.width,
      this.#thumbnailCanvas.height
    );
    return this.#thumbnailCanvas.toDataURL('image/jpeg');
  }

  captureImage() {
    if (!this.sketchElement) {
      console.error('sketchElement is not initialized');
      return;
    }
    return this.#sketchCtx.getImageData(0, 0, this.sketchElement.width, this.sketchElement.height);
  }

  destroy() {
    if (this.$$.app) {
      this.$$.app.$destroy();
      this.$$.app = null;
    }
  }
}
