// --- Native Dynamic Colors ---
const bgColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));
const titleColor = Color.dynamic(new Color("#1c1c1e"), new Color("#ffffff"));
const percentColor = Color.dynamic(new Color("#351c75"), new Color("#d088ec"));
const borderColor = Color.dynamic(new Color("#e5e5ea"), new Color("#3a3a3c"));
const isDark = Device.isUsingDarkAppearance();
const emptyBoxColor = isDark ? new Color("#3a3a3c") : new Color("#e5e5ea");

// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = bgColor; 
widget.setPadding(14, 14, 14, 14); 

const birthDate = new Date("1990-01-01"); 
const maxLifespan = 80;

const now = new Date();
const totalMonths = maxLifespan * 12;

let monthsPassed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
if (now.getDate() < birthDate.getDate()) monthsPassed--;

let currentMonthIdx = monthsPassed;
if (currentMonthIdx >= totalMonths) currentMonthIdx = totalMonths - 1;

const progressPercent = ((monthsPassed / totalMonths) * 100).toFixed(0);

// --- Exact Web Gradient ---
function lerpColor(c1, c2, t) {
  let r = Math.round(c1.r + (c2.r - c1.r) * t);
  let g = Math.round(c1.g + (c2.g - c1.g) * t);
  let b = Math.round(c1.b + (c2.b - c1.b) * t);
  let hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return new Color("#" + hex);
}

function getGrad(percent) {
  let colors = [
      {p: 0.00, r: 133, g: 181, b: 251},
      {p: 0.50, r: 159, g: 155, b: 251},
      {p: 0.75, r: 208, g: 136, b: 236},
      {p: 1.00, r: 244, g: 164, b:  94} 
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

function drawMassiveGrid(total, currentIdx, cols) {
  let context = new DrawContext();
  const boxSize = 3.6; const gap = 1.2;
  const rows = Math.ceil(total / cols);
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false; context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols; let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path(); path.addRoundedRect(rect, 0.8, 0.8); 
    let localPercent = currentIdx > 0 ? (i / currentIdx) : 0;

    if (i < currentIdx) {
      context.setFillColor(getGrad(localPercent));
      context.addPath(path); context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(getGrad(1.0)); 
      context.addPath(path); context.fillPath();
      context.setStrokeColor(new Color("#4772fa"));
      context.setLineWidth(1.2); context.addPath(path); context.strokePath();
    } else {
      context.setFillColor(emptyBoxColor);
      context.addPath(path); context.fillPath();
    }
  }
  return context.getImage();
}

let headerStack = widget.addStack();
headerStack.layoutHorizontally(); headerStack.centerAlignContent();
let title = headerStack.addText("Overall Life Progress (Months)");
title.font = Font.boldSystemFont(12); title.textColor = titleColor;
headerStack.addSpacer();
let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(12); percentText.textColor = percentColor; 

widget.addSpacer(8);
let alignStack = widget.addStack();
alignStack.layoutHorizontally(); alignStack.addSpacer(); 
let gridContainer = alignStack.addStack();
gridContainer.borderWidth = 1; gridContainer.borderColor = borderColor;
gridContainer.cornerRadius = 6; gridContainer.setPadding(6, 6, 6, 6);
gridContainer.addImage(drawMassiveGrid(totalMonths, currentMonthIdx, 60));
alignStack.addSpacer(); 

Script.setWidget(widget); Script.complete(); widget.presentMedium();
