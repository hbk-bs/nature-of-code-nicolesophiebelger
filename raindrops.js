
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


canvas.width = 800;
canvas.height = 600;


const raindrops = [];
const maxRaindrops = 100;


class Raindrop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 2;
    this.maxSize = Math.random() * 8 + 5;
    this.growthRate = Math.random() * 0.01 + 0.02;
    this.isFalling = false;
    this.fallingSpeed = Math.random() * 3 + 1;
    this.horizontalMovement = Math.random() * 0.8 - 0.4;
    this.opacity = Math.random() * 0.3 + 0.7;
    this.trail = [];
    this.maxTrailLength = Math.floor(Math.random() * 10) + 5;
  }
  
  update() {
    if (!this.isFalling) {
    
      this.size += this.growthRate;
      
      
      if (this.size >= this.maxSize) {
        this.isFalling = true;
      }
    } else {
      
      this.trail.unshift({x: this.x, y: this.y, size: this.size});
      
      
      if (this.trail.length > this.maxTrailLength) {
        this.trail.pop();
      }
      
    
      this.y += this.fallingSpeed;
      this.x += this.horizontalMovement;
      
      
      this.fallingSpeed += Math.random() * 0.05;
      
      
      if (Math.random() < 0.05) {
        this.horizontalMovement = Math.random() * 0.8 - 0.4;
      }
    }
    
    
    return this.y < canvas.height + 50;
  }
  
  draw() {
    
    for (let i = 0; i < this.trail.length; i++) {
      const trailSegment = this.trail[i];
      const trailOpacity = (this.trail.length - i) / this.trail.length * this.opacity * 0.8;
      
      ctx.beginPath();
      ctx.ellipse(
        trailSegment.x, 
        trailSegment.y, 
        trailSegment.size * 0.6, 
        trailSegment.size, 
        0, 0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity})`;
      ctx.fill();
    }
    
    
    ctx.beginPath();
    
    if (this.isFalling) {
      
      ctx.ellipse(
        this.x, 
        this.y, 
        this.size * 0.6, 
        this.size, 
        0, 0, Math.PI * 2
      );
    } else {
      
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
    
    
    ctx.beginPath();
    ctx.arc(
      this.x - this.size * 0.3, 
      this.y - this.size * 0.3, 
      this.size * 0.2, 
      0, Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
    ctx.fill();
  }
}


function createRaindrop() {
  if (raindrops.length < maxRaindrops) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.5;
    raindrops.push(new Raindrop(x, y));
  }
  
  // Schedule next raindrop
  setTimeout(createRaindrop, Math.random() * 300 + 100);
}

// Animation loop
function animate() {
  // Clear canvas with slight transparency for motion blur effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw raindrops
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const isAlive = raindrops[i].update();
    raindrops[i].draw();
    
    if (!isAlive) {
      raindrops.splice(i, 1);
    }
  }
  
  // Add subtle window texture
  drawWindowTexture();
  
  requestAnimationFrame(animate);
}

// Draw subtle window texture
function drawWindowTexture() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
  
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 0.5;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Start animation
createRaindrop();
animate();