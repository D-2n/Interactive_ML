import { Component } from '@marcellejs/core';
import { Slider as SliderComponent } from './slider.component';

export class Slider extends Component {
  constructor({ min = 0, max = 1, step = 0.01, initialValue = 0.5, onChange } = {}) {
    super();
    this.title = 'Slider Control';
    this.options = { min, max, step, value: initialValue };
    this.onChange = onChange;
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;

    this.destroy(); // Destroy any previous instances before mounting
    
    // Create slider instance
    this.slider = new SliderComponent({
      min: this.options.min,
      max: this.options.max,
      step: this.options.step,
      value: this.options.value,
    });

    // Handle slider updates
    this.slider.mount(t);
    this.slider.$$.app.$on('change', (event) => {
      this.options.value = event.detail;
      if (this.onChange) {
        this.onChange(event.detail);
      }
    });
  }

  destroy() {
    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }
}