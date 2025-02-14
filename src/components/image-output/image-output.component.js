import { Component } from '@marcellejs/core';
import View from './image-output.view.svelte';

export class ImageOutput extends Component {
  constructor({ imageArray = [], threshold = 0.5 } = {}) {
    super();
    this.imageArray = imageArray;
    this.threshold = threshold;
  }

  updateThreshold(newThreshold) {
    this.threshold = newThreshold;
    this.$$.app.$set({ threshold: this.threshold });
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