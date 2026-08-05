const fs = require('fs');
let content = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf-8');

const targetStr = `const originalItems = order.items || order.articles || [];
  const [items, setItems] = useState<any[]>(
    originalItems.map((i: any) => ({
      ...i,
      name: i.name || i.produit || 'Produit inconnu',
      quantityOrdered: i.qty || i.quantity || i.quantityOrdered || 0,
      quantityReceived: i.qty || i.quantity || i.quantityOrdered || 0,
      expectedPrice: i.price || i.prix || i.expectedPrice || 0,
      actualPrice: i.price || i.prix || i.expectedPrice || 0,
      qualityOk: true
    }))
  );`;

const replacementStr = `  const parseArticles = (articles: any) => {
    if (Array.isArray(articles)) return articles;
    if (typeof articles === 'string') {
      return articles.split(', ').map(a => {
        const parts = a.split(' - ');
        return {
          name: parts[0] || 'Inconnu',
          quantityOrdered: parseFloat(parts[1]) || 0,
          quantityReceived: parseFloat(parts[1]) || 0,
          expectedPrice: 0,
          actualPrice: 0,
          qualityOk: true
        };
      });
    }
    return [];
  };

  const originalItems = Array.isArray(order.items) ? order.items : parseArticles(order.articles);
  const [items, setItems] = useState<any[]>(
    originalItems.map((i: any) => ({
      ...i,
      name: i.name || i.produit || 'Produit inconnu',
      quantityOrdered: i.quantityOrdered || i.qty || i.quantity || 0,
      quantityReceived: i.quantityReceived || i.qty || i.quantity || i.quantityOrdered || 0,
      expectedPrice: i.expectedPrice || i.price || i.prix || 0,
      actualPrice: i.actualPrice || i.price || i.prix || i.expectedPrice || 0,
      qualityOk: i.qualityOk !== undefined ? i.qualityOk : true
    }))
  );`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/AchatsFournisseurs.tsx', content);
console.log("Patched Reception Items Parsing");
