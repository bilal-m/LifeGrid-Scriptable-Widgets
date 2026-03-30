const bgColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));
const titleColor = Color.dynamic(new Color("#1c1c1e"), new Color("#ffffff"));
const percentColor = Color.dynamic(new Color("#351c75"), new Color("#d088ec"));
const borderColor = Color.dynamic(new Color("#e5e5ea"), new Color("#3a3a3c"));
const isDark = Device.isUsingDarkAppearance();
const emptyBoxColor = isDark ? new Color("#3a3a3c") : new Color("#e5e5ea");

let widget = new ListWidget();
widget.backgroundColor = bgColor; 
widget.setPadding(16, 16, 16, 16); 

const birthDate = new Date("1990-01-01"); 
const maxLifespan = 80;
const now = new Date();
let ageInYears = now.getFullYear() - birthDate.getFullYear();
if (now.getMonth() < birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) ageInYears--;
const progressPercent = ((ageInYears / maxLifespan) * 100).toFixed(0);

function hexToRgb(hex) {
  hex = hex.replace(/^#/, ''); let bigint = parseInt(hex, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
function getGradientColor(startHex, endHex, percent) {
  const start = hexToRgb(startHex); const end = hexToRgb(endHex);
  const r = Math.round(start.r + (end.r - start.r) * percent);
  const g = Math.round(start.g + (end.g - start.g) * percent);
  const b = Math.round(start.b + (end.b - start.b) * percent);
  return new Color(`#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`);
}

function drawGrid(total, currentIdx, cols, startHex, endHex) {
  let context = new DrawContext();
  const boxSize = 12; const gap = 4;
  const rows = Math.ceil(total / cols);
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false; context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols; let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path(); path.addRoundedRect(rect, 3, 3); 
    if (i < currentIdx) {
      let percent = currentIdx > 1 ? i / (currentIdx - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path); context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(new Color("#7a9ef5")); 
      context.addPath(path); context.fillPath();
      context.setStrokeColor(new Color("#4772fa")); 
      context.setLineWidth(2.5); context.addPath(path); context.strokePath();
    } else {
      context.setFillColor(emptyBoxColor);
      context.addPath(path); context.fillPath();
    }
  }
  return context.getImage();
}

widget.addSpacer();
let headerStack = widget.addStack();
headerStack.layoutHorizontally(); headerStack.centerAlignContent();
let title = headerStack.addText("Overall Life Progress (Years)");
title.font = Font.boldSystemFont(13); title.textColor = titleColor;
headerStack.addSpacer();
let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(13); percentText.textColor = percentColor;
widget.addSpacer(12);

let alignStack = widget.addStack();
alignStack.layoutHorizontally(); alignStack.addSpacer(); 
let gridContainer = alignStack.addStack();
gridContainer.borderWidth = 1; gridContainer.borderColor = borderColor;
gridContainer.cornerRadius = 6; gridContainer.setPadding(8, 8, 8, 8);
gridContainer.addImage(drawGrid(maxLifespan, ageInYears, 20, "#9b72f2", "#f5a55b"));
alignStack.addSpacer(); 
widget.addSpacer();

Script.setWidget(widget); Script.complete(); widget.presentMedium();
