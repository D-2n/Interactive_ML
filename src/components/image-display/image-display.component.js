import { Component } from '@marcellejs/core';
import View from './image-display.view.svelte';

export class ImageDisplay extends Component {
  constructor({ imageArray = [] } = {}) {
    super();
    this.title = 'Original Image';
    this.imageArray = imageArray;
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();


    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageArray: this.imageArray
      }
    });
  }
}

