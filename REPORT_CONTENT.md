# POST LAB REPORT: DIGITAL IMAGE PROCESSING VIRTUAL LABORATORY

**Course Title:** Image Processing Lab (N-PECCS502P)  
**Semester / Branch:** V Semester, B.Tech. Computer Science & Engineering  
**Academic Session:** 2026–27  
**Student Name:** Manish Kathane  
**USN No.:** CS24091  
**Institution:** S. B. Jain Institute of Technology, Management & Research, Nagpur  
*(An Autonomous Institution Affiliated to Rashtrasant Tukadoji Maharaj Nagpur University, NAAC Accredited with 'A' Grade)*

---

## 1. ABSTRACT

Digital Image Processing (DIP) is a cornerstone discipline in computer science, computer vision, and multimedia systems. Traditional laboratory curricula often rely on isolated script execution in proprietary environments, which limits intuitive understanding of spatial and frequency domain transformations. This Post-Lab project presents the design, mathematical formulation, and full-stack implementation of an interactive, web-based **Digital Image Processing Virtual Laboratory**.

The web application integrates all core syllabus practicals into a responsive, single-page interface comprising 10 dedicated operational modules:
1. Format conversions (RGB, Grayscale, Inversion, Sepia), pixel arithmetic, and bit-plane slicing;
2. 2D affine geometric transformations (Translation, Rotation, Scaling, Shearing, Reflection, Cropping);
3. Spatial domain contrast enhancement, Histogram Equalization with real-time distribution graphs, Laplacian sharpening, and thresholding;
4. Linear and non-linear spatial filters (Averaging, Gaussian, Median with noise removal, Bilateral edge-preserving);
5. Digital image restoration and inpainting via Alexandru Telea (Fast Marching Method) and Navier-Stokes fluid transport partial differential equations;
6. Lossless image compression (Run-Length Encoding and Huffman coding) with Shannon entropy quantification and bit-for-bit fidelity verification;
7. Mathematical morphology (Erosion, Dilation, Opening, Closing, Gradient, Boundary Extraction) across multiple structuring element geometries;
8. Target object detection utilizing 2D Normalized Cross-Correlation (NCC) and Sum of Squared Differences (SSD) with thermal response surface heatmaps;
9. Multi-model color space decomposition (RGB, HSV, YCrCb, CIELAB) and channel isolation;
10. Multi-stage edge detection contrasting Sobel and Prewitt gradient operators with the optimal 4-stage Canny Edge Detector.

The virtual laboratory executes all image processing algorithms client-side with zero server latency using HTML5 Canvas 2D and high-performance typed array buffers (`Uint8ClampedArray`), guaranteeing privacy, cross-platform accessibility, and instant deployment onto static cloud hosting platforms such as GitHub Pages.

---

## 2. INTRODUCTION

Digital images pervade modern technological ecosystems, from medical radiography (MRI, CT scans) and satellite remote sensing to biometric authentication, autonomous navigation, and industrial defect inspection. An image is fundamentally a discrete 2D spatial intensity matrix $f(x, y)$, where spatial coordinates define sampling points and discrete intensity levels characterize quantization.

The primary objective of this Post-Lab project is to bridge theoretical image processing mathematics with an interactive visual workbench. Rather than viewing static console logs or terminal plots, the developed virtual lab enables students, researchers, and instructors to:
- Dynamically manipulate transformation parameters (rotation angles, kernel dimensions, filter variances, and threshold cutoffs) in real time;
- Observe instantaneous side-by-side visual feedback contrasting source input rasters with processed output matrices;
- Validate quantitative metrics including Cumulative Distribution Functions (CDF), compression ratios, space savings percentages, and peak cross-correlation confidence scores;
- Inspect individual color channels, bit planes, and correlation response surfaces to build deep spatial intuition.

By developing this software as a progressive, zero-dependency client-side web application, the tool guarantees universal access across desktops, tablets, and mobile devices without requiring Python runtime installations, OpenCV library compilation, or heavy server architectures.

---

## 3. TECHNOLOGY STACK

The architecture of the Digital Image Processing Virtual Laboratory is built upon standard, high-efficiency web and computational technologies:

- **Front-End User Interface:**
  - **HTML5:** Semantic markup, responsive viewport layout, Canvas 2D graphics containers, accessible input elements, and file upload API.
  - **CSS3 (Modern Flexbox & CSS Grid):** Professional academic dark/light theme, custom styling for sliders, badges, toolbars, cards, and animations.
  - **Font Awesome 6.4:** Vector typography icons for controls, action buttons, and visual cues.

- **Computational & Algorithmic Core:**
  - **JavaScript (ES6+ / Modern ECMAScript):** High-performance client-side image processing engine.
  - **HTML5 Canvas 2D API (`ImageData`, `CanvasRenderingContext2D`):** Direct spatial pixel raster buffer manipulation.
  - **Typed Arrays (`Uint8ClampedArray`, `Float32Array`, `Int32Array`):** Memory-efficient pixel buffer operations avoiding memory allocations during convolution loops.

- **Algorithms Implemented from First Principles:**
  - *Color Space Converters:* ITU-R BT.601 RGB-to-Luminance, Hexcone RGB-to-HSV, Digital TV RGB-to-YCrCb, and CIE $L^*a^*b^*$ via CIE XYZ tristimulus conversion with D65 illuminant adaptation.
  - *Spatial Domain Convolutions:* 2D matrix convolution kernels, separable Gaussian kernels, neighborhood median sorting, and bilateral photometric/spatial distance weighting.
  - *Inpainting Solvers:* Alexandru Telea Fast Marching boundary propagation and Navier-Stokes isophote diffusion approximation.
  - *Data Compression Engine:* Shannon entropy calculation, Run-Length Encoding (RLE) encoder/decoder, and Huffman variable-length coding prefix simulator.
  - *Morphological Engine:* Set-theoretic Minkowski addition and subtraction supporting Square, Cross ($+$), and Euclidean Disk structuring elements.
  - *Correlation Matcher:* 2D Normalized Cross-Correlation (NCC) sliding template matching and thermal jet heatmap color mapping.
  - *Edge Detection Pipeline:* Sobel and Prewitt $3\times3$ gradient operators, Gaussian smoothing, directional Non-Maximum Suppression (NMS), and double-threshold hysteresis edge linking.

- **Hosting & Version Control:**
  - **Git & GitHub:** Distributed version control repository hosting source code, documentation, and version tags.
  - **GitHub Pages / Static CDN:** Zero-cost, high-availability serverless web hosting enabling immediate public access via URL and QR code.
  - **QR Code Generation:** Static QR matrix generation via QRCode-Monkey for physical report embedding.

---

## 4. APPLICATION SCREENSHOTS & EXPERIMENTAL WALKTHROUGH

*(Note for Report Printing: Insert application screenshots captured from the live website under each practical heading, keeping images center-aligned with clear captions.)*

### Practical 1: Image Formats Conversion, Arithmetic & Bitwise Operations
- **Aim:** To convert images between various formats like RGB and Grayscale, perform arithmetic and bitwise operations on images, and observe how these operations affect image data representation.
- **Concept Explained Simply:**
  - *Color to Black-and-White:* A color image blends Red, Green, and Blue light (values from 0 to 255). To convert to grayscale, we don't just take an average; our eyes naturally see green much more brightly than red or blue. Therefore, we use **59% Green + 30% Red + 11% Blue** to create realistic brightness matching human vision.
  - *Brightness Addition & Subtraction:* Adding a constant value shifts every pixel brighter, while subtracting dims the photo. We use saturation clamping so numbers never exceed 255 (pure white) or drop below 0 (pure black).
  - *8-Bit Plane Slicing:* Each pixel's 8 bits can be thought of as an 8-story building. The top floors (Bits 7 & 6) contain the main shapes, contours, and faces. The bottom floor (Bit 0) contains subtle grain and noise, making it the perfect hiding place for digital watermarks and steganography.
- **Observations:** Converting to grayscale reduces image storage from 3 bytes per pixel down to 1 byte without losing structural recognizability. Slicing Bit 7 clearly reveals the main objects, while Bit 0 looks like pure static grain.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 1 - RGB TO GRAYSCALE & 8-BIT PLANE SLICING ]
  Figure 4.1: Tab 1 Interface displaying RGB input, Grayscale conversion, and 8-bit plane decomposition.
  ```

---

### Practical 2: 2-D Geometric Transformation Operations
- **Aim:** Develop programs to apply 2-D geometric transformations on an image: Translation, Rotation, Scaling, Shearing, Reflection, and Cropping.
- **Concept Explained Simply:**
  - *Translation (Shift):* Slides the photo horizontally by X pixels and vertically by Y pixels.
  - *Rotation:* Spins the image around its central pivot point by a chosen angle (e.g., 45° or 90°), commonly used to straighten crooked camera shots.
  - *Scaling:* Zooms in (magnifies) or shrinks the photo while maintaining its proportions.
  - *Shearing (Slant):* Tilts the photo sideways diagonally, exactly like gently pushing the top card in a stacked deck of playing cards.
  - *Reflection (Mirror Flip):* Flips the image like looking in a mirror (horizontal flip for selfie cameras, or vertical upside-down flip).
  - *Cropping:* Cuts away unwanted outer borders to focus directly on the main subject.
- **Observations:** In digital implementation, backward coordinate mapping ensures that every pixel in the new transformed canvas is filled cleanly without empty white gaps or artifacts.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 2 - ROTATION AND SHEARING TRANSFORMATIONS ]
  Figure 4.2: Tab 2 showing 2D affine geometric transformation with adjustable angle and shearing factor.
  ```

---

### Practical 3: Spatial Domain Image Enhancement Techniques
- **Aim:** To study and implement image enhancement techniques in the spatial domain, including Histogram Equalization for contrast improvement, Spatial Filtering (Smoothing and Sharpening), and Intensity Thresholding.
- **Concept Explained Simply:**
  - *Histogram Equalization:* Think of a histogram as a score tally of dark vs light pixels. If a photo was taken in fog or bad lighting, all pixel values are squished into the middle gray tones, making the picture look washed out and muddy. Histogram Equalization takes those squished tones and stretches them evenly across the full range from pure black to pure white. Suddenly, hidden details in shadows and clouds pop out with vibrant contrast!
  - *Spatial Sharpening:* Makes blurry photos look crisp and in-focus. It scans every pixel, compares it to its 4 neighbors (up, down, left, right), and exaggerates the difference where colors change abruptly. Light edges become slightly lighter, and dark edges become slightly darker, making textures and boundaries stand out.
  - *Thresholding & Otsu's Method:* Converts a grayscale image into a clean black-and-white stencil. You pick a cutoff number: anything brighter becomes white, anything darker becomes black. Otsu's method is smart: it automatically calculates the ideal cutoff number on its own without trial and error!
- **Observations:** Washed-out test images show dramatic contrast improvements after Histogram Equalization, reflected in a flat, balanced histogram graph. Otsu thresholding successfully segments foreground objects from backgrounds cleanly.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 3 - HISTOGRAM EQUALIZATION AND HISTOGRAM PLOTS ]
  Figure 4.3: Tab 3 displaying contrast enhancement with before-and-after intensity histograms.
  ```

---

### Practical 4: Spatial Domain Filtering
- **Aim:** Write Python/JavaScript programs to apply different spatial domain filters on a given image: Averaging Filter, Gaussian Filter, Median Filter, and Bilateral Filter.
- **Concept Explained Simply:**
  - *Averaging (Box Mean) Filter:* Blurs the image by replacing each pixel with the uniform average of its neighbors. Simple and fast, but blurs sharp object boundaries.
  - *Gaussian Filter:* A soft, natural blur. Pixels right at the center have high weight, while outer pixels have lower weight (following a bell curve). Mimics natural camera background bokeh.
  - *Median Filter (Noise Destroyer!):* The ultimate cure for "Salt & Pepper" noise (random white and black dots caused by faulty camera sensors). It sorts the neighborhood pixel values and picks the middle (median) number. The extreme white and black dots are thrown out completely, leaving clean edges untouched!
  - *Bilateral Filter (The Smartphone "Beauty Filter"):* The smartest smoothing filter available. It checks both geometric distance and color difference. It smooths flat areas (like skin tone) while instantly stopping at sharp boundaries (like eyes, eyebrows, and lips).
- **Observations:** When 5% Salt & Pepper noise is injected, Averaging and Gaussian filters merely smudge the noise specks into gray patches, whereas the Median filter completely eliminates the noise specks and restores the clean image.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 4 - MEDIAN AND BILATERAL FILTERING ON NOISY IMAGE ]
  Figure 4.4: Tab 4 demonstrating salt-and-pepper noise attenuation using median and bilateral filters.
  ```

---

### Practical 5: Image Inpainting
- **Aim:** Implement methods to remove damaged parts of an image using inpainting methods (Alexandru Telea method and Navier-Stokes method) to restore the image and make it look natural.
- **Concept Explained Simply:**
  - *What is Inpainting:* The digital art of restoring torn, scratched, or damaged parts of an image so the repair blends in invisibly (like Photoshop's Content-Aware Fill).
  - *Alexandru Telea Method:* Starts along the healthy outer boundary of the scratch and marches inward layer-by-layer. It paints the missing pixels using weighted colors from nearby healthy borders, with higher priority given to pixels that align with edge contours. Great for thin scratches, hair, and wire removal.
  - *Navier-Stokes Method:* Uses the fluid physics equations of flowing water! It treats lines of equal brightness like gentle streams of water flowing into the missing gap, ensuring curved boundaries and contours connect seamlessly.
- **Observations:** User-painted scratches and cracks on the interactive canvas are effectively healed. The Telea method delivers fast, clean repairs on thin scratches, while Navier-Stokes preserves continuity across larger damaged areas.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 5 - INTERACTIVE SCRATCH INPAINTING RESTORATION ]
  Figure 4.5: Tab 5 showing damaged scratch canvas and restored output via Telea inpainting.
  ```

---

### Practical 6: Lossless Image Compression
- **Aim:** Implement a coding technique to achieve lossless compression and compare the original and compressed file sizes.
- **Concept Explained Simply:**
  - *Lossless Meaning:* Compressing a file so it takes less storage space and downloads faster, while guaranteeing that when uncompressed, you get back 100% of the original picture bit-for-bit (zero loss of quality).
  - *Run-Length Encoding (RLE):* Instead of writing `White, White, White, White, White, Black, Black`, RLE writes `(5, White), (2, Black)`. On binary graphics, logos, and scanned documents with large blocks of identical color, RLE cuts file size drastically!
  - *Huffman Coding:* Assigns short binary codes to frequent colors and longer codes to rare colors (just like Morse code uses a single dot for the common letter 'E').
  - *Shannon Entropy:* The theoretical minimum limit of bits per pixel required to represent an image without losing information.
- **Observations:** On continuous photographs with high variance, RLE gives modest compression. On segmented and binarized images with repeating runs of color, RLE achieves compression ratios above 4 : 1 (saving over 75% file size). Verification confirms Mean Absolute Error = 0.000000, proving exact bit-for-bit reconstruction.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 6 - LOSSLESS COMPRESSION METRICS DASHBOARD ]
  Figure 4.6: Tab 6 presenting original vs compressed byte sizes, compression ratio, and entropy.
  ```

---

### Practical 7: Morphological Operations on Binary Images
- **Aim:** Perform morphological operations: Erosion, Dilation, Opening, and Closing on binary images to study their effects on object shapes and noise removal.
- **Concept Explained Simply:**
  - *Erosion (Shrink):* Gently eats away the outer boundary of white objects, stripping off outer pixels. Great for peeling away small noise specks and separating two touching objects.
  - *Dilation (Grow):* Expands white objects outward. Great for filling in small internal dark holes and reconnecting broken lines.
  - *Opening (Erode then Dilate):* The master shape cleaner! Completely erases small outer noise bumps without permanently shrinking the main object size.
  - *Closing (Dilate then Erode):* The master hole-filler! Plugs internal holes and bridges small cracks without making the overall object bigger.
  - *Boundary Extraction:* Subtracts the eroded shape from the original shape, leaving only the razor-thin 1-pixel outer outline of the object!
- **Observations:** Morphological Opening eliminates background noise specks while maintaining object geometry. Closing successfully seals interior gaps and pinholes in binary targets.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 7 - MORPHOLOGICAL OPENING AND CLOSING OPERATIONS ]
  Figure 4.7: Tab 7 showing binary morphology with variable structuring elements (Square, Cross, Disk).
  ```

---

### Practical 8: Object Detection using the Correlation Principle
- **Aim:** Develop a program to detect objects using the correlation principle with two user inputs: 1st for the full scene image and 2nd for the target template.
- **Concept Explained Simply:**
  - *Dual Input Architecture:* The system accepts two distinct inputs:
    1. **1st Input (Full Image):** The entire scene or search environment (e.g., a landscape, factory floor, or geometric composition) uploaded by the user or chosen from presets.
    2. **2nd Input (Target Template):** A small cropped object or patch to locate (e.g., a medal logo, door, sun, or custom icon) uploaded by the user or chosen from presets.
  - *How Template Matching Works:* Imagine holding the small target template cutout and sliding it across the full scene photo pixel by pixel, calculating how closely the colors match underneath at every single (X, Y) coordinate.
  - *Normalized Cross-Correlation (NCC):* Scores the similarity on a scale from -1.0 to +1.0 (100% match). Unlike simple subtraction, NCC is immune to shadows and ambient lighting changes.
  - *The Correlation Heatmap:* A 2D thermal surface map where cold blue indicates background, while a bright glowing red/yellow mountain peak marks the detected object's coordinates!
- **Observations:** The dual-input correlation matcher successfully detects both preset templates and user-uploaded custom targets within the full scene, overlaying a green bounding box around the match with peak scores and pixel coordinates.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 8 - DUAL INPUT OBJECT DETECTION AND CORRELATION HEATMAP ]
  Figure 4.8: Tab 8 illustrating target template detection with separate inputs for Full Image and Target Template.
  ```

---

### Practical 9: Color Space Conversions
- **Aim:** Convert images between RGB, HSV, YCrCb, and CIELAB colour spaces, analyzing how colour information is encoded in each.
- **Concept Explained Simply:**
  - *RGB:* Red, Green, Blue matching computer monitors and camera sensors. The downside is that brightness and color are mixed together — if lighting dims, all 3 channels drop at once.
  - *HSV (Hue, Saturation, Value):* Represents color the way humans think! **Hue** is the pure color shade (0° to 360°), **Saturation** is how vivid the color is, and **Value** is brightness. Perfect for tracking colored objects (like a red ball) even when shadows fall on it.
  - *YCrCb:* The standard behind JPEG and digital television. It separates pure brightness (Y) from color differences (Cr and Cb). Since human eyes are sharp with brightness but blurry with color, JPEG compresses Cr and Cb heavily without anyone noticing, saving 50% file size!
  - *CIELAB ($L^*a^*b^*$):* Designed by color scientists so the mathematical distance between two colors equals the exact visual difference perceived by human eyes. Used extensively in paint mixing, textiles, and printing.
- **Observations:** Decomposing into isolated channels vividly reveals how luminance and chrominance are decoupled in HSV and YCrCb, proving why they are superior for computer vision and image compression.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 9 - CHANNEL DECOMPOSITION ACROSS COLOR SPACES ]
  Figure 4.9: Tab 9 showing 3 isolated channel representations across HSV, YCrCb, and CIELAB.
  ```

---

### Practical 10: Edge Detection Techniques
- **Aim:** Detect edges in images with the Canny method and contrast the results with Sobel and Prewitt detectors.
- **Concept Explained Simply:**
  - *What is an Edge:* An edge is a boundary where brightness changes sharply (like where an object ends and the background begins). Finding edges is how computers "see" object outlines, measure shapes, and detect highway lanes.
  - *Sobel & Prewitt:* Classic 1st-generation detectors that measure horizontal and vertical brightness slopes. They are quick, but produce thick, fuzzy, and noisy outlines.
  - *The Canny Edge Detector (The Gold Standard):* Works in 4 disciplined stages:
    1. **Gentle Blur:** Cleans camera sensor noise first with a Gaussian filter.
    2. **Find Gradients:** Computes brightness change speed and angle at every pixel.
    3. **Thinning (Non-Maximum Suppression):** Shaves thick fuzzy lines down to a razor-sharp, 1-pixel-wide line by keeping only the true peak pixel!
    4. **Smart Linking (Hysteresis):** Uses two threshold cutoffs (High and Low). Strong edges are kept, and faint edges are kept only if they connect to a strong edge!
- **Observations:** Sobel and Prewitt produce thick, coarse edge maps with noticeable noise. In contrast, Canny yields clean, connected, single-pixel-wide outlines with superior noise suppression.
- **Screenshot Placeholder:**
  ```
  [ INSERT CENTER-ALIGNED SCREENSHOT: TAB 10 - CANNY VS SOBEL VS PREWITT EDGE DETECTORS ]
  Figure 4.10: Tab 10 contrasting Sobel, Prewitt, and Canny multi-stage edge detection side-by-side.
  ```

---

## 5. CONCLUSION

The **Digital Image Processing Virtual Laboratory** successfully realizes an interactive, robust, and accessible educational platform for studying image processing algorithms. By unifying all 10 laboratory practicals into an intuitive single-page architecture:
1. Theoretical concepts (matrix transformations, spatial convolutions, discrete derivatives, set-theoretic morphology, and information entropy) are substantiated through immediate visual experimentation.
2. The browser-based computational architecture demonstrates that modern web standards (HTML5 Canvas 2D and typed arrays) can perform compute-intensive numerical image processing client-side with minimal latency.
3. The platform eliminates platform dependency, enabling students and evaluators to run, test, and verify algorithms without specialized local environments or expensive server infrastructure.

Future enhancements include WebAssembly (Wasm) acceleration, WebGL shader execution for real-time 4K video processing, and frequency-domain 2D Fast Fourier Transform (FFT) filtering modules.

---

## 6. REFERENCES

1. Gonzalez, R. C., & Woods, R. E. (2018). *Digital Image Processing* (4th ed.). Pearson Education.
2. Pratt, W. K. (2007). *Digital Image Processing: PIKS Scientific Inside* (4th ed.). John Wiley & Sons.
3. Canny, J. (1986). "A Computational Approach to Edge Detection." *IEEE Transactions on Pattern Analysis and Machine Intelligence*, PAMI-8(6), 679–698.
4. Telea, A. (2004). "An Image Inpainting Technique Based on the Fast Marching Method." *Journal of Graphics Tools*, 9(1), 23–34.
5. Bertalmio, M., Bertozzi, A. L., & Sapiro, G. (2001). "Navier-Stokes, Fluid Dynamics, and Image and Video Inpainting." *IEEE Computer Society Conference on Computer Vision and Pattern Recognition (CVPR)*.
6. Otsu, N. (1979). "A Threshold Selection Method from Gray-Level Histograms." *IEEE Transactions on Systems, Man, and Cybernetics*, 9(1), 62–66.
7. Bradski, G., & Kaehler, A. (2008). *Learning OpenCV: Computer Vision with the OpenCV Library*. O'Reilly Media.
8. MDN Web Docs. "Canvas API: Pixel manipulation with Canvas & ImageData." Mozilla Developer Network.
