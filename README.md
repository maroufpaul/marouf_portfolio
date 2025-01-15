# Data Science Portfolio with 3D Fractal & Neural Network Animation

Welcome to the ** My Portfolio** project of Marouf Paul! This repository showcases a **modern, interactive** web portfolio featuring:

- A **two-column hero layout**: text and CTAs on the left, a **3D fractal + neural network** animation on the right.  
- A **rotating fractal sphere** driven by custom shaders (for wave-like distortion and color shifting).  
- A **dynamic neural network** with pulsing lines and node hover effects.  
- A fully **responsive** design that adapts to desktop, tablet, or mobile screens.  
- **No** complicated drag/merge/split features—just smooth, visually appealing interactions that remain stable on resize.

---

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Key Features](#key-features)  
3. [Technologies & Dependencies](#technologies--dependencies)  
4. [File Structure](#file-structure)  
5. [Installation & Setup](#installation--setup)  
6. [Configuration & Customization](#configuration--customization)  
7. [Preview & Screenshots](#preview--screenshots)  
8. [Notes & Future Ideas](#notes--future-ideas)
9. [License](#license)

---

## Project Overview

This project is built to **showcase my portfolio** or any anyone who wants a **visually engaging** hero section. The hero is divided into **two columns**:

- **Left**: Introduces ME!!!, showing key roles, a short subtitle, and action buttons (View Projects, Contact).  
- **Right**: A **3D fractal sphere** that rotates continuously, changes color based on mouse movement, and brightens on hover. Around it floats a **neural network** of nodes connected by lines, each line pulsing in opacity thanks to simplex-noise.

The rest of the site (e.g., About, Skills, Projects, Experience) remains a typical portfolio layout—**clean** and **professional**.

---

## Key Features

1. **Fractal Sphere**  
   - **Shader-based** distortion with wave-like offset.  
   - **Color shift** determined by mouse position (HSL-based).  
   - **Hover** detection brightens the sphere slightly, preventing an overly dim appearance.

2. **Neural Network**  
   - Each node is a small sphere with an emissive teal color.  
   - Lines connect nodes whose distance is below a threshold (forming a random “constellation” effect).  
   - Line opacity **pulses** using 3D simplex noise.

3. **Responsive Two-Column Layout**  
   - On wider screens, hero text sits in the left column, while the 3D animation occupies the right column.  
   - On narrower/mobile screens, the layout can switch to one column (configurable via CSS media queries).

4. **OrbitControls** (Optional)**  
   - The user can optionally rotate or zoom the scene.  
   - If you prefer a purely **static** approach, you can disable user interactions and only keep autoRotate.

5. **Balanced Brightness**  
   - Custom fragment shader ensures the sphere’s “dark side” is never pitch black.

---

## Technologies & Dependencies

- **HTML5** & **CSS3** for structure and styling.  
- **JavaScript (ES6+)** for the logic, interactivity, and fractal sphere creation.  
- [**Three.js**](https://threejs.org/) for the 3D rendering, camera, geometry, and materials.  
- [**OrbitControls**](https://threejs.org/docs/#examples/en/controls/OrbitControls) (patched version) to allow or restrict user navigation of the scene.  
- [**simplex-noise**](https://www.npmjs.com/package/simplex-noise) for line pulsing / fractal noise logic.  
- [**Markdown** (this README)] for documentation.

---

## File Structure

Your project might look like this:


Briefly:

- **`index.html`**  
  Sets up the **two-column** hero layout (text on left, `<div id="hero-3d-bg">` on right). Links to `styles.css` and loads the `3d-animation.js` script.

- **`styles.css`**  
  Defines the **hero-section** flex layout, `.hero-left` and `.hero-right`, plus other global styles (header, nav, etc.).

- **`3d-animation.js`**  
  - **Initializes** the scene, camera, and renderer, referencing `<div id="hero-3d-bg">`.  
  - **Creates** the fractal sphere with custom shaders and the neural net.  
  - **Manages** the color shift logic and line pulsing.  
  - **Listens** for hover detection and updates brightness or node scale as needed.

- **`libs/OrbitControls.js`**  
  (Optional, if you want user rotation). Must be a version that references `three.module.js` from the same CDN or your local copy, avoiding “bare specifier” errors.

---

## Installation & Setup

1. **Clone** or **download** this repository.
2. **Open** the folder in your code editor.
3. Make sure you have a **local server** to serve `index.html`. (You can use e.g. a simple extension in VS Code or run `python -m http.server 8080` in the folder.)
4. Open `http://localhost:8080/` (or whichever port) in your browser.  
   - The hero section loads with text on the left and the **3D fractal** + **neural network** on the right.

To ensure the 3D animation works:

- You must have an active internet connection to pull the Three.js / simplex-noise from the unpkg CDN **or** provide them locally.  
- If you get a MIME or “bare specifier” error for `OrbitControls.js`, ensure it’s referencing `three.module.js` with a **full URL**.

---

## Configuration & Customization

1. **Adjust the camera**: In `3d-animation.js`, look for `camera.position.set(...)`. 
   - Increase `z` if you want the fractal smaller in view.
   - Shift `x` if you want it more to the left or right.

2. **Disable/Enable user rotation**: In `init()` of `3d-animation.js`:
   ```js
   controls.enableRotate = false;
   controls.enableZoom = false;
   controls.enablePan = false;
   controls.autoRotate = true; 




