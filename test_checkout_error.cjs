const fs = require('fs');
let code = fs.readFileSync('src/POSTactile.tsx', 'utf-8');

const target = `    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'encaissement", "error");
    }`;
const replacement = `    } catch (err: any) {
      console.error(err);
      showToast("Erreur: " + err.message, "error");
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/POSTactile.tsx', code);
    console.log("Patched catch block");
} else {
    console.log("Catch block not found");
}
