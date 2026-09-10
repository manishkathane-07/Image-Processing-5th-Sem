import os
import numpy as np
import cv2

def create_hazy_mountains(width=900, height=600):
    """Generate Image 1: High-detail Hazy Mountain Range (Atmospheric Haze)"""
    np.random.seed(42)
    img = np.zeros((height, width, 3), dtype=np.float32)
    
    y_coords = np.linspace(0, 1, height)[:, None]
    x_coords = np.linspace(0, 1, width)[None, :]
    
    # Sky gradient (hazy blue-gray)
    img[:, :, 0] = 215 - y_coords[:, 0:1] * 35  # B
    img[:, :, 1] = 200 - y_coords[:, 0:1] * 30  # G
    img[:, :, 2] = 185 - y_coords[:, 0:1] * 25  # R
    
    # Clouds texture
    cloud_noise = np.zeros((height, width), dtype=np.float32)
    for scale in [20, 50, 100]:
        h_s, w_s = max(1, height//scale), max(1, width//scale)
        n = cv2.resize(np.random.rand(h_s, w_s).astype(np.float32), (width, height))
        cloud_noise += n / (scale**0.5)
    cloud_mask = (y_coords[:, 0] < 0.45)[:, None] & (cloud_noise > 0.4)
    img[cloud_mask, 0] = np.clip(img[cloud_mask, 0] + 30, 0, 255)
    img[cloud_mask, 1] = np.clip(img[cloud_mask, 1] + 30, 0, 255)
    img[cloud_mask, 2] = np.clip(img[cloud_mask, 2] + 30, 0, 255)

    # 5 Detailed Mountain Ridges with realistic fracture texture
    for layer in range(5):
        base_y = 0.30 + layer * 0.11
        freq = 3.0 + layer * 2.5
        amp = 0.15 / (layer + 1)**0.6
        
        # Ridge line
        ridge = np.zeros(width, dtype=np.float32)
        for octave in [1, 2, 4, 8]:
            sub_n = np.interp(np.linspace(0, octave * freq, width), np.arange(octave * int(freq) + 2), np.random.rand(octave * int(freq) + 2))
            ridge += sub_n * (amp / octave)
            
        ridge_y = (base_y + ridge) * height
        
        # Color & Haze depth gradient
        haze = 0.75 - layer * 0.14
        b_c = 175 * haze + 35 * (1 - haze)
        g_c = 180 * haze + 45 * (1 - haze)
        r_c = 185 * haze + 40 * (1 - haze)
        
        for x in range(width):
            ry = int(ridge_y[x])
            if ry < height:
                tex = np.random.normal(0, 4, size=(height - ry, 3))
                layer_col = np.array([b_c, g_c, r_c], dtype=np.float32) + tex
                img[ry:, x, :] = np.clip(layer_col, 0, 255)

    img = cv2.GaussianBlur(img, (3, 3), 0)
    img = np.clip(img, 105, 215).astype(np.uint8)
    return img

def create_dark_forest(width=900, height=600):
    """Generate Image 2: High-detail Underexposed Forest Shadows"""
    np.random.seed(101)
    img = np.zeros((height, width, 3), dtype=np.float32)
    
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    
    sky_mask = y_grid < (height * 0.22)
    img[sky_mask, 0] = 75 - (y_grid[sky_mask] / height) * 40
    img[sky_mask, 1] = 80 - (y_grid[sky_mask] / height) * 40
    img[sky_mask, 2] = 75 - (y_grid[sky_mask] / height) * 40
    
    forest_mask = y_grid >= (height * 0.22)
    pine_tex = np.random.normal(0, 6, size=(height, width, 3))
    
    base_b = 20 + 15 * np.sin(x_grid / 20.0) * np.cos(y_grid / 15.0)
    base_g = 40 + 25 * np.sin(x_grid / 25.0) * np.cos(y_grid / 18.0)
    base_r = 25 + 18 * np.sin(x_grid / 30.0)
    
    img[forest_mask, 0] = base_b[forest_mask] + pine_tex[forest_mask, 0]
    img[forest_mask, 1] = base_g[forest_mask] + pine_tex[forest_mask, 1]
    img[forest_mask, 2] = base_r[forest_mask] + pine_tex[forest_mask, 2]
    
    for tree_i in range(35):
        t_x = np.random.randint(20, width - 20)
        t_w = np.random.randint(15, 35)
        t_h = np.random.randint(220, 420)
        t_y = height - t_h
        
        cv2.rectangle(img, (t_x - t_w//4, t_y + 120), (t_x + t_w//4, height), (12, 18, 15), -1)
        for f in range(4):
            fy = t_y + f * 50
            fw = t_w + (4 - f) * 18
            pts = np.array([[t_x - fw, fy + 70], [t_x + fw, fy + 70], [t_x, fy]], np.int32)
            cv2.fillPoly(img, [pts], (10 + f*4, 28 + f*6, 15 + f*4))

    img = np.clip(img, 4, 95).astype(np.uint8)
    return img

def create_sunset_lake(width=900, height=600):
    """Generate Image 3: High Dynamic Range Sunset Over Lake"""
    np.random.seed(202)
    img = np.zeros((height, width, 3), dtype=np.float32)
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    
    horizon = int(height * 0.52)
    sky_mask = y_grid <= horizon
    norm_y = y_grid[sky_mask] / horizon
    
    img[sky_mask, 0] = 40 + norm_y * 130
    img[sky_mask, 1] = 60 + norm_y * 120
    img[sky_mask, 2] = 235 - norm_y * 40
    
    sun_center = (int(width * 0.5), int(horizon * 0.78))
    cv2.circle(img, sun_center, 50, (160, 235, 255), -1)
    cv2.circle(img, sun_center, 80, (80, 180, 255), -1)
    
    water_mask = y_grid > horizon
    norm_w = (y_grid[water_mask] - horizon) / (height - horizon)
    ripple = 12 * np.sin(x_grid[water_mask] / 6.0) * np.cos(y_grid[water_mask] / 4.0)
    
    img[water_mask, 0] = (40 + (1 - norm_w) * 110 + ripple) * 0.7
    img[water_mask, 1] = (60 + (1 - norm_w) * 90 + ripple) * 0.6
    img[water_mask, 2] = (210 - norm_w * 90 + ripple) * 0.7
    
    pts_left = np.array([[0, horizon], [250, horizon], [140, horizon - 140], [0, horizon - 80]], np.int32)
    pts_right = np.array([[width, horizon], [width - 280, horizon], [width - 150, horizon - 160], [width, horizon - 90]], np.int32)
    cv2.fillPoly(img, [pts_left], (15, 18, 22))
    cv2.fillPoly(img, [pts_right], (12, 16, 20))
    
    img = np.clip(img, 12, 250).astype(np.uint8)
    return img

def create_misty_valley(width=900, height=600):
    """Generate Image 4: Misty Valley & Fog (Low Contrast Mid-tones)"""
    np.random.seed(303)
    img = np.zeros((height, width, 3), dtype=np.float32)
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    
    base_gray = 130 + 18 * np.sin(x_grid / 45.0) * np.cos(y_grid / 35.0)
    img[:, :, 0] = base_gray + 15
    img[:, :, 1] = base_gray + 8
    img[:, :, 2] = base_gray - 5
    
    for h in range(4):
        h_y = int(height * (0.35 + h * 0.15))
        hill_curve = h_y + 40 * np.sin(x_grid[0, :] * 0.007 + h * 1.5) + 15 * np.cos(x_grid[0, :] * 0.015)
        mask = y_grid > hill_curve[None, :]
        opacity = 0.20 + h * 0.20
        
        target_b = 95 - h * 14
        target_g = 110 - h * 14
        target_r = 100 - h * 14
        
        noise = np.random.normal(0, 3, size=img[mask, 0].shape)
        img[mask, 0] = img[mask, 0] * (1 - opacity) + (target_b + noise) * opacity
        img[mask, 1] = img[mask, 1] * (1 - opacity) + (target_g + noise) * opacity
        img[mask, 2] = img[mask, 2] * (1 - opacity) + (target_r + noise) * opacity

    img = cv2.GaussianBlur(img, (5, 5), 0)
    img = np.clip(img, 75, 180).astype(np.uint8)
    return img

def create_coastal_rocks(width=900, height=600):
    """Generate Image 5: Coastal Rocks & Ocean Waves"""
    np.random.seed(404)
    img = np.zeros((height, width, 3), dtype=np.float32)
    y_grid, x_grid = np.mgrid[0:height, 0:width]
    
    water_b = 165 + 35 * np.sin(x_grid / 18.0 + y_grid / 12.0)
    water_g = 135 + 28 * np.sin(x_grid / 22.0)
    water_r = 75 + 18 * np.cos(y_grid / 18.0)
    
    img[:, :, 0] = water_b
    img[:, :, 1] = water_g
    img[:, :, 2] = water_r
    
    cliff_x_bound = (width * 0.38) - (y_grid * 0.2) + 25 * np.sin(y_grid / 25.0)
    cliff_mask = x_grid < cliff_x_bound
    
    rock_tex = np.random.normal(0, 8, size=(height, width, 3))
    img[cliff_mask, 0] = 35 + rock_tex[cliff_mask, 0]
    img[cliff_mask, 1] = 48 + rock_tex[cliff_mask, 1]
    img[cliff_mask, 2] = 52 + rock_tex[cliff_mask, 2]
    
    foam_edge = (x_grid >= cliff_x_bound - 15) & (x_grid <= cliff_x_bound + 15)
    img[foam_edge, 0] = 220 + np.random.normal(0, 10, size=img[foam_edge, 0].shape)
    img[foam_edge, 1] = 225 + np.random.normal(0, 10, size=img[foam_edge, 1].shape)
    img[foam_edge, 2] = 230 + np.random.normal(0, 10, size=img[foam_edge, 2].shape)
    
    img = np.clip(img, 18, 245).astype(np.uint8)
    return img

def generate_all_samples(output_dir="samples"):
    os.makedirs(output_dir, exist_ok=True)
    
    generators = {
        "landscape1_hazy_mountains.jpg": create_hazy_mountains,
        "landscape2_dark_forest.jpg": create_dark_forest,
        "landscape3_sunset_lake.jpg": create_sunset_lake,
        "landscape4_misty_valley.jpg": create_misty_valley,
        "landscape5_coastal_rocks.jpg": create_coastal_rocks
    }
    
    generated_paths = {}
    for filename, func in generators.items():
        filepath = os.path.join(output_dir, filename)
        img = func()
        cv2.imwrite(filepath, img)
        generated_paths[filename] = filepath
        print(f"Generated sample landscape: {filepath} ({img.shape[1]}x{img.shape[0]})")
        
    return generated_paths

if __name__ == "__main__":
    generate_all_samples()
