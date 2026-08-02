const { Timestamp } = require('firebase/firestore');
const t = Timestamp.now();
console.log(JSON.stringify({ t }));
