import { Component } from '@marcellejs/core';
import View from './slider.view.svelte';

export class Slider extends Component {
  constructor(options = {}) {
    super();
    this.title = 'Segmentation threshold slider';
    this.options = options;
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        options: this.options
      }
    });
  }

  destroy() {
    if (this.$$.app) {
      this.$$.app.$destroy();
      this.$$.app = null;
    }
  }
}