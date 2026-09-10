import cv2
import numpy as np
import matplotlib.pyplot as plt

image = cv2.imread("I1.jpg")

if image is None:
    print("Error: Image not found!")
    exit()

# Convert BGR to RGB
rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Split RGB channels
R, G, B = cv2.split(rgb_image)

# Apply histogram equalization to each channel
R_equalized = cv2.equalizeHist(R)
G_equalized = cv2.equalizeHist(G)
B_equalized = cv2.equalizeHist(B)

# Merge the equalized channels
equalized_image = cv2.merge(
    [R_equalized, G_equalized, B_equalized]
)

plt.figure(figsize=(12, 6))

plt.subplot(1, 2, 1)
plt.imshow(rgb_image)
plt.title("Original Landscape")
plt.axis("off")

plt.subplot(1, 2, 2)
plt.imshow(equalized_image)
plt.title("RGB Histogram Equalized")
plt.axis("off")

plt.tight_layout()
plt.show()

plt.figure(figsize=(12, 8))

# Original RGB histograms
plt.subplot(2, 2, 1)
plt.hist(R.ravel(), bins=256, range=(0, 256), alpha=0.5, label="Red")
plt.hist(G.ravel(), bins=256, range=(0, 256), alpha=0.5, label="Green")
plt.hist(B.ravel(), bins=256, range=(0, 256), alpha=0.5, label="Blue")
plt.title("Original RGB Histogram")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.legend()

# Equalized RGB histograms
plt.subplot(2, 2, 2)
plt.hist(R_equalized.ravel(), bins=256, range=(0, 256),
         alpha=0.5, label="Red")
plt.hist(G_equalized.ravel(), bins=256, range=(0, 256),
         alpha=0.5, label="Green")
plt.hist(B_equalized.ravel(), bins=256, range=(0, 256),
         alpha=0.5, label="Blue")
plt.title("Equalized RGB Histogram")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.legend()

# Individual original channels
plt.subplot(2, 2, 3)
plt.plot(cv2.calcHist([R], [0], None, [256], [0, 256]),
         label="Red")
plt.plot(cv2.calcHist([G], [0], None, [256], [0, 256]),
         label="Green")
plt.plot(cv2.calcHist([B], [0], None, [256], [0, 256]),
         label="Blue")
plt.title("Original Channel Histograms")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.legend()

# Individual equalized channels
plt.subplot(2, 2, 4)
plt.plot(cv2.calcHist([R_equalized], [0], None, [256], [0, 256]),
         label="Red")
plt.plot(cv2.calcHist([G_equalized], [0], None, [256], [0, 256]),
         label="Green")
plt.plot(cv2.calcHist([B_equalized], [0], None, [256], [0, 256]),
         label="Blue")
plt.title("Equalized Channel Histograms")
plt.xlabel("Pixel Intensity")
plt.ylabel("Frequency")
plt.legend()

plt.tight_layout()
plt.show()

output = cv2.cvtColor(equalized_image, cv2.COLOR_RGB2BGR)

cv2.imwrite("equalized_landscape.jpg", output)

print("Histogram equalization completed successfully.")
print("Output saved as: equalized_landscape.jpg")