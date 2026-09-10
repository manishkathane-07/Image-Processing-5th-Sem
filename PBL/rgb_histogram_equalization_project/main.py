import os
import time
import argparse
import base64
import cv2
import numpy as np

# FastAPI imports
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from src.sample_generator import generate_all_samples
from src.image_processor import run_full_pipeline, calculate_histogram_and_cdf
from src.report_generator import run_all_benchmarks, generate_markdown_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
samples_dir = os.path.join(BASE_DIR, "samples")
web_dir = os.path.join(BASE_DIR, "web")

# Ensure sample images exist
samples_map = generate_all_samples(samples_dir)

app = FastAPI(title="RGB Histogram Equalization Web Suite")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessRequest(BaseModel):
    sample_name: str = "landscape1_hazy_mountains"
    custom_image: str = None
    method: str = "rgb_he"
    noise_type: str = "none"
    noise_level: float = 0.02
    filter_type: str = "none"
    kernel_size: int = 3
    filter_param: float = 1.0

# Cache last processed image bytes for direct static fetching
last_processed_bytes = None
last_original_bytes = None

def numpy_to_base64(img_bgr):
    _, buffer = cv2.imencode('.jpg', img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

def numpy_to_bytes(img_bgr):
    _, buffer = cv2.imencode('.jpg', img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return buffer.tobytes()

@app.post("/api/process")
async def api_process_image(req: ProcessRequest):
    global last_processed_bytes, last_original_bytes
    
    # 1. Load image
    if req.custom_image and req.sample_name == 'custom':
        try:
            header, encoded = req.custom_image.split(",", 1)
            data = base64.b64decode(encoded)
            nparr = np.frombuffer(data, np.uint8)
            img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to decode custom image: {str(e)}")
    else:
        sample_filename = req.sample_name if req.sample_name.endswith('.jpg') else f"{req.sample_name}.jpg"
        sample_path = os.path.join(samples_dir, sample_filename)
        if not os.path.exists(sample_path):
            sample_path = os.path.join(samples_dir, "landscape1_hazy_mountains.jpg")
        img_bgr = cv2.imread(sample_path)

    if img_bgr is None:
        raise HTTPException(status_code=400, detail="Invalid image input")

    # Resize image if larger than 1000px for instant real-time performance
    h, w = img_bgr.shape[:2]
    if max(h, w) > 1000:
        scale = 1000.0 / max(h, w)
        img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)))

    # 2. Run pipeline
    result = run_full_pipeline(
        img_bgr=img_bgr,
        method=req.method,
        noise_type=req.noise_type,
        noise_level=req.noise_level,
        filter_type=req.filter_type,
        kernel_size=req.kernel_size,
        filter_param=req.filter_param
    )

    last_original_bytes = numpy_to_bytes(img_bgr)
    last_processed_bytes = numpy_to_bytes(result["processed_img"])

    # 3. Calculate Histograms for charts
    orig_b, orig_g, orig_r = cv2.split(img_bgr)
    proc_b, proc_g, proc_r = cv2.split(result["processed_img"])

    histograms = {
        "original": {
            "b": calculate_histogram_and_cdf(orig_b)[0],
            "g": calculate_histogram_and_cdf(orig_g)[0],
            "r": calculate_histogram_and_cdf(orig_r)[0]
        },
        "equalized": {
            "b": calculate_histogram_and_cdf(proc_b)[0],
            "g": calculate_histogram_and_cdf(proc_g)[0],
            "r": calculate_histogram_and_cdf(proc_r)[0]
        }
    }

    ts = int(time.time() * 1000)
    return {
        "original_image": numpy_to_base64(img_bgr),
        "processed_image": numpy_to_base64(result["processed_img"]),
        "original_url": f"/api/original_image.jpg?t={ts}",
        "processed_url": f"/api/processed_image.jpg?t={ts}",
        "dimensions": f"{img_bgr.shape[1]}x{img_bgr.shape[0]} px",
        "metrics": result["metrics"],
        "histograms": histograms
    }

@app.get("/api/original_image.jpg")
async def get_original_image():
    global last_original_bytes
    if last_original_bytes is None:
        raise HTTPException(status_code=404, detail="No original image cached yet")
    return Response(content=last_original_bytes, media_type="image/jpeg")

@app.get("/api/processed_image.jpg")
async def get_processed_image():
    global last_processed_bytes
    if last_processed_bytes is None:
        raise HTTPException(status_code=404, detail="No processed image cached yet")
    return Response(content=last_processed_bytes, media_type="image/jpeg")

# Mount static directories
app.mount("/samples", StaticFiles(directory=samples_dir), name="samples")
app.mount("/", StaticFiles(directory=web_dir, html=True), name="static_root")

def main():
    parser = argparse.ArgumentParser(description="RGB Histogram Equalization Project")
    parser.add_argument("--server", action="store_true", help="Start FastAPI Web Application Server")
    parser.add_argument("--port", type=int, default=8000, help="Port to run server on")
    parser.add_argument("--batch", action="store_true", help="Run full benchmark suite and generate report")
    args = parser.parse_args()

    if args.batch:
        print("Generating samples, running benchmark suite, and building report...")
        benchmark_data = run_all_benchmarks()
        generate_markdown_report(benchmark_data)
        print("Report generation complete: REPORT_RGB_Histogram_Equalization.md")

    if args.server or not args.batch:
        print(f"Starting Web Application Server at http://localhost:{args.port} ...")
        uvicorn.run(app, host="0.0.0.0", port=args.port)

if __name__ == "__main__":
    main()
