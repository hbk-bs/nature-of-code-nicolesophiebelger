// Regentropfen-Animation in p5.js mit erweiterten Funktionen
let raindrops = [];
let maxRaindrops = 800; // 1. Mehr Tropfen (von 100 auf 200 erhöht)
let canvas;
let mergeDistance = 5; // Abstand, bei dem Tropfen verschmelzen

function setup() {
  // Canvas erstellen und in der Mitte des Bildschirms platzieren
  canvas = createCanvas(800, 600);
  let canvasElement = canvas.elt;
  canvasElement.id = 'canvas'; // ID zuweisen für CSS-Styling
  
  // Beginne mit der Erstellung von Regentropfen
  createRaindrop();
}

function draw() {
  // Canvas mit leichter Transparenz für den Motion-Blur-Effekt löschen
  background(0, 0, 0, 75); // Alpha 75 entspricht etwa rgba(0,0,0,0.3)
 
  // Überprüfe Überlappungen und verschmelze Tropfen
  checkOverlaps();
  
  // Regentropfen aktualisieren und zeichnen
  for (let i = raindrops.length - 1; i >= 0; i--) {
    const isAlive = raindrops[i].update();
    raindrops[i].draw();
   
    if (!isAlive) {
      raindrops.splice(i, 1);
    }
  }
 
  // Subtile Fenstertextur hinzufügen
  drawWindowTexture();
}

// 3. Funktion zum Überprüfen von Überlappungen und Verschmelzen von Tropfen
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
        
        // Geschwindigkeiten mitteln
        let newSpeed = (raindrops[i].fallingSpeed * volumeI + raindrops[j].fallingSpeed * volumeJ) / newVolume;
        
        // Den größeren Tropfen aktualisieren
        if (raindrops[i].size >= raindrops[j].size) {
          raindrops[i].x = newX;
          raindrops[i].y = newY;
          raindrops[i].size = newSize;
          raindrops[i].maxSize = max(raindrops[i].maxSize, newSize * 1.2);
          raindrops[i].fallingSpeed = newSpeed;
          
          // Tropfen j entfernen
          raindrops.splice(j, 1);
          j--; // Index anpassen
        } else {
          raindrops[j].x = newX;
          raindrops[j].y = newY;
          raindrops[j].size = newSize;
          raindrops[j].maxSize = max(raindrops[j].maxSize, newSize * 1.2);
          raindrops[j].fallingSpeed = newSpeed;
          
          // Tropfen i entfernen
          raindrops.splice(i, 1);
          i--; // Index anpassen
          break; // Innere Schleife verlassen, da i geändert wurde
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
    this.fallingSpeed = random(4, 8); // 2. Schnellere Tropfen (vorher 1-4)
    this.horizontalMovement = random(-0.8, 0.6); // Etwas mehr horizontale Bewegung
    this.opacity = random(0.4, 1);
    this.trail = [];
    this.maxTrailLength = floor(random(10, 20));
    this.volume = pow(this.size, 3); // Volumen des Tropfens
  }
 
  update() {
    // Volumen aktualisieren
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
     
      // 4. Fallgeschwindigkeit hängt vom Volumen ab
      // Größere Tropfen fallen schneller, aber mit einem logarithmischen Wachstum
      let volumeBasedSpeed = 2 + log(this.volume) * 0.8;
      this.fallingSpeed = max(this.fallingSpeed, volumeBasedSpeed);
      
      // Fallen und horizontal bewegen
      this.y += this.fallingSpeed;
      this.x += this.horizontalMovement;
     
      // Leicht beschleunigen
      this.fallingSpeed += random(0, 0.01); // Etwas stärkere Beschleunigung
     
      // Gelegentlich Horizontalbewegung ändern
      if (random() < 0.05) {
        this.horizontalMovement = random(-0.6, 0.5);
      }
    }
   
    // Gibt zurück, ob der Tropfen noch im Sichtbereich ist
    return this.y < height + 50;
  }
 
  draw() {
    // Spur zeichnen
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
   
    // Haupttropfen zeichnen
    push();
    fill(255, 255, 255, this.opacity * 255);
    noStroke();
   
    if (this.isFalling) {
      // Fallender Tropfen ist oval - größere Tropfen sind mehr verzerrt
      let verticalStretch = map(this.size, 4, 20, 1, 1.5);
      ellipse(
        this.x,
        this.y,
        this.size * 0.6 * 2,
        this.size * 2 * verticalStretch
      );
    } else {
      // Wachsender Tropfen ist rund
      circle(this.x, this.y, this.size * 2);
    }
   
    // Glanzlicht zeichnen - größere Tropfen haben größere Glanzlichter
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
 
  // Nächsten Regentropfen schneller planen (vorher 100-400ms)
  setTimeout(createRaindrop, random(50, 200)); // 1. & 2. Mehr & schnellere Tropfen
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
