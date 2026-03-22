// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
// Reduced outer padding to give the content more vertical room
widget.setPadding(12, 14, 12, 14); 

// --- Time Calculations ---
const now = new Date();
const year = now.getFullYear();

const todayMidnight = new Date(year, now.getMonth(), now.getDate());
const startOfYearMidnight = new Date(year, 0, 1);
const endOfYearMidnight = new Date(year, 11, 31);

const daysLeft = Math.round((endOfYearMidnight - todayMidnight) / 86400000) + 1;
const dayOfYear = Math.round((todayMidnight - startOfYearMidnight) / 86400000) + 1;

const currentWeek = Math.ceil(dayOfYear / 7);
const weeksLeft = 52 - currentWeek;

const currentMonth = now.getMonth() + 1; 
const monthsLeft = 12 - currentMonth; 

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
function drawGrid(total, currentIdx, cols, startHex, endHex) {
  let context = new DrawContext();
  const boxSize = 7.5;
  const gap = 3;
  const rows = Math.ceil(total / cols);
  
  context.size = new Size(cols * (boxSize + gap), rows * (boxSize + gap));
  context.opaque = false;
  context.respectScreenScale = true;
  
  const futureTotal = total - currentIdx; 

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 2, 2);
    
    if (i < currentIdx - 1) {
      context.setFillColor(new Color("#e5e5ea"));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx - 1) {
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
      let percent = futureTotal > 1 ? (i - currentIdx) / (futureTotal - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path);
      context.fillPath();
    }
  }
  return context.getImage();
}

// --- BUILD WIDGET UI ---

// Title
let titleText = widget.addText("What's left for " + year);
titleText.font = Font.boldSystemFont(12); // Reduced from 13
titleText.textColor = new Color("#8e8e93");
widget.addSpacer(6); // Reduced from 8

// Stats Row
let statsRow = widget.addStack();
statsRow.layoutHorizontally();
statsRow.spacing = 6; // Tighter horizontal spacing between boxes

function addStatBlock(stack, title, value) {
  let block = stack.addStack();
  block.layoutVertically();
  block.borderWidth = 1;
  block.borderColor = new Color("#f2f2f7");
  block.cornerRadius = 6;
  block.setPadding(4, 4, 4, 4); // Tighter inner padding
  
  let t = block.addText(title);
  t.font = Font.systemFont(8); // Reduced from 9
  t.textColor = new Color("#8e8e93");
  t.centerAlignText();
  
  block.addSpacer(2); // Tiny vertical buffer inside the box
  
  let v = block.addText(value.toString());
  v.font = Font.boldSystemFont(15); // Reduced from 16
  v.textColor = new Color("#007aff");
  v.centerAlignText();
  
  return block;
}

addStatBlock(statsRow, "Days Left This Year", daysLeft);
addStatBlock(statsRow, "Weeks Left This Year", weeksLeft);
addStatBlock(statsRow, "Months Left This Year", monthsLeft);

widget.addSpacer(8); // Reduced from 10

// Weeks Grid
let wStack = widget.addStack();
wStack.layoutHorizontally();
let wTitle = wStack.addText("Weeks Remaining This Year");
wTitle.font = Font.boldSystemFont(9); // Reduced from 10
wStack.addSpacer();
let wVal = wStack.addText(`(${weeksLeft}/52)`);
wVal.font = Font.boldSystemFont(9); // Reduced from 10
wVal.textColor = new Color("#8e8e93");

widget.addSpacer(3); // Reduced from 4
let weeksImg = drawGrid(52, currentWeek, 26, "#7cd2f7", "#1ba0d9"); 
widget.addImage(weeksImg);

widget.addSpacer(6); // Reduced from 8

// Months Grid
let mStack = widget.addStack();
mStack.layoutHorizontally();
let mTitle = mStack.addText("Months Remaining This Year");
mTitle.font = Font.boldSystemFont(9); // Reduced from 10
mStack.addSpacer();
let mVal = mStack.addText(`(${monthsLeft}/12)`);
mVal.font = Font.boldSystemFont(9); // Reduced from 10
mVal.textColor = new Color("#8e8e93");

widget.addSpacer(3); // Reduced from 4
let monthsImg = drawGrid(12, currentMonth, 12, "#74e38c", "#17401e");
widget.addImage(monthsImg);

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
