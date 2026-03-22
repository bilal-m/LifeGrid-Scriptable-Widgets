// --- Widget Setup ---
let widget = new ListWidget();
widget.backgroundColor = new Color("#ffffff"); 
widget.setPadding(12, 14, 12, 14); 

// --- User Details ---
// Update this to your exact birthday (YYYY-MM-DD format)
const birthDate = new Date("1997-03-06"); 
const primeEndAge = 45;

// --- Time Calculations ---
const now = new Date();
const primeEndDate = new Date(birthDate.getFullYear() + primeEndAge, birthDate.getMonth(), birthDate.getDate());

const msLeft = primeEndDate - now;
const daysLeft = Math.floor(msLeft / 86400000);
const weeksLeftNum = Math.floor(daysLeft / 7);

// Exact month calculation
let monthsLeftNum = (primeEndDate.getFullYear() - now.getFullYear()) * 12 + (primeEndDate.getMonth() - now.getMonth());
if (now.getDate() > primeEndDate.getDate()) {
  monthsLeftNum--;
}

// Year calculations for the visual grid
let yearsPassed = now.getFullYear() - birthDate.getFullYear();
if (now.getMonth() < birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())) {
    yearsPassed--;
}
const yearsLeftNum = primeEndAge - yearsPassed - 1; 

const totalPrimeYears = primeEndAge;
const currentPrimeYearIdx = yearsPassed; 

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
  
  const futureTotal = total - currentIdx - 1; 

  for (let i = 0; i < total; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path();
    path.addRoundedRect(rect, 2, 2);
    
    if (i < currentIdx) {
      // Past
      context.setFillColor(new Color("#e5e5ea"));
      context.addPath(path);
      context.fillPath();
    } else if (i === currentIdx) {
      // Current
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
      // Future
      let percent = futureTotal > 1 ? (i - currentIdx - 1) / (futureTotal - 1) : 0;
      context.setFillColor(getGradientColor(startHex, endHex, percent));
      context.addPath(path);
      context.fillPath();
    }
  }
  return context.getImage();
}

// --- BUILD WIDGET UI ---

let titleText = widget.addText("Remaining Prime Time");
titleText.font = Font.boldSystemFont(12);
titleText.textColor = new Color("#8e8e93");
widget.addSpacer(6);

let statsRow = widget.addStack();
statsRow.layoutHorizontally();
statsRow.spacing = 6;

function addStatBlock(stack, title, value) {
  let block = stack.addStack();
  block.layoutVertically();
  block.borderWidth = 1;
  block.borderColor = new Color("#f2f2f7");
  block.cornerRadius = 6;
  block.setPadding(4, 4, 4, 4);
  
  let t = block.addText(title);
  t.font = Font.systemFont(8);
  t.textColor = new Color("#8e8e93");
  t.centerAlignText();
  
  block.addSpacer(2);
  
  let v = block.addText(value.toLocaleString('en-US'));
  v.font = Font.boldSystemFont(15);
  v.textColor = new Color("#007aff");
  v.centerAlignText();
  
  return block;
}

addStatBlock(statsRow, "Years Left", yearsLeftNum);
addStatBlock(statsRow, "Months Left", monthsLeftNum);
addStatBlock(statsRow, "Weeks Left", weeksLeftNum);

widget.addSpacer(8);

// Prime Grid Header
let pStack = widget.addStack();
pStack.layoutHorizontally();
let pTitle = pStack.addText("Prime Years Remaining");
pTitle.font = Font.boldSystemFont(9);
pStack.addSpacer();
let pVal = pStack.addText(`(${yearsLeftNum}/${totalPrimeYears})`);
pVal.font = Font.boldSystemFont(9);
pVal.textColor = new Color("#8e8e93");

widget.addSpacer(3);

// Prime Grid Generation (Lavender to Dark Purple gradient)
let pImg = drawGrid(totalPrimeYears, currentPrimeYearIdx, 28, "#cbb6f7", "#280759", 7.5, 3);

// Outer Container with Border
let pContainer = widget.addStack();
pContainer.borderWidth = 1;
pContainer.borderColor = new Color("#e5e5ea");
pContainer.cornerRadius = 4;
pContainer.setPadding(4, 4, 4, 4);
pContainer.addImage(pImg);

Script.setWidget(widget);
Script.complete();
widget.presentMedium();
