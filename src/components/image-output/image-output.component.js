import { Component } from '@marcellejs/core';
import View from './image-output.view.svelte';

export class ImageOutput extends Component {
  constructor({ imageArray = [], threshold = 0.5, contrast = 1, brightness = 1 } = {}) {
    super();
    this.imageArray = imageArray;
    this.threshold = threshold;
    this.contrast = contrast;
    this.brightness = brightness;
  }

  updateThreshold(newThreshold) {
    this.threshold = newThreshold;
    this.$$.app.$set({ threshold: this.threshold });
  }

  updateContrast(newContrast) {
    this.contrast = newContrast;
    this.$$.app.$set({ contrast: this.contrast });
  }

  updateBrightness(newBrightness) {
    this.contrast = newBrightness;
    this.$$.app.$set({ brightness: this.brightness });
  }
  
  
  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
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