# LifeGrid iOS Widgets ⏳

A complete suite of highly customized, native-feeling iOS Home Screen widgets that visualize your life progress. Inspired by the beautiful design of [lifegrid.pro](https://lifegrid.pro), these widgets bring your personal timeline right to your iPhone.

![Hero Banner / Main Screenshot]
*[Upload your screenshot showing the widgets stacked on your home screen here]*

## ✨ Features

This project includes 8 distinct widgets, meticulously designed to fit the iOS "Medium" widget size. They feature pixel-perfect geometry, smooth color blending, and **Full Native Dark Mode** support (backgrounds and text instantly adapt when your iPhone changes themes).

### The Macro Trackers (The Big Picture)
1. **Overall Life Progress (Months):** The centerpiece. A massive 960-square grid representing an 80-year lifespan, tracking your exact lived months via a beautiful Blue → Purple → Pink → Orange gradient.
2. **Overall Life Progress (Years):** A cleaner, 80-block grid highlighting your current year of life with a dynamic border.
3. **Remaining Prime Time:** Calculates your remaining prime years, months, and weeks (defaulting to age 45) with a smooth lavender-to-purple heatmap.
4. **Prime Years Progress (Months):** A monthly breakdown of your journey to age 45, using a fiery yellow-to-orange gradient.

### The Micro Trackers (The Now)
5. **What's left of this year:** Tracks your remaining days, weeks, and months for the current year with a dynamic blue-to-cyan gradient.
6. **What's left of this month:** A live-ticking countdown to the end of the month, calculating the exact days left with a teal-to-deep-blue gradient.
7. **What's left of this week:** A 7-day tracker to keep your week on track, featuring large blocks and a sunset coral-to-pink gradient.
8. **What's left of today:** A live-ticking countdown to midnight, plus a visual grid of your remaining active hours (6 AM to 9 PM).

## 🛠 Prerequisites

To run these widgets, you will need to download **Scriptable**, a free iOS app that runs JavaScript on your home screen.

* Download **[Scriptable on the App Store](https://apps.apple.com/us/app/scriptable/id1405459188)**

## 🚀 Installation Guide

You can install the entire suite, or just pick the ones you like. Repeat these steps for each widget you want to add:

1. Open the **Scriptable** app on your iPhone and tap the **"+"** icon in the top right corner to create a new script.
2. Tap the title at the top to name it (e.g., "LifeGrid Overall").
3. Copy the code from the corresponding `.js` file in this repository and paste it into the script.
4. **CRITICAL STEP:** Look at the top of the code for the `birthDate` variable. For the Macro Trackers, you **must** change this to your actual birthday (Format: `YYYY-MM-DD`).
   ```javascript
   // Example:
   const birthDate = new Date("1995-01-01");

5. Tap Done in the top left corner to save.
6. Go to your iPhone Home Screen, long-press on an empty space until the apps jiggle, and tap the "+" in the top left corner.
7. Search for Scriptable, swipe over to the Medium size (the wide rectangle), and tap Add Widget.
8. Tap the new widget while it's still jiggling, and under the Script option, select the script you just saved!

💡 Customization
These scripts are completely open for you to tweak!

Max Lifespan: The overall grid defaults to 80 years. You can change const maxLifespan = 80; at the top of the scripts.

Prime Age: The prime time widget defaults to 45 years. You can change const primeEndAge = 45; to whatever age you define as the end of your "prime".

Disclaimer: This project is a fan-made widget collection inspired by the visuals of lifegrid.pro. It is not affiliated with the official website.
