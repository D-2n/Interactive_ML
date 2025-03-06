# Interacting with AI Tumor Segmentation
[Watch the demo video](https://youtu.be/05ca3oepKWk)


Artificial Intelligence (AI) is increasingly being utilized in the medical field, particularly in assisting with diagnostic predictions. However, just like humans, AI is prone to errors—it may mistakenly classify a healthy individual as sick or, even more critically, fail to detect illness in a patient who requires urgent care. In the medical domain, AI is not intended to replace healthcare professionals but rather to serve as an assistive tool, working alongside doctors to enhance decision-making. We propose an application for automatic tumor segmentation in PET scans, allowing medical professionals to interact with the model and refine its performance over time.
> This project is developed as a [Marcelle](https://marcelle.dev) Application

## Scenario
PET scans detect areas in the body with high glucose concentration, as tumors exhibit rapid growth and require increased sugar intake, making them highly visible on these scans. However, certain organs, such as the brain, naturally exhibit high glucose uptake and will also appear prominently on PET images. Additionally, various patient-related factors can lead to glucose-dense areas, including insufficient fasting, recent chemotherapy, colonic activity, or even exposure to cold temperatures during the scan. Our goal is to develop an automated segmentation system capable of distinguishing between these cases, with continuous input and validation from medical experts to improve its accuracy.

## Dataset
For training the model, we utilized a dataset from the Danish National AI Competition 2023. This dataset contains 608 PET scan images, each paired with a corresponding binary label. In these labels, pixels representing tumors are marked as 1 (white), while non-tumor pixels are marked as 0 (black).

## Interface and Proposed Design
<img width="1147" alt="image" src="https://github.com/user-attachments/assets/2df78064-ce81-4680-bce0-01f3dfbba91b" />
<img width="1147" alt="image" src="https://github.com/user-attachments/assets/5a4df16f-adbf-4876-b033-ed62b9f13e04" />


1. In the Marcelle framework, users can interact with the segmentation model by uploading new PET scans through a drag-and-drop interface, and observe a binary label where they can change the **segmentation threshold** with a slider, as well as a black and white image with probabilities of pixels being a tumor.
2. Users can also visualize the tumor probabilities in a more intuitive way using a **heatmap**. The heatmap color-codes the probability levels, with three distinct probability ranges: 0-33%, 33-66%, and 66-100%. Each range is assigned a specific color, making it easy for users to identify regions with varying levels of certainty about being tumor tissue.
3. An additional interactive feature is the ”**Brush**” tool, which allows users to manually annotate tumor regions on the PET scan. This tool enables experts to refine the model’s training by creating new labeled data. These new labels, along with the corresponding PET scans, will be incorporated into the retraining process, further improving the model’s accuracy.
4. The framework also provides a **contrast and brightness adjustment** tool, which lets users modify these settings using sliders. This feature allows users to enhance the visibility of tumors in the PET scans, improving the model’s ability to segment them accurately. 

## Segmentation Model
The segmentation model used in this project is called U-Net. U-Net is a specialized type of convolutional neural network (CNN), commonly used for image segmentation tasks. It follows the structure of an autoencoder, consisting of two main parts: the encoder and the decoder, which are further divided into encoder and decoder blocks. 


## Available Scripts

### npm run dev

Runs the app in the development mode.
Open http://localhost:5173 to view it in the browser.

The page will reload if you make edits.

### npm run build

Builds a static copy of your site to the `dist/` folder.
Your app is ready to be deployed!

## Made By
Marija BRKIC, Vivian LI, Dimitrije ZDRALE, Xintian FU
