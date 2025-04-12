# 🧠 Object Detection in React + TensorFlow.js (YOLOv7)

A browser-based object detection project built with **React (Vite)**, **TensorFlow.js**, and **Tailwind CSS**.  
This app runs inference directly on the frontend using a YOLOv7 model converted to TensorFlow.js format—no backend required.

---

## ⚙️ Tech Stack

- [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/))
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript
- HTML5 Canvas

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/react-yolov7-tfjs.git
cd react-yolov7-tfjs
```

### 2. Install dependencies

You can use either **npm** or **yarn**:

```bash
# With npm
npm install

# With yarn
yarn install
```

### 3. Run the development server

```bash
# With npm
npm run dev

# With yarn
yarn dev
```

Then, open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Model Placement

Place your TensorFlow.js model files in the following directory:

```
public/tfjs_model/
```

Expected files:

- `model.json`
- `*.bin` (binary weight files)

---

## 🔄 Convert YOLOv7 to TensorFlow.js

This project uses a YOLOv7 model converted from PyTorch to TensorFlow.js via ONNX.  
Here’s the full conversion pipeline:

### 1. PyTorch → ONNX

[Official Tutorial from WongKinYiu to Export Model](https://colab.research.google.com/github/WongKinYiu/yolov7/blob/main/tools/YOLOv7onnx.ipynb)

### 2. ONNX → TensorFlow SavedModel → TensorFlow.js

[Google Collab Execution](https://colab.research.google.com/drive/167qI8kMliSTVpaQ5P0cyr0XK-kXtTqWY?usp=sharing)

---

## ⚠️ About the License

This project uses the [YOLOv7](https://github.com/WongKinYiu/yolov7) implementation by **WongKinYiu**, which provides strong performance and a more flexible license than later versions (e.g. YOLOv8 by Ultralytics, which uses AGPLv3).

AGPLv3 may restrict commercial use, as it requires full source code disclosure for any publicly accessible app.

---

## 🙌 Credits

- YOLOv7 by [WongKinYiu](https://github.com/WongKinYiu/yolov7)
- TensorFlow.js by [Google](https://www.tensorflow.org/js)
- UI powered by [Tailwind CSS](https://tailwindcss.com/)
- Project scaffolded with [Vite](https://vitejs.dev/)

---

## 👋 About the Author

This project is part of my personal learning journey in combining frontend development with machine learning.

Feel free to fork, contribute, or reach out!
