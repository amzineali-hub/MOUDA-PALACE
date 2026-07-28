const fs = require('fs');
let code = fs.readFileSync('src/MenuGenerator.tsx', 'utf8');

const oldArray = `  const availableImages = [
    "/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fez-medina-medium.jpg",
    "/Capture-decran-2024-10-06-150159.png",
    "/Capture-decran-2025-07-17-144912.png",
    "/d0.jpg",
    "/DSC_0290-scaled.jpg",
    "/fes-spring.jpg",
    "/IMG_4253-2048x1365.jpg"
  ];`;

const newArray = `  const availableImages = [
    "/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fez-medina-medium.jpg",
    "/Capture-decran-2024-10-06-150159.png",
    "/Capture-decran-2025-07-17-144912.png",
    "/d0.jpg",
    "/DSC_0290-scaled.jpg",
    "/fes-spring.jpg",
    "/IMG_4253-2048x1365.jpg",
    "/mouda-1.png",
    "/mouda 2.JPG",
    "/mouda.png"
  ];`;

code = code.replace(oldArray, newArray);
fs.writeFileSync('src/MenuGenerator.tsx', code);
console.log("Updated MenuGenerator available images array");
