import time
import numpy as np
import cv2
from scipy.stats import entropy

def calculate_histogram_and_cdf(channel):
    """
    Computes discrete histogram H(r_k), PDF P(r_k), and CDF C(r_k) for an 8-bit single channel.
    """
    hist, _ = np.histogram(channel.flatten(), bins=256, range=[0, 256])
    total_pixels = channel.size
    pdf = hist / float(total_pixels)
    cdf = np.cumsum(pdf)
    return hist.tolist(), pdf.tolist(), cdf.tolist()

def equalize_channel_manual(channel):
    """
    Manual implementation of Histogram Equalization using CDF lookup table.
    Transformation formula: s_k = round((L - 1) * CDF(r_k))
    """
    hist, pdf, cdf = calculate_histogram_and_cdf(channel)
    cdf_arr = np.array(cdf, dtype=np.float32)
    
    # Mask non-zero values to retain minimum CDF value for non-linear stretching
    cdf_m = np.ma.masked_equal(cdf_arr, 0)
    if cdf_m.max() == cdf_m.min():
        lut = np.arange(256, dtype=np.uint8)
    else:
        lut = (cdf_m - cdf_m.min()) * 255 / (cdf_m.max() - cdf_m.min())
        lut = np.ma.filled(lut, 0).astype(np.uint8)
        
    equalized_channel = lut[channel]
    return equalized_channel, lut.tolist(), hist, cdf

def equalize_rgb_direct(img_bgr):
    """
    Applies Histogram Equalization independently on Blue, Green, Red channels.
    """
    start_time = time.time()
    b, g, r = cv2.split(img_bgr)
    
    b_eq, _, b_h, b_c = equalize_channel_manual(b)
    g_eq, _, g_h, g_c = equalize_channel_manual(g)
    r_eq, _, r_h, r_c = equalize_channel_manual(r)
    
    img_equalized = cv2.merge([b_eq, g_eq, r_eq])
    exec_time_ms = (time.time() - start_time) * 1000.0
    
    hist_data = {
        "original": {
            "b": b_h, "g": g_h, "r": r_h
        },
        "equalized": {
            "b": calculate_histogram_and_cdf(b_eq)[0],
            "g": calculate_histogram_and_cdf(g_eq)[0],
            "r": calculate_histogram_and_cdf(r_eq)[0]
        },
        "cdf": {
            "b": b_c, "g": g_c, "r": r_c
        }
    }
    return img_equalized, exec_time_ms, hist_data

def equalize_hsv_vchannel(img_bgr):
    """
    Benchmark method 1: Decoupled Equalization in HSV Color Space (V-channel only).
    """
    start_time = time.time()
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    v_eq = cv2.equalizeHist(v)
    hsv_eq = cv2.merge([h, s, v_eq])
    img_equalized = cv2.cvtColor(hsv_eq, cv2.COLOR_HSV2BGR)
    exec_time_ms = (time.time() - start_time) * 1000.0
    return img_equalized, exec_time_ms

def equalize_ycrcb_ychannel(img_bgr):
    """
    Benchmark method 2: Decoupled Equalization in YCrCb Color Space (Y-channel only).
    """
    start_time = time.time()
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    y_eq = cv2.equalizeHist(y)
    ycrcb_eq = cv2.merge([y_eq, cr, cb])
    img_equalized = cv2.cvtColor(ycrcb_eq, cv2.COLOR_YCrCb2BGR)
    exec_time_ms = (time.time() - start_time) * 1000.0
    return img_equalized, exec_time_ms

def apply_clahe(img_bgr, clip_limit=2.0, tile_grid_size=(8, 8)):
    """
    Contrast Limited Adaptive Histogram Equalization (CLAHE) on Lab color space L channel.
    """
    start_time = time.time()
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    l_clahe = clahe.apply(l)
    lab_clahe = cv2.merge([l_clahe, a, b])
    img_clahe = cv2.cvtColor(lab_clahe, cv2.COLOR_LAB2BGR)
    exec_time_ms = (time.time() - start_time) * 1000.0
    return img_clahe, exec_time_ms

def add_noise(img_bgr, noise_type="none", noise_level=0.02):
    """
    Injects synthetic noise models into the input image.
    """
    if noise_type == "none" or noise_level <= 0:
        return img_bgr.copy()
        
    noisy = img_bgr.astype(np.float32)
    
    if noise_type == "gaussian":
        sigma = noise_level * 255.0
        gauss = np.random.normal(0, sigma, img_bgr.shape).astype(np.float32)
        noisy = noisy + gauss
    elif noise_type == "salt_pepper":
        # Salt & Pepper noise
        num_salt = np.ceil(noise_level * img_bgr.size * 0.5)
        num_pepper = np.ceil(noise_level * img_bgr.size * 0.5)
        
        # Salt
        coords = [np.random.randint(0, i - 1, int(num_salt)) for i in img_bgr.shape[:2]]
        noisy[coords[0], coords[1], :] = 255.0
        
        # Pepper
        coords = [np.random.randint(0, i - 1, int(num_pepper)) for i in img_bgr.shape[:2]]
        noisy[coords[0], coords[1], :] = 0.0
    elif noise_type == "speckle":
        gauss = np.random.normal(0, noise_level, img_bgr.shape).astype(np.float32)
        noisy = noisy + noisy * gauss
        
    noisy = np.clip(noisy, 0, 255).astype(np.uint8)
    return noisy

def apply_spatial_filter(img_bgr, filter_type="none", kernel_size=3, param1=1.0):
    """
    Applies spatial domain enhancement/denoising filters with configurable kernel sizes (3, 5, 7, 9).
    """
    if filter_type == "none" or kernel_size < 1:
        return img_bgr.copy()
        
    # Ensure kernel_size is odd integer >= 3
    k = max(3, kernel_size if kernel_size % 2 != 0 else kernel_size + 1)
    
    if filter_type == "mean":
        return cv2.blur(img_bgr, (k, k))
    elif filter_type == "gaussian":
        sigma = param1 if param1 > 0 else 0
        return cv2.GaussianBlur(img_bgr, (k, k), sigma)
    elif filter_type == "median":
        return cv2.medianBlur(img_bgr, k)
    elif filter_type == "bilateral":
        # Bilateral filter
        d = k
        sigma_color = param1 * 50.0
        sigma_space = param1 * 50.0
        return cv2.bilateralFilter(img_bgr, d, sigma_color, sigma_space)
    elif filter_type == "sharpen":
        # Laplacian unsharp mask
        blurred = cv2.GaussianBlur(img_bgr, (k, k), 0)
        sharpened = cv2.addWeighted(img_bgr, 1.5, blurred, -0.5, 0)
        return np.clip(sharpened, 0, 255).astype(np.uint8)
    else:
        return img_bgr.copy()

# ==================== PERFORMANCE METRICS ENGINE ====================

def compute_rms_contrast(img_bgr):
    """
    Computes Root Mean Square (RMS) Contrast:
    sigma_RMS = sqrt( (1 / (M*N)) * sum( (I(x,y) - I_bar)^2 ) )
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    mean_val = np.mean(gray)
    rms = np.sqrt(np.mean((gray - mean_val) ** 2))
    return float(rms)

def compute_shannon_entropy(img_bgr):
    """
    Computes Shannon Information Entropy (bits):
    H = - sum( P(r_k) * log2(P(r_k)) )
    Maximum theoretical entropy for 8-bit image is 8.0 bits.
    """
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    hist, _ = np.histogram(gray.flatten(), bins=256, range=[0, 256])
    pdf = hist / float(gray.size)
    pdf = pdf[pdf > 0]
    ent = -np.sum(pdf * np.log2(pdf))
    return float(ent)

def compute_mean_brightness(img_bgr):
    """Computes Mean Intensity / Brightness level [0, 255]."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return float(np.mean(gray))

def compute_ambe(original_bgr, processed_bgr):
    """
    Computes Absolute Mean Brightness Error (AMBE):
    AMBE = | Mean_In - Mean_Out |
    Lower AMBE indicates better brightness preservation.
    """
    orig_mean = compute_mean_brightness(original_bgr)
    proc_mean = compute_mean_brightness(processed_bgr)
    return float(abs(orig_mean - proc_mean))

def compute_psnr(original_bgr, processed_bgr):
    """
    Computes Peak Signal-to-Noise Ratio (PSNR) in dB:
    PSNR = 10 * log10( 255^2 / MSE )
    """
    mse = np.mean((original_bgr.astype(np.float64) - processed_bgr.astype(np.float64)) ** 2)
    if mse == 0:
        return 100.0  # Infinite PSNR (identical images)
    max_pixel = 255.0
    psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
    return float(psnr)

def compute_ssim(original_bgr, processed_bgr):
    """
    Computes Structural Similarity Index (SSIM) between original and processed images [0, 1].
    """
    orig_gray = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    proc_gray = cv2.cvtColor(processed_bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    
    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2
    
    mu1 = cv2.GaussianBlur(orig_gray, (11, 11), 1.5)
    mu2 = cv2.GaussianBlur(proc_gray, (11, 11), 1.5)
    
    mu1_sq = mu1 ** 2
    mu2_sq = mu2 ** 2
    mu1_mu2 = mu1 * mu2
    
    sigma1_sq = cv2.GaussianBlur(orig_gray ** 2, (11, 11), 1.5) - mu1_sq
    sigma2_sq = cv2.GaussianBlur(proc_gray ** 2, (11, 11), 1.5) - mu2_sq
    sigma12 = cv2.GaussianBlur(orig_gray * proc_gray, (11, 11), 1.5) - mu1_mu2
    
    ssim_map = ((2 * mu1_mu2 + C1) * (2 * sigma12 + C2)) / ((mu1_sq + mu2_sq + C1) * (sigma1_sq + sigma2_sq + C2))
    return float(np.mean(ssim_map))

def compute_snr(img_bgr):
    """Computes Signal-to-Noise Ratio (SNR) in dB."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    mean_val = np.mean(gray)
    std_val = np.std(gray)
    if std_val == 0:
        return 100.0
    return float(20 * np.log10(mean_val / std_val))

def evaluate_all_metrics(original_bgr, processed_bgr, exec_time_ms=0.0):
    """
    Evaluates complete suite of performance metrics for an image processing pipeline run.
    """
    return {
        "rms_contrast": round(compute_rms_contrast(processed_bgr), 2),
        "shannon_entropy": round(compute_shannon_entropy(processed_bgr), 4),
        "mean_brightness": round(compute_mean_brightness(processed_bgr), 2),
        "ambe": round(compute_ambe(original_bgr, processed_bgr), 2),
        "psnr": round(compute_psnr(original_bgr, processed_bgr), 2),
        "ssim": round(compute_ssim(original_bgr, processed_bgr), 4),
        "snr": round(compute_snr(processed_bgr), 2),
        "execution_time_ms": round(exec_time_ms, 2)
    }

def run_full_pipeline(img_bgr, method="rgb_he", noise_type="none", noise_level=0.02, 
                      filter_type="none", kernel_size=3, filter_param=1.0):
    """
    Runs the complete modular pipeline: Noise Injection -> Spatial Filter -> Equalization Method -> Metric Computation.
    """
    # 1. Noise injection (if any)
    noisy_img = add_noise(img_bgr, noise_type, noise_level)
    
    # 2. Pre-filtering (if any)
    filtered_img = apply_spatial_filter(noisy_img, filter_type, kernel_size, filter_param)
    
    # 3. Equalization Method
    hist_data = None
    if method == "rgb_he":
        processed_img, exec_time_ms, hist_data = equalize_rgb_direct(filtered_img)
    elif method == "hsv_v":
        processed_img, exec_time_ms = equalize_hsv_vchannel(filtered_img)
    elif method == "ycrcb_y":
        processed_img, exec_time_ms = equalize_ycrcb_ychannel(filtered_img)
    elif method == "clahe":
        # clip limit from filter_param, grid size from kernel_size
        grid = (max(2, kernel_size), max(2, kernel_size))
        processed_img, exec_time_ms = apply_clahe(filtered_img, clip_limit=max(1.0, filter_param*2.0), tile_grid_size=grid)
    elif method == "raw":
        processed_img = filtered_img
        exec_time_ms = 0.0
    else:
        processed_img, exec_time_ms, hist_data = equalize_rgb_direct(filtered_img)

    # 4. Metrics calculation
    metrics = evaluate_all_metrics(img_bgr, processed_img, exec_time_ms)
    
    return {
        "processed_img": processed_img,
        "noisy_img": noisy_img,
        "filtered_img": filtered_img,
        "metrics": metrics,
        "hist_data": hist_data
    }
