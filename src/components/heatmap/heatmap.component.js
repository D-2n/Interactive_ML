import { Component } from '@marcellejs/core';
import View from './heatmap.view.svelte';

export class Heatmap extends Component {
  constructor({ imageArray = [], threshold = 0.5 } = {}) {
    super();
    this.title = 'Heatmap of the segmentations';
    this.imageArray = []; // Initialize with an empty array
    this.threshold = threshold ?? 0.5;

    // Subscribe to the image stream
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

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy(); // Remove previous instance if it exists

    console.log("Mounting Heatmap with imageArray length:", this.imageArray.length); // Debug

    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageArray: this.imageArray, // Ensure it's not undefined
        threshold: this.threshold
      }
    });
  }
}