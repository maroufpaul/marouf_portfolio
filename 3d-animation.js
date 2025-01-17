/*******************************************************
 * 3d-animation.js
 *
 * A more exciting, interactive 3D scene that includes:
 *   - A fractal sphere (custom shader) with dynamic distortion
 *   - Neural network of glowing nodes & pulsating lines
 *   - Advanced mouse interactivity (color shift, sphere displacement)
 *   - Smooth camera controls via OrbitControls
 *   - Simplex noise for subtle line pulses & fractal changes
 *
 * Setup:
 *   1) <script type="module" src="./3d-animation.js">
 *   2) A local patched OrbitControls in ./libs/OrbitControls.js
 *   3) <div id="hero-3d-bg"></div> in your hero section
 ******************************************************/

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 2) INIT FUNCTION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// 3d-animation.js
class FractalNeuralAnimation {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.neurons = [];
    this.time = 0;
    this.zoom = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.mouse = { x: 0, y: 0, isPressed: false };
    this.isAnimating = true;
    this.mandelbrotMode = true;
    
    this.initializeCanvas();
    this.setupEventListeners();
    this.createNeurons();
    this.animate();
  }

  initializeCanvas() {
    const updateCanvasSize = () => {
      this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio;
      this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      
      if (this.mouse.isPressed) {
        this.offsetX += e.movementX / (this.zoom * 100);
        this.offsetY += e.movementY / (this.zoom * 100);
      }
    });

    this.canvas.addEventListener('mousedown', () => {
      this.mouse.isPressed = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isPressed = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom *= zoomFactor;
      
      // Zoom towards mouse position
      const mouseXWorld = (this.mouse.x / this.canvas.width * 4 - 2) / this.zoom - this.offsetX;
      const mouseYWorld = (this.mouse.y / this.canvas.height * 4 - 2) / this.zoom - this.offsetY;
      
      this.offsetX += mouseXWorld * (1 - zoomFactor);
      this.offsetY += mouseYWorld * (1 - zoomFactor);
    });

    // Toggle between Mandelbrot and Julia sets
    window.addEventListener('keypress', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        this.mandelbrotMode = !this.mandelbrotMode;
      }
    });

    document.addEventListener('visibilitychange', () => {
      this.isAnimating = !document.hidden;
      if (this.isAnimating) this.animate();
    });
  }

  createNeurons() {
    const numNeurons = 30;
    this.neurons = [];

    for (let i = 0; i < numNeurons; i++) {
      this.neurons.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.5,
        size: Math.random() * 3 + 2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

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

  juliaIterations(x0, y0, maxIter) {
    let x = x0, y = y0;
    const cx = Math.sin(this.time * 0.001) * 0.7;
    const cy = Math.cos(this.time * 0.001) * 0.3;
    let iter = 0;
    
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xtemp = x*x - y*y + cx;
      y = 2*x*y + cy;
      x = xtemp;
      iter++;
    }
    
    return iter;
  }

  drawFractal() {
    const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const maxIter = 100;

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const x0 = (x / this.canvas.width * 4 - 2) / this.zoom - this.offsetX;
        const y0 = (y / this.canvas.height * 4 - 2) / this.zoom - this.offsetY;
        
        const iter = this.mandelbrotMode ? 
          this.mandelbrotIterations(x0, y0, maxIter) :
          this.juliaIterations(x0, y0, maxIter);
        
        const index = (y * this.canvas.width + x) * 4;
        
        if (iter === maxIter) {
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
        } else {
          const hue = (iter / maxIter * 360 + this.time) % 360;
          const brightness = iter / maxIter;
          const rgb = this.hslToRgb(hue / 360, 0.7, brightness * 0.5);
          
          data[index] = rgb[0];
          data[index + 1] = rgb[1];
          data[index + 2] = rgb[2];
        }
        data[index + 3] = 255;
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  updateNeurons() {
    this.neurons.forEach(neuron => {
      // Update position using polar coordinates for more interesting movement
      neuron.angle += neuron.speed * 0.02;
      const radius = Math.sin(this.time * 0.001 + neuron.phase) * 50 + 100;
      
      neuron.x = this.canvas.width/2 + Math.cos(neuron.angle) * radius;
      neuron.y = this.canvas.height/2 + Math.sin(neuron.angle) * radius;
    });
  }

  drawNeurons() {
    // Draw connections
    this.neurons.forEach((neuron1, i) => {
      this.neurons.slice(i + 1).forEach(neuron2 => {
        const dx = neuron2.x - neuron1.x;
        const dy = neuron2.y - neuron1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const opacity = (1 - distance / 150) * 0.5;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = opacity * 2;
          
          // Create curved connections
          const midX = (neuron1.x + neuron2.x) / 2;
          const midY = (neuron1.y + neuron2.y) / 2;
          const offset = Math.sin(this.time * 0.002 + i) * 20;
          
          this.ctx.beginPath();
          this.ctx.moveTo(neuron1.x, neuron1.y);
          this.ctx.quadraticCurveTo(
            midX + offset,
            midY + offset,
            neuron2.x,
            neuron2.y
          );
          this.ctx.stroke();
        }
      });
    });

    // Draw neurons
    this.neurons.forEach(neuron => {
      const glowSize = Math.sin(this.time * 0.004 + neuron.phase) * 2 + 4;
      
      const gradient = this.ctx.createRadialGradient(
        neuron.x, neuron.y, 0,
        neuron.x, neuron.y, neuron.size * glowSize
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      this.ctx.arc(neuron.x, neuron.y, neuron.size * glowSize, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  animate(currentTime = 0) {
    if (!this.isAnimating) return;
    
    this.time = currentTime;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawFractal();
    this.updateNeurons();
    this.drawNeurons();
    
    requestAnimationFrame(this.animate.bind(this));
  }
}

// Initialize animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FractalNeuralAnimation();
});