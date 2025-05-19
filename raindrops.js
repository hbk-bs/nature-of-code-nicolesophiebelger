
let raindrops = [];
let maxRaindrops = 800;
let canvas;
let mergeDistance = 7;

function setup() {

  canvas = createCanvas(800, 600);
  let canvasElement = canvas.elt;
  canvasElement.id = 'canvas'; 
  
  
  createRaindrop();
}

function draw() {
  
  background(0, 0, 0, 75);
 
  // Überlappungen und verschmelze Tropfen
  checkOverlaps();
  
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const isAlive = raindrops[i].update();
    raindrops[i].draw();
   
    if (!isAlive) {
      raindrops.splice(i, 1);
    }
  }
 
  drawWindowTexture();
}

// Überlappung und Verschmelzen von Tropfen
function checkOverlaps() {
  for (let i = 0; i < raindrops.length; i++) {
    for (let j = i + 1; j < raindrops.length; j++) {
      // Nur fallende Tropfen können sich nicht verschmelzen, wachsende schon
      if (raindrops[i].isFalling && raindrops[j].isFalling) {
        continue;
      }
      
      let d = dist(raindrops[i].x, raindrops[i].y, raindrops[j].x, raindrops[j].y);
      let combinedSize = raindrops[i].size + raindrops[j].size;
      
      if (d < mergeDistance + combinedSize * 0.5) {
        // Berechne das neue Volumen (proportional zum Radius^3)
        let volumeI = pow(raindrops[i].size, 3);
        let volumeJ = pow(raindrops[j].size, 3);
        let newVolume = volumeI + volumeJ;
        let newSize = pow(newVolume, 1/3);
        
        // Gewichtete Position basierend auf dem Volumen
        let newX = (raindrops[i].x * volumeI + raindrops[j].x * volumeJ) / newVolume;
        let newY = (raindrops[i].y * volumeI + raindrops[j].y * volumeJ) / newVolume;
        
        // Geschwindigkeit
        let newSpeed = (raindrops[i].fallingSpeed * volumeI + raindrops[j].fallingSpeed * volumeJ) / newVolume;
        
        // Den größeren Tropfen aktualisieren
        if (raindrops[i].size >= raindrops[j].size) {
          raindrops[i].x = newX;
          raindrops[i].y = newY;
          raindrops[i].size = newSize;
          raindrops[i].maxSize = max(raindrops[i].maxSize, newSize * 1.2);
          raindrops[i].fallingSpeed = newSpeed;
          
          
          raindrops.splice(j, 1);
          j--;
        } else {
          raindrops[j].x = newX;
          raindrops[j].y = newY;
          raindrops[j].size = newSize;
          raindrops[j].maxSize = max(raindrops[j].maxSize, newSize * 1.2);
          raindrops[j].fallingSpeed = newSpeed;
          
          
          raindrops.splice(i, 1);
          i--; 
          break;
        }
      }
    }
  }
}

class Raindrop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(2, 3);
    this.maxSize = random(5, 13);
    this.growthRate = random(0.01, 0.02); // Schnelleres Wachstum
    this.isFalling = false;
    this.fallingSpeed = random(4, 8); 
    this.horizontalMovement = random(-0.8, 0.6); // horizontale Bewegung
    this.opacity = random(0.4, 1);
    this.trail = [];
    this.maxTrailLength = floor(random(10, 20));
    this.volume = pow(this.size, 3); // Volumen des Tropfens
  }
 
  update() {
    this.volume = pow(this.size, 1);
    
    if (!this.isFalling) {
      // Wächst, bis es die maximale Größe erreicht
      this.size += this.growthRate;
     
      if (this.size >= this.maxSize) {
        this.isFalling = true;
      }
    } else {
      // Spur hinzufügen
      this.trail.unshift({x: this.x, y: this.y, size: this.size});
     
      // Spur auf maximale Länge begrenzen
      if (this.trail.length > this.maxTrailLength) {
        this.trail.pop();
      }
     
      // Fallgeschwindigkeit hängt vom Volumen ab
      // Größere Tropfen fallen schneller
      let volumeBasedSpeed = 2 + log(this.volume) * 0.8;
      this.fallingSpeed = max(this.fallingSpeed, volumeBasedSpeed);
      
      // Fallen und horizontal bewegen
      this.y += this.fallingSpeed;
      this.x += this.horizontalMovement;
     
      // Beschleunigung
      this.fallingSpeed += random(0, 0.01);
     
      if (random() < 0.05) {
        this.horizontalMovement = random(-0.6, 0.5);
      }
    }
   
    return this.y < height + 50;
  }
 
  draw() {
    // Spur
    for (let i = 0; i < this.trail.length; i++) {
      const trailSegment = this.trail[i];
      const trailOpacity = (this.trail.length - i) / this.trail.length * this.opacity * 0.8;
     
      push();
      fill(255, 255, 255, trailOpacity * 255);
      noStroke();
      ellipse(
        trailSegment.x,
        trailSegment.y,
        trailSegment.size * 0.6 * 2,
        trailSegment.size * 2
      );
      pop();
    }
   
    push();
    fill(255, 255, 255, this.opacity * 255);
    noStroke();
   
    if (this.isFalling) {
    
      let verticalStretch = map(this.size, 4, 20, 1, 1.5);
      ellipse(
        this.x,
        this.y,
        this.size * 0.6 * 2,
        this.size * 2 * verticalStretch
      );
    } else {
      circle(this.x, this.y, this.size * 2);
    }
   
    let highlightSize = this.size * 0.2;
    fill(255, 255, 255, this.opacity * 0.8 * 255);
    circle(
      this.x - this.size * 0.3,
      this.y - this.size * 0.3,
      highlightSize * 2
    );
    pop();
  }
}

function createRaindrop() {
  if (raindrops.length < maxRaindrops) {
    const x = random(width);
    const y = random(height * 1,3);
    raindrops.push(new Raindrop(x, y));
  }
 

  setTimeout(createRaindrop, random(50, 200));
}

function drawWindowTexture() {
  push();
  fill(255, 255, 255, 0.01 * 255);
  noStroke();
 
  for (let i = 0; i < 20; i++) {
    const x = random(width);
    const y = random(height);
    const size = random(0.5, 2.5);
   
    circle(x, y, size * 2);
  }
  pop();
}
