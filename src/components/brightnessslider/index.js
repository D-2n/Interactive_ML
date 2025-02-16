import { Component } from '@marcellejs/core';
import { BrightnessSlider as BrightnessSliderComponent } from './brightnessslider.component';

export class BrightnessSlider extends Component {
  constructor({ min = 0.2, max = 1.2, step = 0.01, initialValue = 0.7, onChange } = {}) {
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
    this.slider = new BrightnessSliderComponent({
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