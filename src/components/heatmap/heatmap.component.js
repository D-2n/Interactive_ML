import { Component } from '@marcellejs/core';
import View from './heatmap.view.svelte';

export class Heatmap extends Component {
	constructor({ imageArray = [], threshold = 0.5 } = {}) {
		super();
		this.title = 'Heatmap of the segmentations';
		this.imageArray = imageArray ?? []; // Ensure it is always an array
		this.threshold = threshold ?? 0.5;
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
