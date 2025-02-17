import '@marcellejs/core/dist/marcelle.css';
import { dashboard, text, imageUpload, imageDisplay } from '@marcellejs/core';
import { Slider } from './components';
import { ContrastSlider } from './components/contrastslider';
import { BrightnessSlider } from './components/brightnessslider';
import { brush } from './components/brush'; 
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
// import { imageDisplay } from './components/image-display';

const x = text('In our platform, you can upload a PET scan image and segment the image using the brush tool. You can also adjust the threshold, contrast, and brightness of the image.');
x.title = "introduction";

const upload = imageUpload();
let imageArray = [];
const exampleImage = new Array(100000).fill(0).map(() => Math.random());


//const org_img = new imageDisplay({ imageArray});
const org_img = imageDisplay(upload.$images)

const imageComponent = new imageOutput({ imageArray: exampleImage, threshold: 0.1, contrast: 1, brightness: 0.7 });
console.log("imageComponent:", imageComponent);
//console.log(imageComponent.element);  
   


const heatmapy = new heatmap({ imageArray: exampleImage, width: 100, height: 100 });

const sliderComponent = new Slider({
  min: 0,
  max: 1,
  step: 0.01,
  initialValue: 0.5,
  onChange: (val) => {
    console.log("Slider value:", val);
    imageComponent.updateThreshold(val);
  },
});

const contrastSliderComponent = new ContrastSlider({
    min: 0,
    max: 2,
    step: 0.01,
    initialValue: 1,
    onChange: (val) => {
      console.log("Contrast value:", val);
      imageComponent.updateContrast(val); 
    },
  });
  
  const brightnessSliderComponent = new BrightnessSlider({
    min: 0.2,
    max: 1.2,
    step: 0.01,
    initialValue: 0.7,
    onChange: (val) => {
      console.log("Brightness value:", val);
      imageComponent.updateBrightness(val); 
    },
  });

  const brushComponent = new brush(upload.$images);

const dash = dashboard({
  title: 'PET Scan Segmentation',
  author: 'Marcelle Doe'
});

dash.page('Welcome').use(x, [imageComponent, sliderComponent, contrastSliderComponent, brightnessSliderComponent], brushComponent).sidebar(upload, org_img);
dash.page('Heatmap').use(heatmapy);

dash.show();
