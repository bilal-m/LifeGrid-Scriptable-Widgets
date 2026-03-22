// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
widget.setPadding(12, 16, 12, 16);

// --- Time Calculations ---
const now = new Date();
const year = now.getFullYear();

const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
const formattedDate = now.toLocaleDateString('en-US', dateOptions);

const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59, 999);
const msLeft = endOfDay - now;

const hoursLeftNum = Math.floor(msLeft / (1000 * 60 * 60));
const minutesLeftNum = Math.floor(msLeft / (1000 * 60));

const currentHour = now.getHours(); 

const startActiveMins = 6 * 60; 
const endActiveMins = 21 * 60; 
const currentMins = now.getHours() * 60 + now.getMinutes();

let currentActiveSlot = -1; 
let activeRemaining = 30;

if (currentMins < startActiveMins) {
  currentActiveSlot = -1;
  activeRemaining = 30;
} else if (currentMins >= endActiveMins) {
  currentActiveSlot = 30; 
  activeRemaining = 0;
} else {
  currentActiveSlot = Math.floor((currentMins - startActiveMins) / 30);
  activeRemaining = 30 - currentActiveSlot - 1;
}

// --- Helper Functions ---
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

// --- Dynamic Grid Drawing ---
function drawGrid(total, currentIdx, cols, startHex, endHex, boxSize, gap) {
  let context = new DrawContext();
  const rows = Math.ceil(total / cols);
  
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false;
  context.respectScreenScale = true;
  
  let futureTotal = 0;
  if (currentIdx < 0) futureTotal = total;
  else if (currentIdx >= total) futureTotal = 0;
  else futureTotal = total - currentIdx - 1;

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 2, 2);
    
    if (i < currentIdx) {
      context.setFillColor(new Color("#e5e5ea"));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(new Color("#4772fa"));
      context.addPath(path);
      context.fillPath();
      
      let innerRect = new Rect(col * (boxSize + gap) + 1.5, row * (boxSize + gap) + 1.5, boxSize - 3, boxSize - 3);
      let innerPath = new Path();
      innerPath.addRoundedRect(innerRect, 1, 1);
      context.setFillColor(new Color("#7a9ef5"));
      context.addPath(innerPath);
      context.fillPath();
    } else {
      let percent = 0;
      if (futureTotal > 1) {
        if (currentIdx < 0) percent = i / (futureTotal - 1);
        else percent = (i - currentIdx - 1) / (futureTotal - 1);
      }
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path);
      context.fillPath();
    }
  }
  return context.getImage();
}

// --- BUILD WIDGET UI ---

let titleText = widget.addText(`What's left for (${formattedDate})`);
titleText.font = Font.boldSystemFont(13);
titleText.textColor = new Color("#8e8e93");
widget.addSpacer(8);

let statsRow = widget.addStack();
statsRow.layoutHorizontally();
statsRow.spacing = 8;

function addStatBlock(stack, title, value) {
  let block = stack.addStack();
  block.layoutVertically();
  block.borderWidth = 1;
  block.borderColor = new Color("#f2f2f7");
  block.cornerRadius = 6;
  block.setPadding(6, 4, 6, 4);
  
  let t = block.addText(title);
  t.font = Font.systemFont(9);
  t.textColor = new Color("#8e8e93");
  t.centerAlignText();
  
  let v = block.addText(value.toLocaleString('en-US'));
  v.font = Font.boldSystemFont(16);
  v.textColor = new Color("#007aff");
  v.centerAlignText();
  
  return block;
}

function addLiveTimerBlock(stack, title, targetDate) {
  let block = stack.addStack();
  block.layoutVertically();
  block.borderWidth = 1;
  block.borderColor = new Color("#f2f2f7");
  block.cornerRadius = 6;
  block.setPadding(6, 4, 6, 4);
  
  let t = block.addText(title);
  t.font = Font.systemFont(9);
  t.textColor = new Color("#8e8e93");
  t.centerAlignText();
  
  let v = block.addDate(targetDate);
  v.applyTimerStyle();
  v.font = Font.boldSystemFont(16);
  v.textColor = new Color("#007aff");
  v.centerAlignText();
  
  return block;
}

addStatBlock(statsRow, "Hours Left", hoursLeftNum);
addStatBlock(statsRow, "Minutes Left", minutesLeftNum);
addLiveTimerBlock(statsRow, "Live Time Left", endOfDay);

widget.addSpacer(8);

// Hours Remaining
let hStack = widget.addStack();
hStack.layoutHorizontally();
let hTitle = hStack.addText("Hours Remaining Today");
hTitle.font = Font.boldSystemFont(10);
hStack.addSpacer();
let hVal = hStack.addText(`(${hoursLeftNum}/24)`);
hVal.font = Font.boldSystemFont(10);
hVal.textColor = new Color("#8e8e93");

widget.addSpacer(4);
// Size 7.5 width, 24 boxes = fits on 1 line
let hoursImg = drawGrid(24, currentHour, 24, "#faebd6", "#4a2511", 7.5, 3);
widget.addImage(hoursImg);

widget.addSpacer(8);

// Active Hours
let aStack = widget.addStack();
aStack.layoutHorizontally();
let aTitle = aStack.addText("Active Hours (6 AM - 9 PM)");
aTitle.font = Font.boldSystemFont(10);
aStack.addSpacer();
let aVal = aStack.addText(`(${activeRemaining}/30)`);
aVal.font = Font.boldSystemFont(10);
aVal.textColor = new Color("#8e8e93");

widget.addSpacer(4);
// Slightly smaller boxes (6.5 width) so all 30 fit gracefully on 1 line
let activeImg = drawGrid(30, currentActiveSlot, 30, "#e8faeb", "#153d1e", 6.5, 2.5);
widget.addImage(activeImg);

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
