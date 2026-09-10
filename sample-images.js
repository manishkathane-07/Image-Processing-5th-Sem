/**
 * Sample Image Generators for Image Processing Lab
 * Generates synthetic images directly into canvases so the application
 * has immediate, high-quality test data offline without external assets.
 */

const SampleImages = {
  // 1. Natural scene with flowers / gradient / shapes
  createScene: function(width = 320, height = 320) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    sky.addColorStop(0, '#1a73e8');
    sky.addColorStop(1, '#87ceeb');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Sun
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, width * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Mountains
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width * 0.35, height * 0.25);
    ctx.lineTo(width * 0.7, height * 0.6);
    ctx.fill();

    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.6);
    ctx.lineTo(width * 0.6, height * 0.3);
    ctx.lineTo(width, height * 0.6);
    ctx.fill();

    // Grass ground
    const grass = ctx.createLinearGradient(0, height * 0.6, 0, height);
    grass.addColorStop(0, '#2e7d32');
    grass.addColorStop(1, '#1b5e20');
    ctx.fillStyle = grass;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // House
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(width * 0.2, height * 0.55, width * 0.25, height * 0.25);
    // Roof
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(width * 0.18, height * 0.55);
    ctx.lineTo(width * 0.325, height * 0.42);
    ctx.lineTo(width * 0.47, height * 0.55);
    ctx.fill();
    // Door
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(width * 0.29, height * 0.65, width * 0.07, height * 0.15);

    // Tree
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(width * 0.72, height * 0.58, width * 0.06, height * 0.22);
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.53, width * 0.12, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  // 2. Geometric Shapes (Ideal for Morphological & Edge Detection)
  createShapes: function(width = 320, height = 320) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // White circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.3, width * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // White rectangle
    ctx.fillRect(width * 0.6, height * 0.15, width * 0.28, height * 0.28);

    // White triangle
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.6);
    ctx.lineTo(width * 0.15, height * 0.9);
    ctx.lineTo(width * 0.45, height * 0.9);
    ctx.closePath();
    ctx.fill();

    // White ring
    ctx.beginPath();
    ctx.arc(width * 0.72, height * 0.72, width * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(width * 0.72, height * 0.72, width * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Small noise spots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width * 0.1, height * 0.1, 4, 4);
    ctx.fillRect(width * 0.85, height * 0.5, 5, 5);
    ctx.fillRect(width * 0.5, height * 0.75, 4, 4);

    return canvas;
  },

  // 3. Low Contrast Image (Ideal for Histogram Equalization)
  createLowContrast: function(width = 320, height = 320) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Foggy landscape in washed-out mid-gray tones (100-140)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#929292';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.4, width * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#737373';
    ctx.fillRect(width * 0.2, height * 0.6, width * 0.6, height * 0.3);

    ctx.fillStyle = '#a8a8a8';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LOW CONTRAST', width * 0.5, height * 0.25);

    return canvas;
  },

  // 4. Object Detection / Correlation Target Image & Template
  createCorrelationTarget: function(width = 320, height = 240) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background pattern
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height);

    // Distractor shapes
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(30, 40, 45, 45);
    ctx.beginPath();
    ctx.arc(260, 60, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(70, 180, 30, 0, Math.PI * 2);
    ctx.fill();

    // Distinct target object at (160, 110)
    const tx = 160, ty = 110;
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(tx, ty, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(tx, ty, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IP', tx, ty);

    return canvas;
  },

  // Template crop for Object Detection (Medal Badge)
  createCorrelationTemplate: function() {
    const target = this.createCorrelationTarget(320, 240);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    // Crop exact Medal at (128, 78, 64, 64)
    ctx.drawImage(target, 128, 78, 64, 64, 0, 0, 64, 64);
    return canvas;
  },

  // Template crop for Sun from Landscape
  createSunTemplate: function() {
    const scene = this.createScene(320, 240);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    // Sun is at center (256, 48)
    ctx.drawImage(scene, 224, 16, 64, 64, 0, 0, 64, 64);
    return canvas;
  },

  // Template crop for House Door from Landscape
  createDoorTemplate: function() {
    const scene = this.createScene(320, 240);
    const canvas = document.createElement('canvas');
    canvas.width = 36;
    canvas.height = 46;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(scene, 86, 152, 36, 46, 0, 0, 36, 46);
    return canvas;
  },

  // Template crop for Ring from Shapes
  createRingTemplate: function() {
    const shapes = this.createShapes(320, 240);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    // Ring is at (320*0.72 = 230, 240*0.72 = 173) -> top-left ~ (198, 141)
    ctx.drawImage(shapes, 198, 141, 64, 64, 0, 0, 64, 64);
    return canvas;
  }
};
