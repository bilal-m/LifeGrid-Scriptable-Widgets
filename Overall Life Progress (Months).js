// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
widget.setPadding(14, 14, 14, 14); 

// --- User Details ---
// Update this to your exact birthday (YYYY-MM-DD)
const birthDate = new Date("1990-01-01"); 
const maxLifespan = 80;

// --- Time Calculations ---
const now = new Date();
const totalMonths = maxLifespan * 12;

let monthsPassed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
if (now.getDate() < birthDate.getDate()) {
  monthsPassed--;
}

let currentMonthIdx = monthsPassed;
if (currentMonthIdx >= totalMonths) currentMonthIdx = totalMonths - 1;

const progressPercent = ((monthsPassed / totalMonths) * 100).toFixed(0);

// --- Exact Web Gradient Color Blender ---
function lerpColor(c1, c2, t) {
  let r = Math.round(c1.r + (c2.r - c1.r) * t);
  let g = Math.round(c1.g + (c2.g - c1.g) * t);
  let b = Math.round(c1.b + (c2.b - c1.b) * t);
  let hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return new Color("#" + hex);
}

function getGrad(percent) {
  // Sampled directly from the web app screenshot
  let colors = [
      {p: 0.00, r: 133, g: 181, b: 251}, // Light Blue (#85b5fb)
      {p: 0.50, r: 159, g: 155, b: 251}, // Soft Purple-Blue (#9f9bfb)
      {p: 0.75, r: 208, g: 136, b: 236}, // Pinkish Purple (#d088ec)
      {p: 1.00, r: 244, g: 164, b:  94}  // Orange (#f4a45e)
  ];
  
  if (percent <= 0) return new Color("#85b5fb");
  if (percent >= 1) return new Color("#f4a45e");
  
  for(let i = 0; i < colors.length - 1; i++) {
      if(percent >= colors[i].p && percent <= colors[i+1].p) {
          let range = colors[i+1].p - colors[i].p;
          let t = (percent - colors[i].p) / range;
          return lerpColor(colors[i], colors[i+1], t);
      }
  }
  return new Color("#85b5fb");
}

// --- Drawing Function (60 Cols x 16 Rows) ---
function drawMassiveGrid(total, currentIdx, cols) {
  let context = new DrawContext();
  
  const boxSize = 3.6;
  const gap = 1.2;
  const rows = Math.ceil(total / cols);
  
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false;
  context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 0.8, 0.8); 
    
    // THE FIX: Calculate percentage based ONLY on time lived, not total lifespan
    let localPercent = currentIdx > 0 ? (i / currentIdx) : 0;

    if (i < currentIdx) {
      // Past: Smooth, condensed gradient
      context.setFillColor(getGrad(localPercent));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx) {
      // Current: Always the 100% color (Orange) with blue border
      context.setFillColor(getGrad(1.0)); 
      context.addPath(path);
      context.fillPath();
      
      context.setStrokeColor(new Color("#4772fa"));
      context.setLineWidth(1.2);
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

let headerStack = widget.addStack();
headerStack.layoutHorizontally();
headerStack.centerAlignContent();

let title = headerStack.addText("Overall Life Progress (Months)");
title.font = Font.boldSystemFont(12);
title.textColor = new Color("#1c1c1e");

headerStack.addSpacer();

let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(12);
percentText.textColor = new Color("#351c75"); 

widget.addSpacer(8);

let alignStack = widget.addStack();
alignStack.layoutHorizontally();
alignStack.addSpacer(); 

let gridContainer = alignStack.addStack();
gridContainer.borderWidth = 1;
gridContainer.borderColor = new Color("#e5e5ea");
gridContainer.cornerRadius = 6;
gridContainer.setPadding(6, 6, 6, 6);

let monthsImg = drawMassiveGrid(totalMonths, currentMonthIdx, 60);
gridContainer.addImage(monthsImg);

alignStack.addSpacer(); 

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
