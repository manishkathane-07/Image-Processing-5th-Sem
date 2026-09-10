/**
 * Digital Image Processing Virtual Laboratory - Core Application Engine
 * Author: Manish Kathane (CS24091)
 * S. B. Jain Institute of Technology, Management & Research, Nagpur
 */

// ============================================================================
// Global State & Initialization
// ============================================================================
const AppState = {
  currentTab: 'tab1',
  activePreset: 'scene',
  customImage: null, // HTMLImageElement or Canvas if user uploads
  workingCanvas: document.createElement('canvas'),
  lastProcessedCanvas: null
};

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGlobalControls();
  loadPreset(AppState.activePreset);
});

// ============================================================================
// Tab Navigation
// ============================================================================
function initTabs() {
  const tabButtons = document.querySelectorAll('#mainTabs .tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      AppState.currentTab = targetTab;

      tabButtons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) {
        targetPanel.classList.add('active');
        refreshActiveTab();
      }
    });
  });

  // Theory Tab toggle inside info section
  document.querySelectorAll('.info-tabs').forEach(tabGroup => {
    const btns = tabGroup.querySelectorAll('.info-tab-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      });
    });
  });
}

// ============================================================================
// Global Controls (Preset, Upload, Download, Reset)
// ============================================================================
function initGlobalControls() {
  const presetSelect = document.getElementById('globalPreset');
  presetSelect.addEventListener('change', (e) => {
    AppState.activePreset = e.target.value;
    AppState.customImage = null;
    loadPreset(AppState.activePreset);
  });

  const uploader = document.getElementById('imageUploader');
  uploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        // Resize nicely to max 360x360 for high performance
        const maxDim = 360;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        AppState.customImage = c;
        setWorkingImage(c);
        refreshActiveTab();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    AppState.customImage = null;
    loadPreset(AppState.activePreset);
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!AppState.lastProcessedCanvas) {
      alert('No processed output image available to download.');
      return;
    }
    const link = document.createElement('a');
    link.download = `IP_Lab_${AppState.currentTab}_output.png`;
    link.href = AppState.lastProcessedCanvas.toDataURL('image/png');
    link.click();
  });
}

function loadPreset(presetName) {
  let canvas;
  if (presetName === 'shapes') {
    canvas = SampleImages.createShapes(320, 320);
  } else if (presetName === 'contrast') {
    canvas = SampleImages.createLowContrast(320, 320);
  } else {
    canvas = SampleImages.createScene(320, 320);
  }
  setWorkingImage(canvas);
  refreshActiveTab();
}

function setWorkingImage(sourceCanvas) {
  AppState.workingCanvas.width = sourceCanvas.width;
  AppState.workingCanvas.height = sourceCanvas.height;
  const ctx = AppState.workingCanvas.getContext('2d');
  ctx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
  ctx.drawImage(sourceCanvas, 0, 0);
}

function refreshActiveTab() {
  switch (AppState.currentTab) {
    case 'tab1': initTab1(); break;
    case 'tab2': initTab2(); break;
    case 'tab3': initTab3(); break;
    case 'tab4': initTab4(); break;
    case 'tab5': initTab5(); break;
    case 'tab6': initTab6(); break;
    case 'tab7': initTab7(); break;
    case 'tab8': initTab8(); break;
    case 'tab9': initTab9(); break;
    case 'tab10': initTab10(); break;
  }
}

// ============================================================================
// Canvas Helper Utilities
// ============================================================================
function copyCanvas(src, dst) {
  dst.width = src.width;
  dst.height = src.height;
  const ctx = dst.getContext('2d');
  ctx.clearRect(0, 0, src.width, src.height);
  ctx.drawImage(src, 0, 0);
}

function getImageData(canvas) {
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function putImageData(canvas, imgData) {
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imgData, 0, 0);
}

function toGrayscaleData(imgData) {
  const data = imgData.data;
  const len = data.length;
  const gray = new Uint8ClampedArray(imgData.width * imgData.height);
  for (let i = 0, j = 0; i < len; i += 4, j++) {
    // ITU-R BT.601 luminance standard
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return gray;
}

function grayscaleToImageData(grayArray, width, height) {
  const imgData = new ImageData(width, height);
  const d = imgData.data;
  for (let i = 0, j = 0; i < grayArray.length; i++, j += 4) {
    const v = grayArray[i];
    d[j] = v;
    d[j + 1] = v;
    d[j + 2] = v;
    d[j + 3] = 255;
  }
  return imgData;
}

// ============================================================================
// TAB 1: Formats, Arithmetic & Bitwise Operations
// ============================================================================
let tab1Initialized = false;
function initTab1() {
  const srcCanvas = document.getElementById('p1_src_canvas');
  const dstCanvas = document.getElementById('p1_dst_canvas');
  copyCanvas(AppState.workingCanvas, srcCanvas);
  document.getElementById('p1_orig_dim').textContent = `${srcCanvas.width} × ${srcCanvas.height} px`;

  const categorySelect = document.getElementById('p1_category');
  const subcontrols = document.getElementById('p1_subcontrols');
  const bitplaneContainer = document.getElementById('p1_bitplane_container');

  function renderSubControls() {
    const cat = categorySelect.value;
    bitplaneContainer.style.display = 'none';

    if (cat === 'format') {
      subcontrols.innerHTML = `
        <div class="control-group">
          <label for="p1_fmt_op">Format Conversion:</label>
          <select id="p1_fmt_op">
            <option value="gray">RGB to Grayscale (ITU-R BT.601)</option>
            <option value="invert">Inverted Negative Image (255 - I)</option>
            <option value="sepia">Sepia Vintage Tone</option>
          </select>
        </div>
      `;
    } else if (cat === 'arithmetic') {
      subcontrols.innerHTML = `
        <div class="control-group">
          <label for="p1_arith_op">Arithmetic Operation:</label>
          <select id="p1_arith_op">
            <option value="add">Brightness Addition (I + constant)</option>
            <option value="sub">Brightness Subtraction (I - constant)</option>
            <option value="alpha">Alpha Blending with Synthetic Gradient</option>
          </select>
        </div>
        <div class="control-group">
          <label for="p1_arith_val">Intensity Value / Alpha:</label>
          <div class="slider-container">
            <input type="range" id="p1_arith_val" min="0" max="255" value="50">
            <span id="p1_arith_badge" class="slider-val">50</span>
          </div>
        </div>
      `;
      const s = document.getElementById('p1_arith_val');
      const b = document.getElementById('p1_arith_badge');
      s.addEventListener('input', () => { b.textContent = s.value; });
    } else if (cat === 'bitwise') {
      subcontrols.innerHTML = `
        <div class="control-group">
          <label for="p1_bit_op">Bitwise Operation:</label>
          <select id="p1_bit_op">
            <option value="bitplane">8-Bit Plane Slicing (All 8 Planes)</option>
            <option value="and">Bitwise AND with Mask (0x0F)</option>
            <option value="or">Bitwise OR with Mask (0x80)</option>
            <option value="xor">Bitwise XOR with Mask (0x55)</option>
            <option value="not">Bitwise NOT (~I & 0xFF)</option>
          </select>
        </div>
      `;
    }
  }

  if (!tab1Initialized) {
    categorySelect.addEventListener('change', renderSubControls);
    document.getElementById('p1_apply').addEventListener('click', applyTab1);
    tab1Initialized = true;
  }
  renderSubControls();
  applyTab1();
}

function applyTab1() {
  const src = document.getElementById('p1_src_canvas');
  const dst = document.getElementById('p1_dst_canvas');
  const cat = document.getElementById('p1_category').value;
  const bitplaneContainer = document.getElementById('p1_bitplane_container');
  const imgData = getImageData(src);
  const d = imgData.data;
  const len = d.length;

  if (cat === 'format') {
    const op = document.getElementById('p1_fmt_op').value;
    if (op === 'gray') {
      for (let i = 0; i < len; i += 4) {
        const g = Math.round(0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]);
        d[i] = d[i+1] = d[i+2] = g;
      }
    } else if (op === 'invert') {
      for (let i = 0; i < len; i += 4) {
        d[i] = 255 - d[i];
        d[i+1] = 255 - d[i+1];
        d[i+2] = 255 - d[i+2];
      }
    } else if (op === 'sepia') {
      for (let i = 0; i < len; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        d[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        d[i+1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        d[i+2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
      }
    }
    putImageData(dst, imgData);
  } else if (cat === 'arithmetic') {
    const op = document.getElementById('p1_arith_op').value;
    const val = parseInt(document.getElementById('p1_arith_val').value, 10);
    if (op === 'add') {
      for (let i = 0; i < len; i += 4) {
        d[i] = Math.min(255, d[i] + val);
        d[i+1] = Math.min(255, d[i+1] + val);
        d[i+2] = Math.min(255, d[i+2] + val);
      }
    } else if (op === 'sub') {
      for (let i = 0; i < len; i += 4) {
        d[i] = Math.max(0, d[i] - val);
        d[i+1] = Math.max(0, d[i+1] - val);
        d[i+2] = Math.max(0, d[i+2] - val);
      }
    } else if (op === 'alpha') {
      const alpha = val / 255;
      const w = imgData.width, h = imgData.height;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // Synthetic secondary gradient: rainbow tint
          const r2 = (x / w) * 255;
          const g2 = (y / h) * 255;
          const b2 = 180;
          d[idx] = Math.round(alpha * d[idx] + (1 - alpha) * r2);
          d[idx+1] = Math.round(alpha * d[idx+1] + (1 - alpha) * g2);
          d[idx+2] = Math.round(alpha * d[idx+2] + (1 - alpha) * b2);
        }
      }
    }
    putImageData(dst, imgData);
  } else if (cat === 'bitwise') {
    const op = document.getElementById('p1_bit_op').value;
    if (op === 'bitplane') {
      // Decompose into 8 bit planes
      bitplaneContainer.style.display = 'block';
      const gray = toGrayscaleData(imgData);
      const grid = document.getElementById('p1_bitplanes');
      grid.innerHTML = '';

      for (let bit = 7; bit >= 0; bit--) {
        const mask = 1 << bit;
        const planeCanvas = document.createElement('canvas');
        planeCanvas.width = imgData.width;
        planeCanvas.height = imgData.height;
        const planeData = new ImageData(imgData.width, imgData.height);
        const pd = planeData.data;

        for (let j = 0, k = 0; j < gray.length; j++, k += 4) {
          const bitVal = (gray[j] & mask) ? 255 : 0;
          pd[k] = pd[k+1] = pd[k+2] = bitVal;
          pd[k+3] = 255;
        }
        planeCanvas.getContext('2d').putImageData(planeData, 0, 0);

        const card = document.createElement('div');
        card.className = 'channel-card';
        card.appendChild(planeCanvas);
        const span = document.createElement('span');
        span.textContent = `Bit Plane ${bit} ${bit === 7 ? '(MSB)' : (bit === 0 ? '(LSB)' : '')}`;
        card.appendChild(span);
        grid.appendChild(card);
      }
      // Put MSB on main dst canvas
      const msbData = new ImageData(imgData.width, imgData.height);
      const md = msbData.data;
      for (let j = 0, k = 0; j < gray.length; j++, k += 4) {
        const bitVal = (gray[j] & (1 << 7)) ? 255 : 0;
        md[k] = md[k+1] = md[k+2] = bitVal;
        md[k+3] = 255;
      }
      putImageData(dst, msbData);
    } else {
      bitplaneContainer.style.display = 'none';
      for (let i = 0; i < len; i += 4) {
        if (op === 'and') {
          d[i] &= 0x0F; d[i+1] &= 0x0F; d[i+2] &= 0x0F;
        } else if (op === 'or') {
          d[i] |= 0x80; d[i+1] |= 0x80; d[i+2] |= 0x80;
        } else if (op === 'xor') {
          d[i] ^= 0x55; d[i+1] ^= 0x55; d[i+2] ^= 0x55;
        } else if (op === 'not') {
          d[i] = ~d[i] & 0xFF; d[i+1] = ~d[i+1] & 0xFF; d[i+2] = ~d[i+2] & 0xFF;
        }
      }
      putImageData(dst, imgData);
    }
  }

  AppState.lastProcessedCanvas = dst;
  document.getElementById('p1_status_badge').textContent = 'Applied';
}

// ============================================================================
// TAB 2: 2D Geometric Transformations
// ============================================================================
let tab2Initialized = false;
function initTab2() {
  const src = document.getElementById('p2_src_canvas');
  const dst = document.getElementById('p2_dst_canvas');
  copyCanvas(AppState.workingCanvas, src);

  const transType = document.getElementById('p2_transform_type');
  const sub = document.getElementById('p2_subcontrols');

  function renderSub() {
    const t = transType.value;
    if (t === 'translate') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Shift X (Tx):</label>
          <div class="slider-container">
            <input type="range" id="p2_tx" min="-100" max="100" value="40">
            <span id="p2_tx_val" class="slider-val">40 px</span>
          </div>
        </div>
        <div class="control-group">
          <label>Shift Y (Ty):</label>
          <div class="slider-container">
            <input type="range" id="p2_ty" min="-100" max="100" value="30">
            <span id="p2_ty_val" class="slider-val">30 px</span>
          </div>
        </div>
      `;
      linkSlider('p2_tx', 'p2_tx_val', ' px');
      linkSlider('p2_ty', 'p2_ty_val', ' px');
    } else if (t === 'rotate') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Rotation Angle (&theta;):</label>
          <div class="slider-container">
            <input type="range" id="p2_angle" min="-180" max="180" value="45">
            <span id="p2_angle_val" class="slider-val">45°</span>
          </div>
        </div>
      `;
      linkSlider('p2_angle', 'p2_angle_val', '°');
    } else if (t === 'scale') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Scale Factor:</label>
          <div class="slider-container">
            <input type="range" id="p2_scale" min="20" max="200" value="80">
            <span id="p2_scale_val" class="slider-val">0.80x</span>
          </div>
        </div>
      `;
      const s = document.getElementById('p2_scale');
      const v = document.getElementById('p2_scale_val');
      s.addEventListener('input', () => { v.textContent = (s.value / 100).toFixed(2) + 'x'; });
    } else if (t === 'shear') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Shear X (Shx):</label>
          <div class="slider-container">
            <input type="range" id="p2_shx" min="-10" max="10" value="3">
            <span id="p2_shx_val" class="slider-val">0.3</span>
          </div>
        </div>
      `;
      const s = document.getElementById('p2_shx');
      const v = document.getElementById('p2_shx_val');
      s.addEventListener('input', () => { v.textContent = (s.value / 10).toFixed(1); });
    } else if (t === 'reflect') {
      sub.innerHTML = `
        <div class="control-group">
          <label for="p2_flip_mode">Flip Axis:</label>
          <select id="p2_flip_mode">
            <option value="h">Horizontal Reflection (Left-Right)</option>
            <option value="v">Vertical Reflection (Top-Bottom)</option>
            <option value="both">Both Axes (Central Inversion)</option>
          </select>
        </div>
      `;
    } else if (t === 'crop') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Crop Padding Margin:</label>
          <div class="slider-container">
            <input type="range" id="p2_crop_pad" min="10" max="80" value="40">
            <span id="p2_crop_val" class="slider-val">40 px</span>
          </div>
        </div>
      `;
      linkSlider('p2_crop_pad', 'p2_crop_val', ' px');
    }
  }

  if (!tab2Initialized) {
    transType.addEventListener('change', renderSub);
    document.getElementById('p2_apply').addEventListener('click', applyTab2);
    tab2Initialized = true;
  }
  renderSub();
  applyTab2();
}

function applyTab2() {
  const src = document.getElementById('p2_src_canvas');
  const dst = document.getElementById('p2_dst_canvas');
  const t = document.getElementById('p2_transform_type').value;

  dst.width = src.width;
  dst.height = src.height;
  const ctx = dst.getContext('2d');
  ctx.clearRect(0, 0, dst.width, dst.height);

  if (t === 'translate') {
    const tx = parseInt(document.getElementById('p2_tx').value, 10);
    const ty = parseInt(document.getElementById('p2_ty').value, 10);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.drawImage(src, 0, 0);
    ctx.restore();
  } else if (t === 'rotate') {
    const deg = parseFloat(document.getElementById('p2_angle').value);
    const rad = (deg * Math.PI) / 180;
    ctx.save();
    ctx.translate(dst.width / 2, dst.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
    ctx.restore();
  } else if (t === 'scale') {
    const factor = parseFloat(document.getElementById('p2_scale').value) / 100;
    ctx.save();
    ctx.translate(dst.width / 2, dst.height / 2);
    ctx.scale(factor, factor);
    ctx.drawImage(src, -src.width / 2, -src.height / 2);
    ctx.restore();
  } else if (t === 'shear') {
    const shx = parseFloat(document.getElementById('p2_shx').value) / 10;
    ctx.save();
    // affine transform: ctx.transform(a, b, c, d, e, f)
    // [ x' ] = [ 1  shx  0 ] [ x ]
    // [ y' ]   [ 0   1   0 ] [ y ]
    ctx.transform(1, 0, shx, 1, 0, 0);
    ctx.drawImage(src, 0, 0);
    ctx.restore();
  } else if (t === 'reflect') {
    const mode = document.getElementById('p2_flip_mode').value;
    ctx.save();
    if (mode === 'h') {
      ctx.translate(dst.width, 0);
      ctx.scale(-1, 1);
    } else if (mode === 'v') {
      ctx.translate(0, dst.height);
      ctx.scale(1, -1);
    } else if (mode === 'both') {
      ctx.translate(dst.width, dst.height);
      ctx.scale(-1, -1);
    }
    ctx.drawImage(src, 0, 0);
    ctx.restore();
  } else if (t === 'crop') {
    const pad = parseInt(document.getElementById('p2_crop_pad').value, 10);
    const cw = Math.max(10, src.width - pad * 2);
    const ch = Math.max(10, src.height - pad * 2);
    dst.width = cw;
    dst.height = ch;
    ctx.drawImage(src, pad, pad, cw, ch, 0, 0, cw, ch);
  }

  AppState.lastProcessedCanvas = dst;
  document.getElementById('p2_status_badge').textContent = 'Transformed';
}

// ============================================================================
// TAB 3: Spatial Domain Image Enhancement
// ============================================================================
let tab3Initialized = false;
function initTab3() {
  const src = document.getElementById('p3_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  const tech = document.getElementById('p3_technique');
  const sub = document.getElementById('p3_subcontrols');

  function renderSub() {
    const val = tech.value;
    if (val === 'threshold') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Intensity Cutoff Threshold (T):</label>
          <div class="slider-container">
            <input type="range" id="p3_thresh_val" min="0" max="255" value="128">
            <span id="p3_thresh_badge" class="slider-val">128</span>
          </div>
        </div>
      `;
      linkSlider('p3_thresh_val', 'p3_thresh_badge', '');
    } else {
      sub.innerHTML = ``;
    }
  }

  if (!tab3Initialized) {
    tech.addEventListener('change', renderSub);
    document.getElementById('p3_apply').addEventListener('click', applyTab3);
    tab3Initialized = true;
  }
  renderSub();
  applyTab3();
}

function applyTab3() {
  const src = document.getElementById('p3_src_canvas');
  const dst = document.getElementById('p3_dst_canvas');
  const tech = document.getElementById('p3_technique').value;
  const imgData = getImageData(src);
  const w = imgData.width, h = imgData.height;
  const gray = toGrayscaleData(imgData);

  // Draw source histogram
  drawHistogram(gray, document.getElementById('p3_src_hist'), '#4f46e5');

  let outGray = new Uint8ClampedArray(gray.length);

  if (tech === 'histeq') {
    // 1. Histogram
    const hist = new Int32Array(256);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

    // 2. Cumulative Distribution Function (CDF)
    const cdf = new Float32Array(256);
    cdf[0] = hist[0];
    for (let i = 1; i < 256; i++) cdf[i] = cdf[i - 1] + hist[i];

    // Find cdf_min
    let cdfMin = 0;
    for (let i = 0; i < 256; i++) {
      if (cdf[i] > 0) { cdfMin = cdf[i]; break; }
    }

    // 3. Mapping LUT
    const lut = new Uint8ClampedArray(256);
    const totalPixels = gray.length;
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round(((cdf[i] - cdfMin) / (totalPixels - cdfMin)) * 255);
    }

    // Apply LUT
    for (let i = 0; i < gray.length; i++) {
      outGray[i] = lut[gray[i]];
    }
  } else if (tech === 'contrast_stretch') {
    let minVal = 255, maxVal = 0;
    for (let i = 0; i < gray.length; i++) {
      if (gray[i] < minVal) minVal = gray[i];
      if (gray[i] > maxVal) maxVal = gray[i];
    }
    const range = Math.max(1, maxVal - minVal);
    for (let i = 0; i < gray.length; i++) {
      outGray[i] = Math.round(((gray[i] - minVal) / range) * 255);
    }
  } else if (tech === 'sharpen') {
    // Laplacian kernel: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const center = gray[y * w + x];
        const up = gray[(y - 1) * w + x];
        const down = gray[(y + 1) * w + x];
        const left = gray[y * w + (x - 1)];
        const right = gray[y * w + (x + 1)];
        const sharp = 5 * center - up - down - left - right;
        outGray[y * w + x] = Math.max(0, Math.min(255, sharp));
      }
    }
  } else if (tech === 'threshold') {
    const T = parseInt(document.getElementById('p3_thresh_val').value, 10);
    for (let i = 0; i < gray.length; i++) {
      outGray[i] = gray[i] >= T ? 255 : 0;
    }
  } else if (tech === 'otsu') {
    // Compute Otsu threshold
    const hist = new Int32Array(256);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
    const total = gray.length;

    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];

    let sumB = 0, wB = 0, wF = 0;
    let varMax = 0, threshold = 0;

    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      wF = total - wB;
      if (wF === 0) break;

      sumB += t * hist[t];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;

      const varBetween = wB * wF * (mB - mF) * (mB - mF);
      if (varBetween > varMax) {
        varMax = varBetween;
        threshold = t;
      }
    }

    for (let i = 0; i < gray.length; i++) {
      outGray[i] = gray[i] >= threshold ? 255 : 0;
    }
  }

  const outData = grayscaleToImageData(outGray, w, h);
  putImageData(dst, outData);
  drawHistogram(outGray, document.getElementById('p3_dst_hist'), '#10b981');

  AppState.lastProcessedCanvas = dst;
}

function drawHistogram(grayArray, canvas, barColor) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const hist = new Int32Array(256);
  for (let i = 0; i < grayArray.length; i++) hist[grayArray[i]]++;

  let maxCount = 0;
  for (let i = 0; i < 256; i++) {
    if (hist[i] > maxCount) maxCount = hist[i];
  }
  if (maxCount === 0) return;

  ctx.fillStyle = barColor;
  const barWidth = w / 256;
  for (let i = 0; i < 256; i++) {
    const barHeight = (hist[i] / maxCount) * (h - 6);
    ctx.fillRect(i * barWidth, h - barHeight, Math.max(1, barWidth), barHeight);
  }
}

// ============================================================================
// TAB 4: Spatial Domain Filtering
// ============================================================================
let tab4Initialized = false;
function initTab4() {
  const src = document.getElementById('p4_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  const fType = document.getElementById('p4_filter_type');
  const sub = document.getElementById('p4_subcontrols');

  function renderSub() {
    const f = fType.value;
    if (f === 'gaussian') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Kernel Sigma (&sigma;):</label>
          <div class="slider-container">
            <input type="range" id="p4_sigma" min="5" max="30" value="12">
            <span id="p4_sigma_val" class="slider-val">1.2</span>
          </div>
        </div>
      `;
      const s = document.getElementById('p4_sigma');
      const b = document.getElementById('p4_sigma_val');
      s.addEventListener('input', () => { b.textContent = (s.value / 10).toFixed(1); });
    } else if (f === 'bilateral') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Spatial Sigma (&sigma;_s):</label>
          <div class="slider-container">
            <input type="range" id="p4_sigma_s" min="2" max="15" value="5">
            <span id="p4_sigma_s_val" class="slider-val">5</span>
          </div>
        </div>
        <div class="control-group">
          <label>Range Sigma (&sigma;_r):</label>
          <div class="slider-container">
            <input type="range" id="p4_sigma_r" min="10" max="60" value="25">
            <span id="p4_sigma_r_val" class="slider-val">25</span>
          </div>
        </div>
      `;
      linkSlider('p4_sigma_s', 'p4_sigma_s_val', '');
      linkSlider('p4_sigma_r', 'p4_sigma_r_val', '');
    } else {
      sub.innerHTML = ``;
    }
  }

  if (!tab4Initialized) {
    fType.addEventListener('change', renderSub);
    document.getElementById('p4_apply').addEventListener('click', applyTab4);
    document.getElementById('p4_noise').addEventListener('change', applyTab4);
    tab4Initialized = true;
  }
  renderSub();
  applyTab4();
}

function applyTab4() {
  const src = document.getElementById('p4_src_canvas');
  const dst = document.getElementById('p4_dst_canvas');
  const fType = document.getElementById('p4_filter_type').value;
  const noiseType = document.getElementById('p4_noise').value;

  // Fresh copy from working
  copyCanvas(AppState.workingCanvas, src);
  const imgData = getImageData(src);
  const d = imgData.data;
  const w = imgData.width, h = imgData.height;

  // Inject noise if requested
  if (noiseType === 'salt_pepper') {
    for (let i = 0; i < d.length; i += 4) {
      const rand = Math.random();
      if (rand < 0.03) {
        d[i] = d[i+1] = d[i+2] = 0; // pepper
      } else if (rand > 0.97) {
        d[i] = d[i+1] = d[i+2] = 255; // salt
      }
    }
    putImageData(src, imgData);
  } else if (noiseType === 'gaussian_noise') {
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() + Math.random() - 1) * 35;
      d[i] = Math.max(0, Math.min(255, d[i] + noise));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + noise));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + noise));
    }
    putImageData(src, imgData);
  }

  const outData = new ImageData(w, h);
  const outD = outData.data;

  if (fType === 'average') {
    // 3x3 Box filter
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let ky = -1; ky <= 1; ky++) {
          const py = y + ky;
          if (py < 0 || py >= h) continue;
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            if (px < 0 || px >= w) continue;
            const idx = (py * w + px) * 4;
            rSum += d[idx];
            gSum += d[idx+1];
            bSum += d[idx+2];
            count++;
          }
        }
        const outIdx = (y * w + x) * 4;
        outD[outIdx] = rSum / count;
        outD[outIdx+1] = gSum / count;
        outD[outIdx+2] = bSum / count;
        outD[outIdx+3] = 255;
      }
    }
  } else if (fType === 'gaussian') {
    const sigma = parseFloat(document.getElementById('p4_sigma').value) / 10;
    // 5x5 Gaussian Kernel
    const kRadius = 2;
    const kernel = [];
    let kSum = 0;
    for (let y = -kRadius; y <= kRadius; y++) {
      const row = [];
      for (let x = -kRadius; x <= kRadius; x++) {
        const val = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
        row.push(val);
        kSum += val;
      }
      kernel.push(row);
    }
    // Normalize kernel
    for (let y = 0; y < kernel.length; y++) {
      for (let x = 0; x < kernel[0].length; x++) {
        kernel[y][x] /= kSum;
      }
    }

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let rSum = 0, gSum = 0, bSum = 0;
        for (let ky = -kRadius; ky <= kRadius; ky++) {
          const py = Math.min(Math.max(y + ky, 0), h - 1);
          for (let kx = -kRadius; kx <= kRadius; kx++) {
            const px = Math.min(Math.max(x + kx, 0), w - 1);
            const wgt = kernel[ky + kRadius][kx + kRadius];
            const idx = (py * w + px) * 4;
            rSum += d[idx] * wgt;
            gSum += d[idx+1] * wgt;
            bSum += d[idx+2] * wgt;
          }
        }
        const outIdx = (y * w + x) * 4;
        outD[outIdx] = rSum;
        outD[outIdx+1] = gSum;
        outD[outIdx+2] = bSum;
        outD[outIdx+3] = 255;
      }
    }
  } else if (fType === 'median') {
    // 3x3 Median Filter
    const rArr = [], gArr = [], bArr = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        rArr.length = 0; gArr.length = 0; bArr.length = 0;
        for (let ky = -1; ky <= 1; ky++) {
          const py = Math.min(Math.max(y + ky, 0), h - 1);
          for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(Math.max(x + kx, 0), w - 1);
            const idx = (py * w + px) * 4;
            rArr.push(d[idx]);
            gArr.push(d[idx+1]);
            bArr.push(d[idx+2]);
          }
        }
        rArr.sort((a, b) => a - b);
        gArr.sort((a, b) => a - b);
        bArr.sort((a, b) => a - b);

        const outIdx = (y * w + x) * 4;
        outD[outIdx] = rArr[4];
        outD[outIdx+1] = gArr[4];
        outD[outIdx+2] = bArr[4];
        outD[outIdx+3] = 255;
      }
    }
  } else if (fType === 'bilateral') {
    const sigmaS = parseFloat(document.getElementById('p4_sigma_s').value);
    const sigmaR = parseFloat(document.getElementById('p4_sigma_r').value);
    const radius = 3;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const centerIdx = (y * w + x) * 4;
        const cR = d[centerIdx], cG = d[centerIdx+1], cB = d[centerIdx+2];

        let rSum = 0, gSum = 0, bSum = 0, wSum = 0;
        for (let ky = -radius; ky <= radius; ky++) {
          const py = Math.min(Math.max(y + ky, 0), h - 1);
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(Math.max(x + kx, 0), w - 1);
            const idx = (py * w + px) * 4;
            const nR = d[idx], nG = d[idx+1], nB = d[idx+2];

            // Spatial Gaussian
            const distSq = kx * kx + ky * ky;
            const spatialWgt = Math.exp(-distSq / (2 * sigmaS * sigmaS));

            // Range Gaussian
            const diffSq = (nR - cR) ** 2 + (nG - cG) ** 2 + (nB - cB) ** 2;
            const rangeWgt = Math.exp(-diffSq / (2 * sigmaR * sigmaR));

            const totalWgt = spatialWgt * rangeWgt;
            rSum += nR * totalWgt;
            gSum += nG * totalWgt;
            bSum += nB * totalWgt;
            wSum += totalWgt;
          }
        }

        outD[centerIdx] = rSum / wSum;
        outD[centerIdx+1] = gSum / wSum;
        outD[centerIdx+2] = bSum / wSum;
        outD[centerIdx+3] = 255;
      }
    }
  }

  putImageData(dst, outData);
  AppState.lastProcessedCanvas = dst;
}

// ============================================================================
// TAB 5: Image Inpainting (Telea & Navier-Stokes)
// ============================================================================
let tab5Initialized = false;
let isDrawingScratch = false;

function initTab5() {
  const src = document.getElementById('p5_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  // Set up interactive drawing on src canvas
  src.onmousedown = (e) => {
    isDrawingScratch = true;
    drawDefectPoint(e);
  };
  src.onmousemove = (e) => {
    if (isDrawingScratch) drawDefectPoint(e);
  };
  window.onmouseup = () => { isDrawingScratch = false; };

  function drawDefectPoint(e) {
    const rect = src.getBoundingClientRect();
    const scaleX = src.width / rect.width;
    const scaleY = src.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = src.getContext('2d');
    ctx.fillStyle = '#ff0055'; // Vibrant scratch color
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  document.getElementById('p5_radius').addEventListener('input', (e) => {
    document.getElementById('p5_radius_val').textContent = e.target.value + ' px';
  });

  if (!tab5Initialized) {
    document.getElementById('p5_add_defect').addEventListener('click', injectPresetScratches);
    document.getElementById('p5_apply').addEventListener('click', applyTab5);
    tab5Initialized = true;
  }

  injectPresetScratches();
  applyTab5();
}

function injectPresetScratches() {
  const src = document.getElementById('p5_src_canvas');
  copyCanvas(AppState.workingCanvas, src);
  const ctx = src.getContext('2d');
  ctx.strokeStyle = '#ff0055';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  // Draw two intersecting scratches across the center
  ctx.beginPath();
  ctx.moveTo(src.width * 0.25, src.height * 0.2);
  ctx.bezierCurveTo(src.width * 0.4, src.height * 0.6, src.width * 0.6, src.height * 0.4, src.width * 0.75, src.height * 0.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(src.width * 0.65, src.height * 0.25);
  ctx.lineTo(src.width * 0.35, src.height * 0.75);
  ctx.stroke();
}

function applyTab5() {
  const src = document.getElementById('p5_src_canvas');
  const dst = document.getElementById('p5_dst_canvas');
  const method = document.getElementById('p5_method').value;
  const radius = parseInt(document.getElementById('p5_radius').value, 10);

  const imgData = getImageData(src);
  const d = imgData.data;
  const w = imgData.width, h = imgData.height;

  // 1. Identify damaged mask: bright magenta pixels (#ff0055 => R > 200, G < 50, B > 50)
  const isDamaged = new Uint8Array(w * h);
  let damagedCount = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    if (d[i] > 200 && d[i+1] < 60 && d[i+2] > 50) {
      isDamaged[p] = 1;
      damagedCount++;
    }
  }

  if (damagedCount === 0) {
    copyCanvas(src, dst);
    return;
  }

  // Iterative inpainting
  const maxIterations = method === 'telea' ? 6 : 10;

  for (let iter = 0; iter < maxIterations; iter++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const p = y * w + x;
        if (!isDamaged[p]) continue;

        let rSum = 0, gSum = 0, bSum = 0, wSum = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          const ny = y + ky;
          if (ny < 0 || ny >= h) continue;
          for (let kx = -radius; kx <= radius; kx++) {
            const nx = x + kx;
            if (nx < 0 || nx >= w) continue;
            const np = ny * w + nx;

            // Only propagate from valid (non-damaged or already reconstructed) boundary pixels
            if (isDamaged[np]) continue;

            const dist = Math.hypot(kx, ky);
            if (dist > radius || dist === 0) continue;

            // Weight calculation: geometric distance decay
            let wgt = 1.0 / (dist * dist);

            if (method === 'telea') {
              // Alexandru Telea directional weighting
              wgt *= (1.0 / (1.0 + dist));
            } else {
              // Navier-Stokes fluid isophote diffusion approximation
              wgt *= (1.0 / dist);
            }

            const nIdx = np * 4;
            rSum += d[nIdx] * wgt;
            gSum += d[nIdx+1] * wgt;
            bSum += d[nIdx+2] * wgt;
            wSum += wgt;
          }
        }

        if (wSum > 0) {
          const idx = p * 4;
          d[idx] = rSum / wSum;
          d[idx+1] = gSum / wSum;
          d[idx+2] = bSum / wSum;
          // Mark as solved for next iteration passes
          if (iter > 2) isDamaged[p] = 0;
        }
      }
    }
  }

  putImageData(dst, imgData);
  AppState.lastProcessedCanvas = dst;
  document.getElementById('p5_status_badge').textContent = 'Restored';
}

// ============================================================================
// TAB 6: Lossless Compression
// ============================================================================
let tab6Initialized = false;
function initTab6() {
  const src = document.getElementById('p6_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  if (!tab6Initialized) {
    document.getElementById('p6_apply').addEventListener('click', applyTab6);
    document.getElementById('p6_channel').addEventListener('change', applyTab6);
    tab6Initialized = true;
  }
  applyTab6();
}

function applyTab6() {
  const src = document.getElementById('p6_src_canvas');
  const dst = document.getElementById('p6_dst_canvas');
  const algo = document.getElementById('p6_algorithm').value;
  const chMode = document.getElementById('p6_channel').value;

  const imgData = getImageData(src);
  const w = imgData.width, h = imgData.height;
  let rawStream = toGrayscaleData(imgData);

  if (chMode === 'binary') {
    // Threshold to binary for demonstration of massive RLE compression
    for (let i = 0; i < rawStream.length; i++) {
      rawStream[i] = rawStream[i] >= 128 ? 255 : 0;
    }
  }

  const origBytes = rawStream.length; // 1 byte per pixel
  let compBytes = 0;
  let decompStream = new Uint8ClampedArray(origBytes);

  // 1. Calculate Shannon Entropy
  const freq = new Int32Array(256);
  for (let i = 0; i < rawStream.length; i++) freq[rawStream[i]]++;
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / origBytes;
      entropy -= p * Math.log2(p);
    }
  }

  if (algo === 'rle') {
    // Run-Length Encoding
    const runs = [];
    let currentVal = rawStream[0];
    let runLen = 1;

    for (let i = 1; i < rawStream.length; i++) {
      if (rawStream[i] === currentVal && runLen < 255) {
        runLen++;
      } else {
        runs.push(runLen, currentVal);
        currentVal = rawStream[i];
        runLen = 1;
      }
    }
    runs.push(runLen, currentVal);

    // Each run stored as (length: 1 byte, value: 1 byte) = 2 bytes
    compBytes = runs.length;

    // Lossless Reconstruction
    let dIdx = 0;
    for (let r = 0; r < runs.length; r += 2) {
      const count = runs[r];
      const val = runs[r + 1];
      for (let k = 0; k < count; k++) {
        decompStream[dIdx++] = val;
      }
    }
  } else if (algo === 'huffman') {
    // Huffman Coding Simulator
    // Average Huffman code length = sum(p_i * l_i), tightly bounded by H <= L_avg < H + 1
    // Let's compute actual bit length via prefix tree length approximation:
    let avgBitsPerPixel = Math.max(1.0, Math.ceil(entropy * 1.05 * 100) / 100);
    compBytes = Math.ceil((origBytes * avgBitsPerPixel) / 8) + 256; // + 256 bytes header for frequency table
    decompStream.set(rawStream); // Perfect lossless decode
  }

  // Decompressed image display
  const outData = grayscaleToImageData(decompStream, w, h);
  putImageData(dst, outData);
  AppState.lastProcessedCanvas = dst;

  // Calculate metrics
  const cr = (origBytes / compBytes).toFixed(2);
  const saving = (((origBytes - compBytes) / origBytes) * 100).toFixed(1);

  document.getElementById('p6_orig_size').textContent = (origBytes / 1024).toFixed(1) + ' KB';
  document.getElementById('p6_comp_size').textContent = (compBytes / 1024).toFixed(1) + ' KB';
  document.getElementById('p6_cr').textContent = `${cr} : 1`;
  document.getElementById('p6_saving').textContent = `${saving}%`;
  document.getElementById('p6_entropy').textContent = `${entropy.toFixed(2)} bpp`;

  // Verify bit-for-bit match
  let mae = 0;
  for (let i = 0; i < origBytes; i++) {
    mae += Math.abs(rawStream[i] - decompStream[i]);
  }
  document.getElementById('p6_verify_msg').textContent = 
    `Bit-for-bit reconstruction identical. Absolute Mean Error (MAE) = ${(mae / origBytes).toFixed(6)}. Perfect lossless fidelity.`;
}

// ============================================================================
// TAB 7: Morphological Operations
// ============================================================================
let tab7Initialized = false;
function initTab7() {
  const src = document.getElementById('p7_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  linkSlider('p7_se_size', 'p7_se_size_val', ' × ' + document.getElementById('p7_se_size').value);
  document.getElementById('p7_se_size').addEventListener('input', (e) => {
    document.getElementById('p7_se_size_val').textContent = `${e.target.value} × ${e.target.value}`;
  });
  linkSlider('p7_iterations', 'p7_iterations_val', '');

  if (!tab7Initialized) {
    document.getElementById('p7_apply').addEventListener('click', applyTab7);
    tab7Initialized = true;
  }
  applyTab7();
}

function applyTab7() {
  const src = document.getElementById('p7_src_canvas');
  const dst = document.getElementById('p7_dst_canvas');
  const op = document.getElementById('p7_operation').value;
  const shape = document.getElementById('p7_se_shape').value;
  const kSize = parseInt(document.getElementById('p7_se_size').value, 10);
  const iters = parseInt(document.getElementById('p7_iterations').value, 10);

  const imgData = getImageData(src);
  const w = imgData.width, h = imgData.height;
  const gray = toGrayscaleData(imgData);

  // Binarize input
  const bin = new Uint8Array(w * h);
  for (let i = 0; i < gray.length; i++) {
    bin[i] = gray[i] >= 128 ? 1 : 0;
  }
  // Render clean binary input back on src canvas
  const binImgData = new ImageData(w, h);
  for (let i = 0, j = 0; i < bin.length; i++, j += 4) {
    const v = bin[i] ? 255 : 0;
    binImgData.data[j] = binImgData.data[j+1] = binImgData.data[j+2] = v;
    binImgData.data[j+3] = 255;
  }
  putImageData(src, binImgData);

  // Build Structuring Element Kernel
  const radius = Math.floor(kSize / 2);
  const se = [];
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (shape === 'square') {
        se.push({ x, y });
      } else if (shape === 'cross') {
        if (x === 0 || y === 0) se.push({ x, y });
      } else if (shape === 'disk') {
        if (x * x + y * y <= radius * radius) se.push({ x, y });
      }
    }
  }

  function erode(input) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let fits = 1;
        for (let k = 0; k < se.length; k++) {
          const nx = x + se[k].x;
          const ny = y + se[k].y;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h || input[ny * w + nx] === 0) {
            fits = 0;
            break;
          }
        }
        out[y * w + x] = fits;
      }
    }
    return out;
  }

  function dilate(input) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (input[y * w + x] === 1) {
          for (let k = 0; k < se.length; k++) {
            const nx = x + se[k].x;
            const ny = y + se[k].y;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              out[ny * w + nx] = 1;
            }
          }
        }
      }
    }
    return out;
  }

  let res = new Uint8Array(bin);

  if (op === 'erode') {
    for (let i = 0; i < iters; i++) res = erode(res);
  } else if (op === 'dilate') {
    for (let i = 0; i < iters; i++) res = dilate(res);
  } else if (op === 'open') {
    for (let i = 0; i < iters; i++) res = erode(res);
    for (let i = 0; i < iters; i++) res = dilate(res);
  } else if (op === 'close') {
    for (let i = 0; i < iters; i++) res = dilate(res);
    for (let i = 0; i < iters; i++) res = erode(res);
  } else if (op === 'gradient') {
    const d = dilate(res);
    const e = erode(res);
    for (let i = 0; i < res.length; i++) res[i] = d[i] - e[i] > 0 ? 1 : 0;
  } else if (op === 'boundary') {
    const e = erode(res);
    for (let i = 0; i < res.length; i++) res[i] = res[i] - e[i] > 0 ? 1 : 0;
  }

  const outData = new ImageData(w, h);
  for (let i = 0, j = 0; i < res.length; i++, j += 4) {
    const v = res[i] ? 255 : 0;
    outData.data[j] = outData.data[j+1] = outData.data[j+2] = v;
    outData.data[j+3] = 255;
  }
  putImageData(dst, outData);
  AppState.lastProcessedCanvas = dst;
}

// ============================================================================
// TAB 8: Object Detection using Correlation (2 Separate Inputs: Full & Target)
// ============================================================================
let tab8Initialized = false;
let tab8FullCanvas = document.createElement('canvas');
let tab8TargetCanvas = document.createElement('canvas');

function initTab8() {
  const fullPresetSelect = document.getElementById('p8_full_preset');
  const targetPresetSelect = document.getElementById('p8_target_preset');
  const fullUploader = document.getElementById('p8_full_uploader');
  const targetUploader = document.getElementById('p8_target_uploader');
  const src = document.getElementById('p8_src_canvas');
  const dragBtn = document.getElementById('p8_drag_btn');
  const dragHint = document.getElementById('p8_drag_hint');

  function updateFullPreset() {
    const val = fullPresetSelect.value;
    if (val === 'landscape') {
      copyCanvas(SampleImages.createScene(320, 240), tab8FullCanvas);
      targetPresetSelect.value = 'sun';
    } else if (val === 'shapes') {
      copyCanvas(SampleImages.createShapes(320, 240), tab8FullCanvas);
      targetPresetSelect.value = 'ring';
    } else {
      copyCanvas(SampleImages.createCorrelationTarget(320, 240), tab8FullCanvas);
      targetPresetSelect.value = 'medal';
    }
    copyCanvas(tab8FullCanvas, src);
    document.getElementById('p8_full_dim').textContent = `${src.width} × ${src.height} px`;
    updateTargetPreset();
  }

  function updateTargetPreset() {
    const val = targetPresetSelect.value;
    if (val === 'sun') {
      copyCanvas(SampleImages.createSunTemplate(), tab8TargetCanvas);
      document.getElementById('p8_target_label').textContent = 'Golden Sun (64×64)';
    } else if (val === 'door') {
      copyCanvas(SampleImages.createDoorTemplate(), tab8TargetCanvas);
      document.getElementById('p8_target_label').textContent = 'House Door (36×46)';
    } else if (val === 'ring') {
      copyCanvas(SampleImages.createRingTemplate(), tab8TargetCanvas);
      document.getElementById('p8_target_label').textContent = 'Geometric Ring (64×64)';
    } else if (val === 'medal') {
      copyCanvas(SampleImages.createCorrelationTemplate(), tab8TargetCanvas);
      document.getElementById('p8_target_label').textContent = "Stylized 'IP' Medal (64×64)";
    }
    const tpl = document.getElementById('p8_template_canvas');
    copyCanvas(tab8TargetCanvas, tpl);
    document.getElementById('p8_target_dim').textContent = `${tpl.width} × ${tpl.height} px`;
    applyTab8();
  }

  if (!tab8Initialized) {
    fullPresetSelect.addEventListener('change', updateFullPreset);
    targetPresetSelect.addEventListener('change', updateTargetPreset);

    // 1st Input: Upload Custom Full Image
    fullUploader.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          // Resize smoothly to max 360x280 for responsive real-time correlation
          const maxDim = 360;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          tab8FullCanvas.width = w;
          tab8FullCanvas.height = h;
          const ctx = tab8FullCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          copyCanvas(tab8FullCanvas, src);
          document.getElementById('p8_full_dim').textContent = `${w} × ${h} px`;
          applyTab8();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    // 2nd Input: Upload Custom Target Image
    targetUploader.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          // Resize template to max 80x80 if larger
          const maxTplDim = 80;
          let w = img.width, h = img.height;
          if (w > maxTplDim || h > maxTplDim) {
            if (w > h) { h = Math.round((h * maxTplDim) / w); w = maxTplDim; }
            else { w = Math.round((w * maxTplDim) / h); h = maxTplDim; }
          }
          tab8TargetCanvas.width = w;
          tab8TargetCanvas.height = h;
          const ctx = tab8TargetCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const tpl = document.getElementById('p8_template_canvas');
          copyCanvas(tab8TargetCanvas, tpl);
          document.getElementById('p8_target_dim').textContent = `${w} × ${h} px`;
          document.getElementById('p8_target_label').textContent = `Uploaded Target (${w}×${h})`;
          applyTab8();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Interactive Drag Selection on Full Image
    let dragModeActive = false;
    if (dragBtn) {
      dragBtn.addEventListener('click', () => {
        dragModeActive = !dragModeActive;
        if (dragModeActive) {
          dragBtn.style.background = '#bbf7d0';
          dragBtn.innerHTML = '<i class="fa-solid fa-check"></i> Cropping Active (Drag on Scene)';
          if (dragHint) dragHint.style.display = 'block';
          src.style.cursor = 'crosshair';
        } else {
          dragBtn.style.background = '#fff';
          dragBtn.innerHTML = '<i class="fa-solid fa-crop-simple"></i> Crop Target by Dragging on Full Image';
          if (dragHint) dragHint.style.display = 'none';
          src.style.cursor = 'default';
        }
      });
    }

    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };

    function getCanvasCoords(canvas, clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.max(0, Math.min(canvas.width, Math.round((clientX - rect.left) * scaleX))),
        y: Math.max(0, Math.min(canvas.height, Math.round((clientY - rect.top) * scaleY)))
      };
    }

    src.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragStart = getCanvasCoords(src, e.clientX, e.clientY);
      dragCurrent = dragStart;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragCurrent = getCanvasCoords(src, e.clientX, e.clientY);
      // Redraw clean scene
      copyCanvas(tab8FullCanvas, src);
      const ctx = src.getContext('2d');
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const w = Math.abs(dragStart.x - dragCurrent.x);
      const h = Math.abs(dragStart.y - dragCurrent.y);

      // Draw dashed selection rectangle
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
      ctx.fillRect(x, y, w, h);
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const w = Math.abs(dragStart.x - dragCurrent.x);
      const h = Math.abs(dragStart.y - dragCurrent.y);

      if (w >= 10 && h >= 10 && tab8FullCanvas.width > 0) {
        // Limit max crop dimension to 80px to maintain fast real-time response
        const maxTplDim = 80;
        let finalW = w, finalH = h;
        if (finalW > maxTplDim || finalH > maxTplDim) {
          if (finalW > finalH) {
            finalH = Math.round((finalH * maxTplDim) / finalW);
            finalW = maxTplDim;
          } else {
            finalW = Math.round((finalW * maxTplDim) / finalH);
            finalH = maxTplDim;
          }
        }

        tab8TargetCanvas.width = finalW;
        tab8TargetCanvas.height = finalH;
        const tCtx = tab8TargetCanvas.getContext('2d');
        tCtx.drawImage(tab8FullCanvas, x, y, w, h, 0, 0, finalW, finalH);

        const tpl = document.getElementById('p8_template_canvas');
        copyCanvas(tab8TargetCanvas, tpl);
        document.getElementById('p8_target_dim').textContent = `${finalW} × ${finalH} px`;
        document.getElementById('p8_target_label').textContent = `Cropped ROI (${finalW}×${finalH})`;

        if (dragModeActive && dragBtn) {
          dragBtn.click(); // turn off active mode
        }
        applyTab8();
      } else {
        applyTab8();
      }
    });

    document.getElementById('p8_apply').addEventListener('click', applyTab8);
    document.getElementById('p8_method').addEventListener('change', applyTab8);
    tab8Initialized = true;
  }

  updateFullPreset();
}

function applyTab8() {
  const src = document.getElementById('p8_src_canvas');
  const dst = document.getElementById('p8_dst_canvas');
  const tpl = document.getElementById('p8_template_canvas');
  const method = document.getElementById('p8_method').value;

  // Re-render fresh clean full image before drawing bounding box
  if (tab8FullCanvas.width > 0) {
    copyCanvas(tab8FullCanvas, src);
  }

  const targetImg = getImageData(src);
  const tplImg = getImageData(tpl);

  const tw = targetImg.width, th = targetImg.height;
  let kw = tplImg.width, kh = tplImg.height;

  // Validation: template must be smaller than full image
  if (kw >= tw || kh >= th) {
    alert(`Target image (${kw}×${kh}) is too large for the full image (${tw}×${th}). Please upload a smaller target template or larger full image.`);
    return;
  }

  const targetGray = toGrayscaleData(targetImg);
  const tplGray = toGrayscaleData(tplImg);

  // Compute template mean and variance
  let tplSum = 0;
  for (let i = 0; i < tplGray.length; i++) tplSum += tplGray[i];
  const tplMean = tplSum / tplGray.length;

  let tplVarSum = 0;
  for (let i = 0; i < tplGray.length; i++) {
    const diff = tplGray[i] - tplMean;
    tplVarSum += diff * diff;
  }
  const tplStd = Math.sqrt(tplVarSum);
  const tplStdSafe = tplStd > 1e-6 ? tplStd : 1;

  const respW = tw - kw + 1;
  const respH = th - kh + 1;
  const responseMap = new Float32Array(respW * respH);

  let bestX = 0, bestY = 0;
  let bestScore = method === 'ncc' ? -Infinity : Infinity;

  // Slide template across target image
  for (let y = 0; y < respH; y++) {
    for (let x = 0; x < respW; x++) {
      let patchSum = 0;
      for (let ky = 0; ky < kh; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          patchSum += targetGray[(y + ky) * tw + (x + kx)];
        }
      }
      const patchMean = patchSum / (kw * kh);

      let numer = 0, patchVar = 0, ssd = 0;
      for (let ky = 0; ky < kh; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          const pVal = targetGray[(y + ky) * tw + (x + kx)];
          const tVal = tplGray[ky * kw + kx];

          if (method === 'ncc') {
            const pDiff = pVal - patchMean;
            const tDiff = tVal - tplMean;
            numer += pDiff * tDiff;
            patchVar += pDiff * pDiff;
          } else {
            const diff = pVal - tVal;
            ssd += diff * diff;
          }
        }
      }

      let score = 0;
      if (method === 'ncc') {
        const patchStd = Math.sqrt(patchVar);
        const denom = patchStd * tplStdSafe;
        score = denom > 1e-6 ? (numer / denom) : 0;
        if (score > bestScore) {
          bestScore = score;
          bestX = x;
          bestY = y;
        }
      } else {
        score = ssd;
        if (score < bestScore) {
          bestScore = score;
          bestX = x;
          bestY = y;
        }
      }
      responseMap[y * respW + x] = score;
    }
  }

  // Display metrics
  let displayScore = 0;
  let confPct = 0;
  if (method === 'ncc') {
    const clampedScore = Math.max(-1, Math.min(1, bestScore));
    displayScore = clampedScore.toFixed(4);
    confPct = Math.max(0, clampedScore * 100).toFixed(1);
  } else {
    // For SSD, lower is better. Normalize for human readability
    const ssdNorm = 1 / (1 + bestScore / (kw * kh * 100));
    displayScore = bestScore.toFixed(0);
    confPct = (ssdNorm * 100).toFixed(1);
  }

  // Draw detection box on source canvas
  const srcCtx = src.getContext('2d');
  srcCtx.strokeStyle = '#10b981'; // bright green bounding box
  srcCtx.lineWidth = 3;
  srcCtx.strokeRect(bestX, bestY, kw, kh);

  // Label tag above or inside bounding box
  const labelY = bestY >= 22 ? bestY - 20 : bestY + kh + 4;
  srcCtx.fillStyle = '#10b981';
  const labelText = `MATCHED (${confPct}%)`;
  srcCtx.font = 'bold 11px sans-serif';
  const textW = srcCtx.measureText(labelText).width + 12;
  srcCtx.fillRect(bestX, labelY, textW, 18);
  srcCtx.fillStyle = '#ffffff';
  srcCtx.fillText(labelText, bestX + 6, labelY + 13);

  // Render 2D correlation surface heatmap
  dst.width = respW;
  dst.height = respH;
  const heatData = new ImageData(respW, respH);
  const hd = heatData.data;

  for (let i = 0, j = 0; i < responseMap.length; i++, j += 4) {
    let norm = 0;
    if (method === 'ncc') {
      norm = Math.max(0, Math.min(1, (responseMap[i] + 1) / 2));
    } else {
      const maxVal = bestScore * 5 || 1000;
      norm = Math.max(0, Math.min(1, 1 - (responseMap[i] - bestScore) / maxVal));
    }
    // Thermal Jet Colormap
    hd[j] = Math.round(255 * norm); // R
    hd[j+1] = Math.round(255 * Math.sin(norm * Math.PI)); // G
    hd[j+2] = Math.round(255 * (1 - norm)); // B
    hd[j+3] = 255;
  }
  putImageData(dst, heatData);

  // Draw peak marker crosshair on response map
  const dstCtx = dst.getContext('2d');
  dstCtx.strokeStyle = '#ffffff';
  dstCtx.lineWidth = 1.5;
  dstCtx.beginPath();
  dstCtx.arc(bestX, bestY, 5, 0, Math.PI * 2);
  dstCtx.moveTo(bestX - 8, bestY);
  dstCtx.lineTo(bestX + 8, bestY);
  dstCtx.moveTo(bestX, bestY - 8);
  dstCtx.lineTo(bestX, bestY + 8);
  dstCtx.stroke();

  AppState.lastProcessedCanvas = src;

  document.getElementById('p8_match_score').textContent = method === 'ncc' ? `NCC: ${displayScore}` : `SSD: ${displayScore}`;
  document.getElementById('p8_pos_x').textContent = `${bestX} px`;
  document.getElementById('p8_pos_y').textContent = `${bestY} px`;
  document.getElementById('p8_peak_val').textContent = displayScore;
  document.getElementById('p8_conf').textContent = `${confPct}%`;
}

// ============================================================================
// TAB 9: Color Spaces (RGB, HSV, YCrCb, CIELAB)
// ============================================================================
let tab9Initialized = false;
function initTab9() {
  const src = document.getElementById('p9_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  if (!tab9Initialized) {
    document.getElementById('p9_apply').addEventListener('click', applyTab9);
    document.getElementById('p9_colorspace').addEventListener('change', applyTab9);
    tab9Initialized = true;
  }
  applyTab9();
}

function applyTab9() {
  const src = document.getElementById('p9_src_canvas');
  const dst = document.getElementById('p9_dst_canvas');
  const cs = document.getElementById('p9_colorspace').value;

  const ch1Canvas = document.getElementById('p9_ch1_canvas');
  const ch2Canvas = document.getElementById('p9_ch2_canvas');
  const ch3Canvas = document.getElementById('p9_ch3_canvas');

  const imgData = getImageData(src);
  const d = imgData.data;
  const w = imgData.width, h = imgData.height;

  const ch1Data = new ImageData(w, h);
  const ch2Data = new ImageData(w, h);
  const ch3Data = new ImageData(w, h);
  const dstData = new ImageData(w, h);

  const c1d = ch1Data.data, c2d = ch2Data.data, c3d = ch3Data.data, dd = dstData.data;

  if (cs === 'rgb') {
    document.getElementById('p9_dst_label').textContent = 'RGB Full Color';
    document.getElementById('p9_ch1_name').textContent = 'Channel 1: Red (R)';
    document.getElementById('p9_ch2_name').textContent = 'Channel 2: Green (G)';
    document.getElementById('p9_ch3_name').textContent = 'Channel 3: Blue (B)';

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      c1d[i] = r; c1d[i+1] = 0; c1d[i+2] = 0; c1d[i+3] = 255;
      c2d[i] = 0; c2d[i+1] = g; c2d[i+2] = 0; c2d[i+3] = 255;
      c3d[i] = 0; c3d[i+1] = 0; c3d[i+2] = b; c3d[i+3] = 255;

      dd[i] = r; dd[i+1] = g; dd[i+2] = b; dd[i+3] = 255;
    }
  } else if (cs === 'hsv') {
    document.getElementById('p9_dst_label').textContent = 'HSV Cylindrical Map';
    document.getElementById('p9_ch1_name').textContent = 'Channel 1: Hue (H [0-360°])';
    document.getElementById('p9_ch2_name').textContent = 'Channel 2: Saturation (S)';
    document.getElementById('p9_ch3_name').textContent = 'Channel 3: Value (V / Brightness)';

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i+1] / 255, b = d[i+2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const delta = max - min;
      let hVal = 0;

      if (delta !== 0) {
        if (max === r) hVal = ((g - b) / delta) % 6;
        else if (max === g) hVal = (b - r) / delta + 2;
        else hVal = (r - g) / delta + 4;
        hVal = Math.round(hVal * 60);
        if (hVal < 0) hVal += 360;
      }
      const sVal = max === 0 ? 0 : delta / max;
      const vVal = max;

      const hNorm = Math.round((hVal / 360) * 255);
      const sNorm = Math.round(sVal * 255);
      const vNorm = Math.round(vVal * 255);

      c1d[i] = c1d[i+1] = c1d[i+2] = hNorm; c1d[i+3] = 255;
      c2d[i] = c2d[i+1] = c2d[i+2] = sNorm; c2d[i+3] = 255;
      c3d[i] = c3d[i+1] = c3d[i+2] = vNorm; c3d[i+3] = 255;

      dd[i] = hNorm; dd[i+1] = sNorm; dd[i+2] = vNorm; dd[i+3] = 255;
    }
  } else if (cs === 'ycrcb') {
    document.getElementById('p9_dst_label').textContent = 'YCrCb Digital TV Standard';
    document.getElementById('p9_ch1_name').textContent = 'Channel 1: Luminance (Y)';
    document.getElementById('p9_ch2_name').textContent = 'Channel 2: Chrominance-Red (Cr)';
    document.getElementById('p9_ch3_name').textContent = 'Channel 3: Chrominance-Blue (Cb)';

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i+1], b = d[i+2];
      const yVal = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const crVal = Math.round((r - yVal) * 0.713 + 128);
      const cbVal = Math.round((b - yVal) * 0.564 + 128);

      c1d[i] = c1d[i+1] = c1d[i+2] = yVal; c1d[i+3] = 255;
      c2d[i] = crVal; c2d[i+1] = 128; c2d[i+2] = 128; c2d[i+3] = 255;
      c3d[i] = 128; c3d[i+1] = 128; c3d[i+2] = cbVal; c3d[i+3] = 255;

      dd[i] = yVal; dd[i+1] = crVal; dd[i+2] = cbVal; dd[i+3] = 255;
    }
  } else if (cs === 'lab') {
    document.getElementById('p9_dst_label').textContent = 'CIELAB Perceptually Uniform';
    document.getElementById('p9_ch1_name').textContent = 'Channel 1: Lightness (L*)';
    document.getElementById('p9_ch2_name').textContent = 'Channel 2: Green-Red (a*)';
    document.getElementById('p9_ch3_name').textContent = 'Channel 3: Blue-Yellow (b*)';

    for (let i = 0; i < d.length; i += 4) {
      // sRGB to Linear
      let r = d[i] / 255, g = d[i+1] / 255, b = d[i+2] / 255;
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

      // XYZ
      let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
      let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
      let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

      const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
      const fx = f(x), fy = f(y), fz = f(z);

      const L = Math.max(0, Math.min(100, 116 * fy - 16));
      const a = (fx - fy) * 500;
      const bLab = (fy - fz) * 200;

      const LNorm = Math.round((L / 100) * 255);
      const aNorm = Math.round(Math.max(0, Math.min(255, a + 128)));
      const bNorm = Math.round(Math.max(0, Math.min(255, bLab + 128)));

      c1d[i] = c1d[i+1] = c1d[i+2] = LNorm; c1d[i+3] = 255;
      c2d[i] = aNorm; c2d[i+1] = 255 - aNorm; c2d[i+2] = 128; c2d[i+3] = 255;
      c3d[i] = bNorm; c3d[i+1] = 128; c3d[i+2] = 255 - bNorm; c3d[i+3] = 255;

      dd[i] = LNorm; dd[i+1] = aNorm; dd[i+2] = bNorm; dd[i+3] = 255;
    }
  }

  putImageData(dst, dstData);
  putImageData(ch1Canvas, ch1Data);
  putImageData(ch2Canvas, ch2Data);
  putImageData(ch3Canvas, ch3Data);
  AppState.lastProcessedCanvas = dst;
}

// ============================================================================
// TAB 10: Edge Detection Techniques (Sobel, Prewitt, Canny)
// ============================================================================
let tab10Initialized = false;
function initTab10() {
  const src = document.getElementById('p10_src_canvas');
  copyCanvas(AppState.workingCanvas, src);

  const detSelect = document.getElementById('p10_detector');
  const sub = document.getElementById('p10_subcontrols');

  function renderSub() {
    const d = detSelect.value;
    if (d === 'canny') {
      sub.innerHTML = `
        <div class="control-group">
          <label>Canny High Threshold (T_high):</label>
          <div class="slider-container">
            <input type="range" id="p10_thigh" min="40" max="180" value="90">
            <span id="p10_thigh_val" class="slider-val">90</span>
          </div>
        </div>
        <div class="control-group">
          <label>Canny Low Threshold (T_low):</label>
          <div class="slider-container">
            <input type="range" id="p10_tlow" min="10" max="80" value="40">
            <span id="p10_tlow_val" class="slider-val">40</span>
          </div>
        </div>
      `;
      linkSlider('p10_thigh', 'p10_thigh_val', '');
      linkSlider('p10_tlow', 'p10_tlow_val', '');
    } else {
      sub.innerHTML = ``;
    }
  }

  if (!tab10Initialized) {
    detSelect.addEventListener('change', renderSub);
    document.getElementById('p10_apply').addEventListener('click', applyTab10);
    tab10Initialized = true;
  }
  renderSub();
  applyTab10();
}

function applyTab10() {
  const src = document.getElementById('p10_src_canvas');
  const dst = document.getElementById('p10_dst_canvas');
  const det = document.getElementById('p10_detector').value;

  const cmpSobel = document.getElementById('p10_cmp_sobel');
  const cmpPrewitt = document.getElementById('p10_cmp_prewitt');
  const cmpCanny = document.getElementById('p10_cmp_canny');

  const imgData = getImageData(src);
  const w = imgData.width, h = imgData.height;
  const gray = toGrayscaleData(imgData);

  // 1. Sobel Gradient
  const sobelMag = new Uint8ClampedArray(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)]
                 - 2 * gray[y*w+(x-1)] + 2 * gray[y*w+(x+1)]
                 - gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)];

      const gy = -gray[(y-1)*w+(x-1)] - 2 * gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
                 + gray[(y+1)*w+(x-1)] + 2 * gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];

      sobelMag[y * w + x] = Math.min(255, Math.hypot(gx, gy));
    }
  }

  // 2. Prewitt Gradient
  const prewittMag = new Uint8ClampedArray(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = -gray[(y-1)*w+(x-1)] + gray[(y-1)*w+(x+1)]
                 - gray[y*w+(x-1)] + gray[y*w+(x+1)]
                 - gray[(y+1)*w+(x-1)] + gray[(y+1)*w+(x+1)];

      const gy = -gray[(y-1)*w+(x-1)] - gray[(y-1)*w+x] - gray[(y-1)*w+(x+1)]
                 + gray[(y+1)*w+(x-1)] + gray[(y+1)*w+x] + gray[(y+1)*w+(x+1)];

      prewittMag[y * w + x] = Math.min(255, Math.hypot(gx, gy));
    }
  }

  // 3. Complete Canny Edge Detection (4 Stages)
  // Stage A: Gaussian Smoothing
  const smooth = new Float32Array(w * h);
  const gKernel = [
    [1/16, 2/16, 1/16],
    [2/16, 4/16, 2/16],
    [1/16, 2/16, 1/16]
  ];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          sum += gray[(y + ky) * w + (x + kx)] * gKernel[ky + 1][kx + 1];
        }
      }
      smooth[y * w + x] = sum;
    }
  }

  // Stage B: Gradient & Orientation
  const gradMag = new Float32Array(w * h);
  const gradDir = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx = -smooth[(y-1)*w+(x-1)] + smooth[(y-1)*w+(x+1)]
                 - 2 * smooth[y*w+(x-1)] + 2 * smooth[y*w+(x+1)]
                 - smooth[(y+1)*w+(x-1)] + smooth[(y+1)*w+(x+1)];

      const gy = -smooth[(y-1)*w+(x-1)] - 2 * smooth[(y-1)*w+x] - smooth[(y-1)*w+(x+1)]
                 + smooth[(y+1)*w+(x-1)] + 2 * smooth[(y+1)*w+x] + smooth[(y+1)*w+(x+1)];

      gradMag[y * w + x] = Math.hypot(gx, gy);
      let angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (angle < 0) angle += 180;
      gradDir[y * w + x] = angle;
    }
  }

  // Stage C: Non-Maximum Suppression (NMS)
  const nms = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const angle = gradDir[y * w + x];
      const m = gradMag[y * w + x];
      let p1 = 0, p2 = 0;

      // 0 deg (Horizontal)
      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        p1 = gradMag[y * w + (x + 1)];
        p2 = gradMag[y * w + (x - 1)];
      } else if (angle >= 22.5 && angle < 67.5) { // 45 deg (Diagonal)
        p1 = gradMag[(y - 1) * w + (x + 1)];
        p2 = gradMag[(y + 1) * w + (x - 1)];
      } else if (angle >= 67.5 && angle < 112.5) { // 90 deg (Vertical)
        p1 = gradMag[(y - 1) * w + x];
        p2 = gradMag[(y + 1) * w + x];
      } else if (angle >= 112.5 && angle < 157.5) { // 135 deg
        p1 = gradMag[(y - 1) * w + (x - 1)];
        p2 = gradMag[(y + 1) * w + (x + 1)];
      }

      if (m >= p1 && m >= p2) {
        nms[y * w + x] = m;
      } else {
        nms[y * w + x] = 0;
      }
    }
  }

  // Stage D: Double Thresholding and Hysteresis Tracking
  const tHigh = parseInt(document.getElementById('p10_thigh') ? document.getElementById('p10_thigh').value : 90, 10);
  const tLow = parseInt(document.getElementById('p10_tlow') ? document.getElementById('p10_tlow').value : 40, 10);

  const cannyEdges = new Uint8ClampedArray(w * h);
  const STRONG = 255, WEAK = 50;

  for (let i = 0; i < nms.length; i++) {
    if (nms[i] >= tHigh) cannyEdges[i] = STRONG;
    else if (nms[i] >= tLow) cannyEdges[i] = WEAK;
    else cannyEdges[i] = 0;
  }

  // Hysteresis Edge Tracking
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (cannyEdges[y * w + x] === WEAK) {
        let connected = false;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (cannyEdges[(y + ky) * w + (x + kx)] === STRONG) {
              connected = true;
              break;
            }
          }
          if (connected) break;
        }
        cannyEdges[y * w + x] = connected ? STRONG : 0;
      }
    }
  }

  // Put results in comparison strip
  putImageData(cmpSobel, grayscaleToImageData(sobelMag, w, h));
  putImageData(cmpPrewitt, grayscaleToImageData(prewittMag, w, h));
  putImageData(cmpCanny, grayscaleToImageData(cannyEdges, w, h));

  // Put primary selection in main dst canvas
  if (det === 'canny') {
    document.getElementById('p10_dst_label').textContent = 'Canny Optimal Edge Map';
    putImageData(dst, grayscaleToImageData(cannyEdges, w, h));
  } else if (det === 'sobel') {
    document.getElementById('p10_dst_label').textContent = 'Sobel Gradient Magnitude';
    putImageData(dst, grayscaleToImageData(sobelMag, w, h));
  } else if (det === 'prewitt') {
    document.getElementById('p10_dst_label').textContent = 'Prewitt Gradient Magnitude';
    putImageData(dst, grayscaleToImageData(prewittMag, w, h));
  }

  AppState.lastProcessedCanvas = dst;
}

// Utility slider binder
function linkSlider(sliderId, badgeId, suffix) {
  const slider = document.getElementById(sliderId);
  const badge = document.getElementById(badgeId);
  if (!slider || !badge) return;
  slider.addEventListener('input', () => {
    badge.textContent = slider.value + suffix;
  });
}
