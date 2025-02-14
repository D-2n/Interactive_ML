import '@marcellejs/core/dist/marcelle.css';
import { dashboard, text, imageUpload, imageDisplay } from '@marcellejs/core';
import { Slider } from './components';
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
// import { imageDisplay } from './components/image-display';

const x = text('hello :3');

const upload = imageUpload();
let imageArray = [];
const exampleImage = new Array(100000).fill(0).map(() => Math.random());


//const org_img = new imageDisplay({ imageArray});
const org_img = imageDisplay(upload.$images)

  

const imageComponent = new imageOutput({ imageArray: upload.$images, threshold: 0.1 });

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

const dash = dashboard({
  title: 'My Marcelle App!',
  author: 'Marcelle Doe'
});

dash.page('Welcome').use(x, sliderComponent, imageComponent).sidebar(upload, org_img);
dash.page('Heatmap').use(heatmapy);

dash.show();
