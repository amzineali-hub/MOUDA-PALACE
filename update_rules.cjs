const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    // ----------------------------------------------------------------------
    // BLOG POSTS
    // ----------------------------------------------------------------------
    match /blog_posts/{postId} {
      allow read, write: if isSignedIn(); // Ou isStaff() si strict, mettons isSignedIn pour simplifier
    }
`;

content = content.replace("  }\n}", "  }" + newRule + "}");
fs.writeFileSync('firestore.rules', content);
