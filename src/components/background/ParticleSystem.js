/**
 * Particle class representing individual animated particles
 */
class Particle {
  constructor(x, y, canvas, theme = 'light') {
    this.canvas = canvas;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.3 + 0.1;
    this.decay = Math.random() * 0.01 + 0.005;
    this.maxAlpha = this.alpha;
    this.age = 0;
    this.maxAge = Math.random() * 300 + 200;
    
    // Theme-aware colors
    const colors = theme === 'dark' 
      ? ['rgba(209, 213, 219, 0.2)', 'rgba(156, 163, 175, 0.15)', 'rgba(107, 114, 128, 0.1)']
      : ['rgba(156, 163, 175, 0.3)', 'rgba(107, 114, 128, 0.25)', 'rgba(75, 85, 99, 0.2)'];
    
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;

    // Fade in/out lifecycle
    if (this.age < 60) {
      this.alpha = (this.age / 60) * this.maxAlpha;
    } else if (this.age > this.maxAge - 60) {
      this.alpha = ((this.maxAge - this.age) / 60) * this.maxAlpha;
    }

    // Boundary wrapping
    if (this.x < 0) this.x = this.canvas.width;
    if (this.x > this.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.canvas.height;
    if (this.y > this.canvas.height) this.y = 0;

    return this.age < this.maxAge && this.alpha > 0;
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * ParticleSystem manages the creation, animation, and rendering of particles
 */
export class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.isRunning = false;
    
    // Configuration
    this.options = {
      density: options.density || 0.00012,
      speed: options.speed || 0.5,
      maxParticles: options.maxParticles || 200,
      theme: options.theme || 'light',
      respectReducedMotion: options.respectReducedMotion || false,
      ...options
    };

    // Performance monitoring
    this.performance = {
      fps: 60,
      frameCount: 0,
      lastTime: performance.now(),
      fpsHistory: []
    };

    this.init();
  }

  init() {
    this.resize();
    this.createInitialParticles();
    
    // Handle reduced motion preference
    if (this.options.respectReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.options.density *= 0.3;
      this.options.speed *= 0.5;
    }
  }

  createInitialParticles() {
    const particleCount = Math.min(
      Math.floor(this.canvas.width * this.canvas.height * this.options.density),
      this.options.maxParticles
    );

    for (let i = 0; i < particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    if (this.particles.length >= this.options.maxParticles) return;

    const x = Math.random() * this.canvas.width;
    const y = Math.random() * this.canvas.height;
    const particle = new Particle(x, y, this.canvas, this.options.theme);
    this.particles.push(particle);
  }

  updateParticles() {
    // Update existing particles and remove dead ones
    this.particles = this.particles.filter(particle => particle.update());

    // Maintain particle count
    while (this.particles.length < Math.min(
      Math.floor(this.canvas.width * this.canvas.height * this.options.density),
      this.options.maxParticles
    )) {
      this.createParticle();
    }
  }

  renderParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      particle.render(this.ctx);
    });
  }

  updatePerformance() {
    const now = performance.now();
    const delta = now - this.performance.lastTime;
    
    if (delta >= 1000) {
      this.performance.fps = Math.round((this.performance.frameCount * 1000) / delta);
      this.performance.fpsHistory.push(this.performance.fps);
      
      // Keep only last 10 FPS measurements
      if (this.performance.fpsHistory.length > 10) {
        this.performance.fpsHistory.shift();
      }

      // Auto-adjust quality if performance is poor
      if (this.options.adaptiveQuality && this.performance.fps < 30) {
        this.adjustQuality();
      }

      this.performance.frameCount = 0;
      this.performance.lastTime = now;
    }
    
    this.performance.frameCount++;
  }

  adjustQuality() {
    // Reduce particle density if performance is poor
    if (this.options.density > 0.00008) {
      this.options.density *= 0.8;
      console.log('Reducing particle density for better performance:', this.options.density);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.updateParticles();
    this.renderParticles();
    this.updatePerformance();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  updateTheme(theme) {
    this.options.theme = theme;
    // Update existing particles with new theme colors
    this.particles.forEach(particle => {
      const colors = theme === 'dark' 
        ? ['rgba(209, 213, 219, 0.2)', 'rgba(156, 163, 175, 0.15)', 'rgba(107, 114, 128, 0.1)']
        : ['rgba(156, 163, 175, 0.3)', 'rgba(107, 114, 128, 0.25)', 'rgba(75, 85, 99, 0.2)'];
      
      particle.color = colors[Math.floor(Math.random() * colors.length)];
    });
  }

  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    
    // Recreate particles if density changed significantly
    const targetCount = Math.min(
      Math.floor(this.canvas.width * this.canvas.height * this.options.density),
      this.options.maxParticles
    );
    
    if (Math.abs(this.particles.length - targetCount) > targetCount * 0.2) {
      this.particles = [];
      this.createInitialParticles();
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getPerformanceStats() {
    return {
      fps: this.performance.fps,
      particleCount: this.particles.length,
      averageFPS: this.performance.fpsHistory.length > 0 
        ? Math.round(this.performance.fpsHistory.reduce((a, b) => a + b, 0) / this.performance.fpsHistory.length)
        : 60
    };
  }
}