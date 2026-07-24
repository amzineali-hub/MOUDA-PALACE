import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ai-studio-moudapalacesaas-4dac6993-224c-4a7d-9a21-1588a2dfdc68",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const querySnapshot = await getDocs(collection(db, "blog_posts"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`Article ID: ${doc.id}`);
    
    // Find all markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(data.content)) !== null) {
      console.log(`  Found link: [${match[1]}](${match[2]})`);
    }
  });
}

check().catch(console.error);
