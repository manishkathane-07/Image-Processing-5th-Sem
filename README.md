# Digital Image Processing Virtual Laboratory

**Post Lab Project**  
**Subject:** Image Processing Lab (`N-PECCS502P`)  
**Student Name:** Manish Kathane  
**USN:** CS24091  
**Semester & Branch:** V Semester, B.Tech. CSE (Academic Session 2026–27)  
**Institution:** S. B. Jain Institute of Technology, Management & Research, Nagpur  

---

## 🌟 Overview

This repository hosts the **Digital Image Processing Virtual Laboratory**, an interactive single-page web application featuring **10 dedicated practical modules** covering fundamental and advanced spatial and color image processing techniques.

All operations execute **100% client-side** directly in your browser using HTML5 Canvas 2D and high-performance Typed Arrays (`Uint8ClampedArray`, `Float32Array`). No server backend, Python runtime, or external packages are required to run the laboratory!

---

- **GitHub Repository:** [https://github.com/manishkathane-07/Image-Processing-5th-Sem](https://github.com/manishkathane-07/Image-Processing-5th-Sem)

### Option A: Deploying with Git & Vercel (Recommended)

Your code is already pushed to GitHub! Now complete the final 1-minute step on Vercel:

#### Deploy on Vercel:
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **"Add New..."** &rarr; **"Project"**.
3. Under **"Import Git Repository"**, find **`Image-Processing-5th-Sem`** and click **"Import"**.
4. Leave all settings at their defaults:
   - **Framework Preset:** *Other* (detected automatically via `vercel.json`)
   - **Root Directory:** `./`
5. Click **"Deploy"**.
6. In ~15 seconds, your virtual laboratory will be live at a custom URL like:
   `https://image-processing-5th-sem.vercel.app`

*(Any time you push changes to GitHub via `git push`, Vercel will automatically re-deploy your site!)*

---

### Option B: Deploying directly with Vercel CLI (Instant)

Run this one command directly in PowerShell/Terminal inside `d:\IP\Post lab`:
```bash
npx vercel --prod
```
- When prompted, press `Enter` to confirm:
  - *Set up and deploy?* `y`
  - *Which scope?* (Select your Vercel account)
  - *Link to existing project?* `n`
  - *What’s your project’s name?* (Press Enter or type a name)
  - *In which directory is your code located?* `./`
- Your production URL will be displayed in the terminal!

---

### Option C: Deploying to GitHub Pages
1. Push to GitHub as described above.
2. Go to your repository on **GitHub** &rarr; **Settings** &rarr; **Pages**.
3. Under **Build and deployment** &rarr; **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at: `https://<your-username>.github.io/<your-repo-name>/`

---

## 🧪 Included Practicals (10 Tabs)

| Tab | Practical Topic | Key Operations Implemented |
|---|---|---|
| **Tab 1** | **Formats & Arithmetic/Bitwise** | RGB to Grayscale (ITU-R BT.601), Invert negative, Sepia tone, Brightness Addition/Subtraction with clamping, Alpha blending, Bitwise AND/OR/XOR/NOT, and full 8-Bit-Plane Slicing. |
| **Tab 2** | **2D Geometric Transformations** | Translation ($T_x, T_y$), Rotation ($\theta$), Scaling ($S_x, S_y$), Shearing ($Sh_x, Sh_y$), Reflection (Horizontal/Vertical/Both), and Cropping. |
| **Tab 3** | **Spatial Domain Enhancement** | Histogram Equalization with live intensity histogram plots, Linear Contrast Stretching, Laplacian Spatial Sharpening, Global Thresholding, and Otsu's Thresholding. |
| **Tab 4** | **Spatial Domain Filtering** | Averaging (Box Mean) Filter, Gaussian Filter with configurable $\sigma$, Median Filter with impulsive Salt & Pepper noise removal, and Bilateral edge-preserving filter. |
| **Tab 5** | **Image Inpainting** | Interactive scratch/crack drawing canvas, Alexandru Telea Fast Marching inpainting, and Navier-Stokes fluid isophote transport inpainting. |
| **Tab 6** | **Lossless Image Compression** | Run-Length Encoding (RLE), Huffman variable-length coding, Shannon entropy calculation, file size metrics, and bit-for-bit lossless verification ($MAE = 0$). |
| **Tab 7** | **Morphological Operations** | Erosion, Dilation, Opening, Closing, Morphological Gradient, and Boundary Extraction with Square, Cross, and Disk structuring elements. |
| **Tab 8** | **Object Detection via Correlation** | 2D Normalized Cross-Correlation (NCC) and SSD template matching, detection bounding box, peak confidence score, and 2D thermal correlation response surface heatmap. |
| **Tab 9** | **Color Spaces** | RGB, HSV (Hue-Saturation-Value), YCrCb (Digital TV standard), and CIELAB ($L^*a^*b^*$) with 3 isolated channel views and full-color reconstruction. |
| **Tab 10** | **Edge Detection** | Sobel ($G_x, G_y$), Prewitt ($G_x, G_y$), and complete 4-stage Canny Edge Detector (Gaussian smoothing, gradient orientation, Non-Maximum Suppression, and Hysteresis double-thresholding). |

---

## 📁 Project Structure

```
d:/IP/Post lab/
├── index.html           # Main single-page web app with 10 interactive practical tabs
├── styles.css           # Modern, responsive UI theme and dashboard layout
├── app.js               # Mathematical & algorithmic image processing engine
├── sample-images.js     # Built-in offline test image generators
├── REPORT_CONTENT.md    # Complete academic report content matching college format
└── README.md            # Project overview and GitHub Pages deployment guide
```


