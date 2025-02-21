import { Component } from '@marcellejs/core';
import View from './image-output.view.svelte';

export class ImageOutput extends Component {
  constructor({ imageArray = [], threshold = 0.5, contrast = 1, brightness = 1 } = {}) {
    super();
    this.threshold = threshold;
    this.contrast = contrast;
    this.brightness = brightness;
    this.title = "output image";

    // If imageArray is a stream (like predictionStream), subscribe to it.
    if (imageArray && typeof imageArray.subscribe === 'function') {
      console.log("ImageOutput: Subscribing to prediction stream.");
      // Start with an empty array.
      this.imageArray = [];
      imageArray.subscribe((data) => {
        console.log("ImageOutput: Received new prediction data.", data);
        this.imageArray = data;
        if (this.$$.app) {
          this.$$.app.$set({ imageArray: data });
        }
      });
    } else {
      // Otherwise, treat imageArray as a static array.
      this.imageArray = imageArray;
    }
  }

  updateThreshold(newThreshold) {
    this.threshold = newThreshold;
    if (this.$$.app) {
      this.$$.app.$set({ threshold: this.threshold });
    }
  }

  updateContrast(newContrast) {
    this.contrast = newContrast;
    if (this.$$.app) {
      this.$$.app.$set({ contrast: this.contrast });
    }
  }

  updateBrightness(newBrightness) {
    this.brightness = newBrightness;
    if (this.$$.app) {
      this.$$.app.$set({ brightness: this.brightness });
    }
  }
  
  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageArray: this.imageArray,
        threshold: this.threshold,
        contrast: this.contrast,
        brightness: this.brightness,
      },
    });
  }

  destroy() {
    if (this.$$.app) {
      this.$$.app.$destroy();
      this.$$.app = null;
    }
  }
}
