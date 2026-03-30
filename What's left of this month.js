const bgColor = Color.dynamic(new Color("#ffffff"), new Color("#1c1c1e"));
const mainTextColor = Color.dynamic(new Color("#1c1c1e"), new Color("#ffffff")); 
const subTextColor = Color.dynamic(new Color("#8e8e93"), new Color("#a1a1a6"));
const borderColor = Color.dynamic(new Color("#f2f2f7"), new Color("#3a3a3c"));
const isDark = Device.isUsingDarkAppearance();
const emptyBoxColor = isDark ? new Color("#3a3a3c") : new Color("#e5e5ea");

let widget = new ListWidget();
widget.backgroundColor = bgColor; 
widget.setPadding(12, 16, 12, 16);

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const currentDay = now.getDate();
const daysLeft = daysInMonth - currentDay;
const monthName = now.toLocaleString('en-US', { month: 'long' });

const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
const hoursLeftNum = Math.floor((endOfMonth - now) / (1000 * 60 * 60));

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
  let futureTotal = total - currentIdx - 1;

  for (let i = 0; i < total; i++) {
    let col = i % cols; let row = Math.floor(i / cols);
    let rect = new Rect(col * (boxSize + gap), row * (boxSize + gap), boxSize, boxSize);
    let path = new Path(); path.addRoundedRect(rect, 2, 2);
    if (i < currentIdx) {
      context.setFillColor(emptyBoxColor);
      context.addPath(path); context.fillPath();
    } else if (i === currentIdx) {
      context.setFillColor(new Color("#4772fa"));
      context.addPath(path); context.fillPath();
      let innerRect = new Rect(col * (boxSize + gap) + 1.5, row * (boxSize + gap) + 1.5, boxSize - 3, boxSize - 3);
      let innerPath = new Path(); innerPath.addRoundedRect(innerRect, 1, 1);
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

let titleText = widget.addText(`What's left of ${monthName} ${year}`);
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
addLiveTimerBlock(statsRow, "Live Time Left", endOfMonth);

widget.addSpacer(12);
let dStack = widget.addStack();
dStack.layoutHorizontally();
let dTitle = dStack.addText("Days Remaining This Month");
dTitle.font = Font.boldSystemFont(10); dTitle.textColor = mainTextColor;
dStack.addSpacer();
let dVal = dStack.addText(`(${daysLeft}/${daysInMonth})`);
dVal.font = Font.boldSystemFont(10); dVal.textColor = subTextColor;

widget.addSpacer(6);
let gridContainer = widget.addStack();
gridContainer.layoutHorizontally(); gridContainer.addSpacer(); 
gridContainer.addImage(drawGrid(daysInMonth, currentDay - 1, 16, "#54d6c4", "#1a5196", 11, 3.5));
gridContainer.addSpacer();

Script.setWidget(widget); Script.complete(); widget.presentMedium();
