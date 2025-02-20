import { Component } from '@marcellejs/core';
import View from './image-display.view.svelte';

export class scanDisplay extends Component {
  constructor(imageStream, brightness = 1, contrast = 1) {
    super();
    this.title = 'image display';
    this.imageStream = imageStream;
    this.brightness = brightness;
    this.contrast = contrast;
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageStream: this.imageStream,
        brightness: this.brightness,
        contrast: this.contrast,
      },
    });
  }

  updateBrightness(newBrightness) {
    this.brightness = newBrightness;
    if (this.$$.app) {
      this.$$.app.$set({ brightness: this.brightness });
    }
  }

  updateContrast(newContrast) {
    this.contrast = newContrast;
    if (this.$$.app) {
      this.$$.app.$set({ contrast: this.contrast });
    }
  }
}