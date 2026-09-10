// RGB Histogram Equalization Interactive App Engine (Upload-Only Mode)
document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const tabStudio = document.getElementById('tab-studio');
    const tabOverview = document.getElementById('tab-overview');
    const tabMath = document.getElementById('tab-math');
    const tabLiterature = document.getElementById('tab-literature');

    const viewStudio = document.getElementById('view-studio');
    const viewOverview = document.getElementById('view-overview');
    const viewMath = document.getElementById('view-math');
    const viewLiterature = document.getElementById('view-literature');

    const dropzone = document.getElementById('dropzone');
    const customUpload = document.getElementById('custom-upload');
    const uploadFilename = document.getElementById('upload-filename');

    const methodSelect = document.getElementById('method-select');
    const noiseSelect = document.getElementById('noise-select');
    const noiseLevel = document.getElementById('noise-level');
    const noiseValDisp = document.getElementById('noise-val-disp');
    const filterSelect = document.getElementById('filter-select');
    const kernelSelect = document.getElementById('kernel-select');

    const imgOriginal = document.getElementById('img-original');
    const imgProcessed = document.getElementById('img-processed');
    const placeholderOrig = document.getElementById('placeholder-orig');
    const placeholderProc = document.getElementById('placeholder-proc');
    const origDims = document.getElementById('orig-dims');
    const procMethodBadge = document.getElementById('proc-method-badge');

    // Metrics Elements
    const metricRms = document.getElementById('metric-rms');
    const metricEntropy = document.getElementById('metric-entropy');
    const metricMean = document.getElementById('metric-mean');
    const metricAmbe = document.getElementById('metric-ambe');
    const metricPsnr = document.getElementById('metric-psnr');
    const metricSsim = document.getElementById('metric-ssim');
    const metricSnr = document.getElementById('metric-snr');
    const metricExecTime = document.getElementById('metric-exec-time');

    // Chart instances
    let chartOrig = null;
    let chartProc = null;
    let currentCustomBase64 = null;

    // Tab Navigation Logic
    const tabs = [
        { btn: tabStudio, view: viewStudio },
        { btn: tabOverview, view: viewOverview },
        { btn: tabMath, view: viewMath },
        { btn: tabLiterature, view: viewLiterature }
    ];

    tabs.forEach(tab => {
        if (!tab.btn) return;
        tab.btn.addEventListener('click', () => {
            tabs.forEach(t => {
                if (!t.btn || !t.view) return;
                t.view.classList.add('hidden');
                t.btn.classList.remove('border-indigo-600', 'text-indigo-600', 'font-bold');
                t.btn.classList.add('border-transparent', 'text-gray-500');
            });
            tab.view.classList.remove('hidden');
            tab.btn.classList.add('border-indigo-600', 'text-indigo-600', 'font-bold');
            tab.btn.classList.remove('border-transparent', 'text-gray-500');

            if (tab.btn === tabMath && window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }
        });
    });

    // Dropzone Click & Drag/Drop Logic
    if (dropzone && customUpload) {
        dropzone.addEventListener('click', () => customUpload.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('border-indigo-500', 'bg-indigo-50/60');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/60');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/60');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        customUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert("Please select a valid image file.");
            return;
        }

        if (uploadFilename) {
            uploadFilename.innerText = `Uploaded: ${file.name}`;
            uploadFilename.classList.remove('hidden');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentCustomBase64 = event.target.result;
            triggerProcessing();
        };
        reader.readAsDataURL(file);
    }

    // Noise Level Display
    if (noiseLevel) {
        noiseLevel.addEventListener('input', (e) => {
            if (noiseValDisp) noiseValDisp.innerText = `Level: ${parseFloat(e.target.value).toFixed(2)}`;
            if (currentCustomBase64) triggerProcessing();
        });
    }

    // Event Listeners for Processing Controls
    [methodSelect, noiseSelect, filterSelect, kernelSelect].forEach(el => {
        if (el) {
            el.addEventListener('change', () => {
                if (currentCustomBase64) triggerProcessing();
            });
        }
    });

    // Trigger API Processing
    async function triggerProcessing() {
        if (!currentCustomBase64) {
            // Load default initial sample if user hasn't uploaded yet
            loadInitialDefault();
            return;
        }

        const method = methodSelect ? methodSelect.value : "rgb_he";
        const noiseType = noiseSelect ? noiseSelect.value : "none";
        const nLevel = noiseLevel ? parseFloat(noiseLevel.value) : 0.02;
        const filterType = filterSelect ? filterSelect.value : "none";
        const kernelSize = kernelSelect ? parseInt(kernelSelect.value) : 3;

        const methodLabels = {
            "rgb_he": "Direct RGB HE (Proposed)",
            "hsv_v": "HSV Decoupled (V-Channel)",
            "ycrcb_y": "YCrCb Decoupled (Y-Channel)",
            "clahe": "CLAHE (Adaptive Local HE)",
            "raw": "Original Raw Image"
        };
        if (procMethodBadge) {
            procMethodBadge.innerText = methodLabels[method] || method;
        }

        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sample_name: 'custom',
                    custom_image: currentCustomBase64,
                    method: method,
                    noise_type: noiseType,
                    noise_level: nLevel,
                    filter_type: filterType,
                    kernel_size: kernelSize
                })
            });

            if (!response.ok) {
                console.error("API error response:", response.statusText);
                return;
            }

            const data = await response.json();
            updateUI(data);

        } catch (err) {
            console.error("API call failed:", err);
        }
    }

    // Default startup sample until user uploads custom photo
    async function loadInitialDefault() {
        const method = methodSelect ? methodSelect.value : "rgb_he";
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sample_name: 'landscape1_hazy_mountains',
                    method: method
                })
            });
            if (response.ok) {
                const data = await response.json();
                updateUI(data);
            }
        } catch (e) {
            console.warn("Default init failed", e);
        }
    }

    function updateUI(data) {
        if (placeholderOrig) placeholderOrig.classList.add('hidden');
        if (placeholderProc) placeholderProc.classList.add('hidden');

        if (imgOriginal) {
            imgOriginal.src = data.original_url || data.original_image;
            imgOriginal.classList.remove('hidden');
        }
        if (imgProcessed) {
            imgProcessed.src = data.processed_url || data.processed_image;
            imgProcessed.classList.remove('hidden');
        }
        if (origDims && data.dimensions) origDims.innerText = data.dimensions;

        // Update Metrics
        const m = data.metrics;
        if (m) {
            if (metricRms) metricRms.innerText = m.rms_contrast.toFixed(2);
            if (metricEntropy) metricEntropy.innerText = `${m.shannon_entropy.toFixed(4)} bits`;
            if (metricMean) metricMean.innerText = m.mean_brightness.toFixed(2);
            if (metricAmbe) metricAmbe.innerText = m.ambe.toFixed(2);
            if (metricPsnr) metricPsnr.innerText = `${m.psnr.toFixed(2)} dB`;
            if (metricSsim) metricSsim.innerText = m.ssim.toFixed(4);
            if (metricSnr) metricSnr.innerText = `${m.snr.toFixed(2)} dB`;
            if (metricExecTime) metricExecTime.innerText = `Exec Time: ${m.execution_time_ms.toFixed(1)} ms`;
        }

        // Update Charts
        if (data.histograms && window.Chart) {
            renderHistogramChart('chart-orig-hist', data.histograms.original, 'Original RGB');
            renderHistogramChart('chart-proc-hist', data.histograms.equalized, 'Equalized RGB');
        }
    }

    function renderHistogramChart(canvasId, histData, title) {
        const canvasEl = document.getElementById(canvasId);
        if (!canvasEl) return;
        const ctx = canvasEl.getContext('2d');
        const bins = Array.from({length: 256}, (_, i) => i);

        const chartConfig = {
            type: 'line',
            data: {
                labels: bins,
                datasets: [
                    {
                        label: 'Red Channel',
                        data: histData.r || [],
                        borderColor: 'rgba(220, 38, 38, 0.9)',
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: true
                    },
                    {
                        label: 'Green Channel',
                        data: histData.g || [],
                        borderColor: 'rgba(22, 163, 74, 0.9)',
                        backgroundColor: 'rgba(22, 163, 74, 0.08)',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: true
                    },
                    {
                        label: 'Blue Channel',
                        data: histData.b || [],
                        borderColor: 'rgba(37, 99, 235, 0.9)',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { labels: { color: '#374151', font: { size: 10, weight: 'bold' } } }
                },
                scales: {
                    x: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: '#e5e7eb' } },
                    y: { ticks: { color: '#6b7280', font: { size: 9 } }, grid: { color: '#e5e7eb' } }
                }
            }
        };

        if (canvasId === 'chart-orig-hist') {
            if (chartOrig) chartOrig.destroy();
            chartOrig = new Chart(ctx, chartConfig);
        } else {
            if (chartProc) chartProc.destroy();
            chartProc = new Chart(ctx, chartConfig);
        }
    }

    // Initial Trigger
    triggerProcessing();
});
