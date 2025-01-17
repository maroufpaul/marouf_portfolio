# Interactive Fractal Neural Network Portfolio

Welcome to my portfolio project featuring an advanced **interactive fractal-neural network animation**. This project showcases a unique blend of mathematical visualization and artificial neural network aesthetics, creating an engaging and dynamic user experience.

## Animation Features

### 1. Fractal Visualization System
- **Interactive Mandelbrot & Julia Sets**
  - Real-time rendering of fractal mathematics
  - Smooth transitions between Mandelbrot and Julia sets (toggle with 'M' key)
  - Dynamic color mapping based on escape-time algorithms
  - Interactive zoom and pan capabilities
  - Time-evolving Julia sets for continuous visual interest

### 2. Neural Network Overlay
- **Dynamic Neural Nodes**
  - Organically moving neurons following polar coordinate paths
  - Pulsing glow effects with individual phase offsets
  - Size variations based on mathematical wave functions
  
- **Intelligent Connections**
  - Dynamic curved connections between nearby neurons
  - Opacity modulation based on distance and time
  - Smooth gradient effects for natural-looking links
  - Adaptive connection density based on node proximity

### 3. Interactive Elements
- **Mouse Controls**
  - Click and drag to pan across the fractal landscape
  - Mouse wheel to zoom in/out of interesting regions
  - Hover effects on neural nodes
  - Smooth camera transitions

- **Keyboard Controls**
  - 'M' key - Toggle between Mandelbrot and Julia set modes
  - More hotkeys can be easily added for additional features

## Technical Implementation

### Core Technologies
- **Canvas API** for high-performance 2D rendering
- **WebGL** for fractal computation and rendering
- **JavaScript ES6+** for animation logic and interactivity

### Mathematical Components
- **Fractal Generation**
  ```javascript
  // Example of the core fractal computation
  mandelbrotIterations(x0, y0, maxIter) {
    let x = 0, y = 0;
    let iter = 0;
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xtemp = x*x - y*y + x0;
      y = 2*x*y + y0;
      x = xtemp;
      iter++;
    }
    return iter;
  }
  ```

- **Neural Network Physics**
  - Polar coordinate-based movement patterns
  - Wave function modulation for organic motion
  - Distance-based connection management
  - Color gradient interpolation

## Setup and Usage

1. **HTML Requirements**
   ```html
   <canvas id="hero-canvas"></canvas>
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone [your-repo-url]
   
   # Navigate to project directory
   cd [project-folder]
   
   # If using npm packages
   npm install
   ```

3. **Configuration**
   The animation can be customized through various parameters:
   ```javascript
   // In your configuration file
   const config = {
     neurons: 30,          // Number of neural nodes
     maxConnections: 150,  // Maximum connection distance
     fractalDetail: 100,   // Iteration depth for fractals
     colorCycle: 0.001     // Color cycling speed
   };
   ```

## Performance Optimization

The animation system includes several optimizations:
- Efficient fractal computation using iterative methods
- Canvas clearing optimization for smooth rendering
- Adaptive detail levels based on zoom factor
- Frame skipping for performance maintenance
- Visibility-based animation pausing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For optimal performance, WebGL 2.0 support is recommended.

## Customization Guide

### Color Schemes
You can modify the color schemes by adjusting the HSL parameters:
```javascript
const hue = (iter / maxIter * 360 + this.time) % 360;
const brightness = iter / maxIter;
const rgb = this.hslToRgb(hue / 360, 0.7, brightness * 0.5);
```

### Animation Parameters
Adjust these values to change the animation behavior:
```javascript
// Neural network parameters
neuron.speed = 0.5;      // Movement speed
neuron.size = 3;         // Node size
neuron.phase = Math.PI;  // Phase offset

// Fractal parameters
this.zoom = 1;           // Initial zoom level
this.offsetX = 0;        // X offset
this.offsetY = 0;        // Y offset
```

## Contributing

Feel free to submit issues and enhancement requests! Follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Future Enhancements

- [ ] Add WebGL acceleration for fractal computation
- [ ] Implement touch controls for mobile devices
- [ ] Add more fractal types (Burning Ship, Phoenix, etc.)
- [ ] Create preset animation patterns
- [ ] Add real-time parameter controls via GUI