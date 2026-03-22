// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
widget.setPadding(12, 16, 12, 16); 

// --- User Details ---
// Update this to your exact birthday (YYYY-MM-DD format)
const birthDate = new Date("1990-01-01"); 
const primeEndAge = 45;

// --- Time Calculations ---
const now = new Date();
const primeEndDate = new Date(birthDate.getFullYear() + primeEndAge, birthDate.getMonth(), birthDate.getDate());

const totalPrimeMonths = primeEndAge * 12;

let monthsPassed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
if (now.getDate() < birthDate.getDate()) {
  monthsPassed--;
}

// Cap the months passed if we are past prime age
let currentMonthIdx = monthsPassed;
if (currentMonthIdx >= totalPrimeMonths) currentMonthIdx = totalPrimeMonths;

const progressPercent = ((currentMonthIdx / totalPrimeMonths) * 100).toFixed(0);

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

// --- Drawing Function ---
function drawGrid(total, currentIdx, cols, startHex, endHex, boxSize, gap) {
  let context = new DrawContext();
  const rows = Math.ceil(total / cols);
  
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false;
  context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 1.5, 1.5); // Slight rounding for tiny boxes
    
    if (i < currentIdx) {
      // Past: Heatmap Gradient
      let percent = currentIdx > 1 ? i / (currentIdx - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx) {
      // Current: Colored square with the blue outline
      context.setFillColor(new Color("#e87661")); // Base reddish color
      context.addPath(path);
      context.fillPath();
      
      // Blue Border overlay
      context.setStrokeColor(new Color("#4772fa"));
      context.setLineWidth(1.5);
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

// Header Row
let headerStack = widget.addStack();
headerStack.layoutHorizontally();
headerStack.centerAlignContent();

let title = headerStack.addText("Prime Years Progress (Months)");
title.font = Font.boldSystemFont(12);
title.textColor = new Color("#1c1c1e");

headerStack.addSpacer();

let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(12);
percentText.textColor = new Color("#a34125"); // Dark reddish-orange to match the theme

widget.addSpacer(8);

// Grid Generation
// 45 columns means 1 column = 1 year, ensuring it wraps perfectly
let pImg = drawGrid(totalPrimeMonths, currentMonthIdx, 45, "#fce988", "#eb6b54", 6, 1.5);

// Wrap in border container
let gridContainer = widget.addStack();
gridContainer.borderWidth = 1;
gridContainer.borderColor = new Color("#e5e5ea");
gridContainer.cornerRadius = 4;
gridContainer.setPadding(4, 4, 4, 4);
gridContainer.addImage(pImg);

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
