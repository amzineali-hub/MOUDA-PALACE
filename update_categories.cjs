const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `              if (!categories.includes(category)) {
                try {
                  await addDoc(collection(db, 'inventoryCategories'), { name: category });
                } catch (err) {
                  console.error("Error adding category", err);
                }
              }`;

const replacement = `              if (!categories.includes(category)) {
                try {
                  await addDoc(collection(db, 'inventoryCategories'), { name: category });
                  setCategories([...categories, category]);
                } catch (err) {
                  console.error("Error adding category", err);
                }
              }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully updated category logic");
} else {
  console.log("Target not found");
}
