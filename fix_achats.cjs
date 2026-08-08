const fs = require('fs');
let code = fs.readFileSync('src/AchatsFournisseurs.tsx', 'utf8');

const badCode = `    const handleGeneratePrevisions = () => {
    setIsGeneratingPrevisions(true);
    setTimeout(() => {
      setPrevisions([
        {
          category: 'Produits Frais',
          items: [
            { name: 'Tomates (Catégorie 1)', quantity: '50 kg', supplier: 'Marché Central', reason: 'Forte demande prévue pour les salades (Hausse de 20% des réservations)' },
            { name: 'Poulet Fermier', quantity: '120 kg', supplier: 'Ferme Atlas', reason: 'Menu spécial du weekend' },
            { name: 'Saumon Frais', quantity: '30 kg', supplier: 'Marée Bleue', reason: 'Stock actuel critique (Reste 5 kg)' }
          ]
        },
        {
          category: 'Épicerie & Secs',
          amount: '15 items',
          items: [
            { name: 'Riz Basmati', quantity: '100 kg', supplier: 'Atlas Food', reason: 'Réapprovisionnement mensuel optimal' },
            { name: 'Huile d\'olive extra vierge', quantity: '40 L', supplier: 'Huileries du Sud', reason: 'Consommation accrue observée' }
          ]
        },
        {
          category: 'Boissons',
          amount: '8 items',
          items: [
            { name: 'Eau Minérale (Plate)', quantity: '200 packs', supplier: 'Distributeur Boissons', reason: 'Prévision de fortes chaleurs cette semaine' },
            { name: 'Jus d\\'orange frais', quantity: '50 L', supplier: 'Marché Central', reason: 'Consommation matinale au buffet en hausse' }
          ]
        }
      ]);
      setIsGeneratingPrevisions(false);
      showToast('Prévisions générées avec succès par l\\'IA');
    }, 2500);
  };`;

if (code.includes(badCode)) {
  code = code.replace(badCode, '');
  fs.writeFileSync('src/AchatsFournisseurs.tsx', code);
  console.log('Fixed AchatsFournisseurs');
} else {
  console.log('Not found');
}
