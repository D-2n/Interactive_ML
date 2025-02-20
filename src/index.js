import '@marcellejs/core/dist/marcelle.css';
import { dashboard, text, imageUpload, imageDisplay} from '@marcellejs/core';
import { Slider } from './components';
import { ContrastSlider } from './components/contrastslider';
import { BrightnessSlider } from './components/brightnessslider';
import { brush } from './components/brush'; 
import { imageOutput } from './components/image-output';
import { heatmap } from './components/heatmap';
import { ScanDisplay } from './components/image-display';

const upload_text = text('Upload a PET scan image and you can also adjust the contrast, and brightness of the image.');
upload_text.title = "step one";

const prediction_text = text("Here is the segmentation result. You can segment the image yourself using the brush tool, and adjust the segmentation threshold of the result.");
prediction_text.title = "view and adjust"

const upload = imageUpload();
let imageArray = [];
const exampleImage = new Array(100000).fill(0).map(() => Math.random());


//const org_img = new imageDisplay({ imageArray});
const org_img = ScanDisplay(upload.$images)

const imageComponent = new imageOutput({ imageArray: exampleImage, threshold: 0.1});
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
      org_img.updateContrast(val); 
    },
  });
  
  const brightnessSliderComponent = new BrightnessSlider({
    min: 0.2,
    max: 1.2,
    step: 0.01,
    initialValue: 0.7,
    onChange: (val) => {
      console.log("Brightness value:", val);
      org_img.updateBrightness(val); 
    },
  });

  const brushComponent = new brush(upload.$images);

const dash = dashboard({
  title: 'PET Scan Segmentation',
  author: 'Marcelle Doe'
});

dash.page('Upload').use(upload_text, [org_img, contrastSliderComponent, brightnessSliderComponent], brushComponent).sidebar(upload);
dash.page('Prediction').use(prediction_text, [imageComponent, sliderComponent]);
dash.page('Heatmap').use(heatmapy);

dash.show();
