// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
// Balanced padding to center the content
widget.setPadding(16, 16, 16, 16); 

// --- User Details ---
// Update this to your exact birthday
const birthDate = new Date("1990-01-01"); 
const maxLifespan = 80;

// --- Time Calculations ---
const now = new Date();
let ageInYears = now.getFullYear() - birthDate.getFullYear();
if (now.getMonth() < birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) {
    ageInYears--;
}

const progressPercent = ((ageInYears / maxLifespan) * 100).toFixed(0);

// --- Helper Functions for Gradients ---
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  let bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function getGradientColor(startHex, endHex, percent) {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const r = Math.round(start.r + (end.r - start.r) * percent);
  const g = Math.round(start.g + (end.g - start.g) * percent);
  const b = Math.round(start.b + (end.b - start.b) * percent);
  return new Color(`#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`);
}

// --- Drawing Function (4 Rows of 20) ---
function drawGrid(total, currentIdx, cols, startHex, endHex) {
  let context = new DrawContext();
  
  // Larger boxes so they look crisp on the iPhone screen
  const boxSize = 12;
  const gap = 4;
  const rows = Math.ceil(total / cols);
  
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false;
  context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 3, 3); // Slightly rounder corners for larger boxes
    
    if (i < currentIdx) {
      // Past: Purple to Orange Gradient
      let percent = currentIdx > 1 ? i / (currentIdx - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx) {
      // Current: Blue Outline
      context.setFillColor(new Color("#7a9ef5")); 
      context.addPath(path);
      context.fillPath();
      
      context.setStrokeColor(new Color("#4772fa")); 
      context.setLineWidth(2.5);
      context.addPath(path);
      context.strokePath();
    } else {
      // Future: Light Grey
      context.setFillColor(new Color("#e5e5ea"));
      context.addPath(path);
      context.fillPath();
    }
  }
  return context.getImage();
}

// --- BUILD WIDGET UI ---

// Add a flexible spacer at the top to push content toward the middle
widget.addSpacer();

// Header Row
let headerStack = widget.addStack();
headerStack.layoutHorizontally();
headerStack.centerAlignContent();

let title = headerStack.addText("Overall Life Progress (Years)");
title.font = Font.boldSystemFont(13);
title.textColor = new Color("#1c1c1e");

headerStack.addSpacer();

let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(13);
percentText.textColor = new Color("#351c75"); // Dark purple

widget.addSpacer(12);

// Grid Generation: 80 total years, wrapped at 20 columns
let yearsImg = drawGrid(maxLifespan, ageInYears, 20, "#9b72f2", "#f5a55b");

// Container matching the web outline
let gridContainer = widget.addStack();
gridContainer.borderWidth = 1;
gridContainer.borderColor = new Color("#e5e5ea");
gridContainer.cornerRadius = 6;
gridContainer.setPadding(8, 8, 8, 8);
gridContainer.addImage(yearsImg);

// Add a flexible spacer at the bottom so the whole block sits perfectly centered
widget.addSpacer();

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
