const bgColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));
const titleColor = Color.dynamic(new Color("#1c1c1e"), new Color("#ffffff"));
const percentColor = Color.dynamic(new Color("#a34125"), new Color("#e87661"));
const borderColor = Color.dynamic(new Color("#e5e5ea"), new Color("#3a3a3c"));
const isDark = Device.isUsingDarkAppearance();
const emptyBoxColor = isDark ? new Color("#3a3a3c") : new Color("#e5e5ea");

let widget = new ListWidget();
widget.backgroundColor = bgColor; 
widget.setPadding(12, 16, 12, 16); 

const birthDate = new Date("1990-01-01"); 
const primeEndAge = 45;
const now = new Date();
const totalPrimeMonths = primeEndAge * 12;

let monthsPassed = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
if (now.getDate() < birthDate.getDate()) monthsPassed--;
let currentMonthIdx = monthsPassed >= totalPrimeMonths ? totalPrimeMonths : monthsPassed;
const progressPercent = ((currentMonthIdx / totalPrimeMonths) * 100).toFixed(0);

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

function drawGrid(total, currentIdx, cols, startHex, endHex, boxSize, gap) {
  let context = new DrawContext();
  const rows = Math.ceil(total / cols);
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false; context.respectScreenScale = true;

  for (let i = 0; i < total; i++) {
    let col = i % cols; let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path(); path.addRoundedRect(rect, 1.5, 1.5); 
    if (i < currentIdx) {
      let percent = currentIdx > 1 ? i / (currentIdx - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path); context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(new Color("#e87661"));
      context.addPath(path); context.fillPath();
      context.setStrokeColor(new Color("#4772fa"));
      context.setLineWidth(1.5); context.addPath(path); context.strokePath();
    } else {
      context.setFillColor(emptyBoxColor);
      context.addPath(path); context.fillPath();
    }
  }
  return context.getImage();
}

let headerStack = widget.addStack();
headerStack.layoutHorizontally(); headerStack.centerAlignContent();
let title = headerStack.addText("Prime Years Progress (Months)");
title.font = Font.boldSystemFont(12); title.textColor = titleColor;
headerStack.addSpacer();
let percentText = headerStack.addText(`${progressPercent}%`);
percentText.font = Font.boldSystemFont(12); percentText.textColor = percentColor;

widget.addSpacer(8);
let alignStack = widget.addStack();
alignStack.layoutHorizontally(); alignStack.addSpacer(); 
let gridContainer = alignStack.addStack();
gridContainer.borderWidth = 1; gridContainer.borderColor = borderColor;
gridContainer.cornerRadius = 4; gridContainer.setPadding(4, 4, 4, 4);
gridContainer.addImage(drawGrid(totalPrimeMonths, currentMonthIdx, 45, "#fae16b", "#f29e38", 6, 1.5));
alignStack.addSpacer(); 

Script.setWidget(widget); Script.complete(); widget.presentMedium();
