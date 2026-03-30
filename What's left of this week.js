// --- Native Dynamic Colors ---
const bgColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));
const mainTextColor = Color.dynamic(new Color("#1c1c1e"), new Color("#ffffff")); 
const subTextColor = Color.dynamic(new Color("#8e8e93"), new Color("#a1a1a6"));
const borderColor = Color.dynamic(new Color("#f2f2f7"), new Color("#3a3a3c"));
const isDark = Device.isUsingDarkAppearance();
const emptyBoxColor = isDark ? new Color("#3a3a3c") : new Color("#e5e5ea");

// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = bgColor; 
widget.setPadding(12, 16, 12, 16);

// --- Time Calculations ---
const now = new Date();

// JavaScript getDay() uses Sunday = 0. We will shift this so Monday = 0 and Sunday = 6
let dayOfWeek = now.getDay();
let currentDayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; 

const daysInWeek = 7;
const daysLeft = daysInWeek - currentDayIdx - 1;

// Calculate time until Sunday at 11:59:59 PM
const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysLeft, 23, 59, 59, 999);
const msLeft = endOfWeek - now;
const hoursLeftNum = Math.floor(msLeft / (1000 * 60 * 60));

// --- Helper Functions for Gradients ---
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

// --- Dynamic Grid Drawing ---
function drawGrid(total, currentIdx, cols, startHex, endHex, boxSize, gap) {
  let context = new DrawContext();
  const rows = Math.ceil(total / cols);
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false; context.respectScreenScale = true;
  let futureTotal = total - currentIdx - 1;

  for (let i = 0; i < total; i++) {
    let col = i % cols; let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path(); path.addRoundedRect(rect, 4, 4); // Rounder corners for bigger boxes
    
    if (i < currentIdx) {
      context.setFillColor(emptyBoxColor);
      context.addPath(path); context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(new Color("#4772fa"));
      context.addPath(path); context.fillPath();
      let innerRect = new Rect(col * (boxSize + gap) + 2, row * (boxSize + gap) + 2, boxSize - 4, boxSize - 4);
      let innerPath = new Path(); innerPath.addRoundedRect(innerRect, 2, 2);
      context.setFillColor(new Color("#7a9ef5"));
      context.addPath(innerPath); context.fillPath();
    } else {
      let percent = futureTotal > 1 ? (i - currentIdx - 1) / (futureTotal - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path); context.fillPath();
    }
  }
  return context.getImage();
}

// --- BUILD WIDGET UI ---

let titleText = widget.addText("What's left of this week");
titleText.font = Font.boldSystemFont(13); titleText.textColor = subTextColor;
widget.addSpacer(8);

let statsRow = widget.addStack();
statsRow.layoutHorizontally(); statsRow.spacing = 8;

function addStatBlock(stack, title, value) {
  let block = stack.addStack(); block.layoutVertically();
  block.borderWidth = 1; block.borderColor = borderColor;
  block.cornerRadius = 6; block.setPadding(6, 4, 6, 4);
  let t = block.addText(title);
  t.font = Font.systemFont(9); t.textColor = subTextColor; t.centerAlignText();
  let v = block.addText(value.toLocaleString('en-US'));
  v.font = Font.boldSystemFont(16); v.textColor = new Color("#007aff"); v.centerAlignText();
  return block;
}

function addLiveTimerBlock(stack, title, targetDate) {
  let block = stack.addStack(); block.layoutVertically();
  block.borderWidth = 1; block.borderColor = borderColor;
  block.cornerRadius = 6; block.setPadding(6, 4, 6, 4);
  let t = block.addText(title);
  t.font = Font.systemFont(9); t.textColor = subTextColor; t.centerAlignText();
  let v = block.addDate(targetDate);
  v.applyTimerStyle(); v.font = Font.boldSystemFont(16); v.textColor = new Color("#007aff"); v.centerAlignText();
  return block;
}

addStatBlock(statsRow, "Days Left", daysLeft);
addStatBlock(statsRow, "Hours Left", hoursLeftNum);
addLiveTimerBlock(statsRow, "Live Time Left", endOfWeek);

widget.addSpacer(12);

let dStack = widget.addStack();
dStack.layoutHorizontally();
let dTitle = dStack.addText("Days Remaining This Week");
dTitle.font = Font.boldSystemFont(10); dTitle.textColor = mainTextColor;
dStack.addSpacer();
let dVal = dStack.addText(`(${daysLeft}/${daysInWeek})`);
dVal.font = Font.boldSystemFont(10); dVal.textColor = subTextColor;

widget.addSpacer(8);

let gridContainer = widget.addStack();
gridContainer.layoutHorizontally(); gridContainer.addSpacer(); 
// 7 columns, sunset gradient (Coral to Pink), large 28pt boxes
gridContainer.addImage(drawGrid(daysInWeek, currentDayIdx, 7, "#ff7e5f", "#feb47b", 28, 6));
gridContainer.addSpacer();

Script.setWidget(widget); Script.complete(); widget.presentMedium();
