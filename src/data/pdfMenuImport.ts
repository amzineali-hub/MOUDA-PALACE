// Import ponctuel du contenu de MOUDA PALACE MENU.pdf et MENU BOISSON.pdf dans `menu_items` et
// `fiches_techniques`. Transcrit à la main depuis les deux PDF (pages rendues en image, lues
// visuellement — ces PDF n'ont pas de texte réel intégré). Prix en Dhs (MAD) uniquement ; les
// colonnes €/$ du PDF ne sont qu'une conversion indicative, pas stockées. Sans photo (`imageUrl`
// volontairement vide, prend le placeholder par défaut) — à illustrer ensuite depuis l'éditeur.
//
// `ingredientsText` : liste publique (site/brochure), un ingrédient par ligne — volontairement
// SANS quantités : les PDF sources n'en donnent aucune, uniquement les composants nommés dans le
// nom/la description de chaque article. À compléter avec de vraies quantités plus tard si besoin.
// Laissé vide pour les produits commerciaux tels quels (sodas, bières, vins, spiritueux, Chicha
// "parfums au choix") — une liste d'ingrédients n'a pas de sens pour un produit déjà embouteillé.
//
// Usage : bouton "Importer le menu PDF" dans MenuGenerator (import ponctuel, protégé contre les
// doublons par nom — peut être relancé sans risque). À retirer du code une fois l'import confirmé
// par l'utilisateur.

export type PdfMenuImportItem = {
  name: string;
  category: string;
  price: string;
  desc?: string;
  ingredients?: string[];
};

export const PDF_MENU_IMPORT_ITEMS: PdfMenuImportItem[] = [
  // ─── Entrées marocaines (MENU MAROCAIN) ───
  { name: "La Fameuse Soupe Traditionnelle Harira servie avec ses Dattes, Chebbakia", category: "Entrées marocaines", price: "60 MAD", ingredients: ["Harira (soupe traditionnelle marocaine)", "Dattes", "Chebbakia"] },
  { name: "Seffa", category: "Entrées marocaines", price: "80 MAD", desc: "Cheveux d'Ange parfumé à la Cannelle, garni de Raisins Secs et Amandes", ingredients: ["Cheveux d'ange (vermicelle fin)", "Cannelle", "Raisins secs", "Amandes"] },
  { name: "Mosaïque de Salades Marocaines", category: "Entrées marocaines", price: "90 MAD", ingredients: ["Assortiment de salades marocaines"] },
  { name: "Sélection de Briouates", category: "Entrées marocaines", price: "90 MAD", desc: "Feuilletés farcis à la Viande Hachée, aux Légumes frais, et au Fromage", ingredients: ["Pâte briouate (feuilletée)", "Viande hachée", "Légumes frais", "Fromage"] },
  { name: "Foie de Boeuf à la Charmoula Marocaine", category: "Entrées marocaines", price: "120 MAD", ingredients: ["Foie de bœuf", "Charmoula marocaine"] },

  // ─── Plats marocains (MENU MAROCAIN) ───
  { name: "Pastilla Fassie à la Volaille", category: "Plats marocains", price: "140 MAD", desc: "Tourte croustillante farcie, aux Amandes, goût sucré salé", ingredients: ["Volaille effilochée", "Amandes", "Pâte à pastilla (feuille de brick)"] },
  { name: "Tajine Berbère aux Légumes de saison, Citron confit", category: "Plats marocains", price: "130 MAD", ingredients: ["Légumes de saison", "Citron confit"] },
  { name: "Tajine Kefta aux Œufs et Sauce Tomate", category: "Plats marocains", price: "150 MAD", ingredients: ["Kefta (boulettes de viande hachée)", "Œufs", "Sauce tomate"] },
  { name: "Tajine de Crevettes à la Marocaine", category: "Plats marocains", price: "150 MAD", ingredients: ["Crevettes", "Épices marocaines"] },
  { name: "Tajine de Poulet aux Frites, Olives et Citron confit", category: "Plats marocains", price: "170 MAD", ingredients: ["Poulet", "Frites", "Olives", "Citron confit"] },
  { name: "Tajine de Boeuf Confit, Légumes, Safran, Citron", category: "Plats marocains", price: "180 MAD", ingredients: ["Bœuf confit", "Légumes", "Safran", "Citron"] },
  { name: "Couscous Végétarien aux Légumes frais et Raisins Secs caramélisés", category: "Plats marocains", price: "130 MAD", ingredients: ["Semoule de couscous", "Légumes frais", "Raisins secs caramélisés"] },
  { name: "Couscous Fassi Traditionnel", category: "Plats marocains", price: "170 MAD", desc: "Poulet ou Boeuf aux Légumes frais et Raisins Secs caramélisés", ingredients: ["Semoule de couscous", "Poulet ou bœuf", "Légumes frais", "Raisins secs caramélisés"] },
  { name: "Tajine d'Agneau aux Pruneaux, Abricots et Amandes grillées", category: "Plats marocains", price: "220 MAD", ingredients: ["Agneau", "Pruneaux", "Abricots", "Amandes grillées"] },

  // ─── Entrées saveurs du monde ───
  { name: "Crème de Légumes d'hiver", category: "Entrées saveurs du monde", price: "70 MAD", ingredients: ["Légumes d'hiver", "Crème"] },
  { name: "Mezze Libanais", category: "Entrées saveurs du monde", price: "80 MAD", desc: "Houmous, Tzatziki, Baba Ghanoush", ingredients: ["Houmous", "Tzatziki", "Baba ghanoush"] },
  { name: "Arancini à la Bolognaise parfumée au Safran Bio", category: "Entrées saveurs du monde", price: "90 MAD", ingredients: ["Riz", "Sauce bolognaise", "Safran bio"] },
  { name: "Tartare de Thon Rouge aromatisé au Gingembre, au Citron Vert et à l'Huile d'Argan", category: "Entrées saveurs du monde", price: "120 MAD", ingredients: ["Thon rouge", "Gingembre", "Citron vert", "Huile d'argan"] },
  { name: "Coupe fraîcheur à la Mozzarella panée", category: "Entrées saveurs du monde", price: "90 MAD", desc: "Quinoa, Courgette grillée, et Fruits de saison", ingredients: ["Mozzarella panée", "Quinoa", "Courgette grillée", "Fruits de saison"] },

  // ─── Plats saveurs du monde ───
  { name: "Brochettes de volaille aux trois saveurs", category: "Plats saveurs du monde", price: "160 MAD", desc: "Curry miel, marinade marocaine, sauce grecque, frites", ingredients: ["Volaille", "Sauce curry-miel", "Marinade marocaine", "Sauce grecque", "Frites"] },
  { name: "Pavé de Saumon", category: "Plats saveurs du monde", price: "190 MAD", desc: "Déclinaison de poivron et ratatouille de légumes, sauce à l'orange", ingredients: ["Saumon", "Poivron", "Ratatouille de légumes", "Sauce à l'orange"] },
  { name: "Mouda Burger", category: "Plats saveurs du monde", price: "160 MAD", desc: "Pain brioché maison, viande de bœuf maturée, tombée de Daghmira, fromage, frites", ingredients: ["Pain brioché maison", "Bœuf maturé", "Daghmira (verdure locale sautée)", "Fromage", "Frites"] },
  { name: "Filet de Bœuf", category: "Plats saveurs du monde", price: "220 MAD", desc: "Mousseline de pommes de terre parfumée à la truffe, carotte glacée, jus à la réglisse", ingredients: ["Filet de bœuf", "Mousseline de pommes de terre à la truffe", "Carotte glacée", "Jus à la réglisse"] },
  { name: "Linguine alla Stracciatella", category: "Plats saveurs du monde", price: "140 MAD", desc: "Tomates cerises, olives, câpres, Parmesan, cœur de burrata", ingredients: ["Linguine", "Tomates cerises", "Olives", "Câpres", "Parmesan", "Cœur de burrata"] },
  { name: "Penne alla crema di zucchine e salmone", category: "Plats saveurs du monde", price: "160 MAD", desc: "Courgette, Saumon frais, citron vert", ingredients: ["Penne", "Crème de courgette", "Saumon frais", "Citron vert"] },
  { name: "Risotto crémeux con gamberi", category: "Plats saveurs du monde", price: "160 MAD", desc: "Crème de Safran", ingredients: ["Riz à risotto", "Crevettes (gamberi)", "Crème de safran"] },

  // ─── Desserts (catégorie existante, inchangée) ───
  { name: "Mouda Pastilla à la Poire caramélisée et Pistache", category: "Desserts", price: "90 MAD", desc: "Parfumée à la Gomme Arabique", ingredients: ["Pâte à pastilla", "Poire caramélisée", "Pistache", "Gomme arabique"] },
  { name: "Assortiment de Gâteaux Marocains, Thé à la Menthe fraîche", category: "Desserts", price: "80 MAD", ingredients: ["Assortiment de gâteaux marocains", "Thé à la menthe fraîche"] },
  { name: "Assiette de Fruits frais découpés", category: "Desserts", price: "80 MAD", ingredients: ["Fruits frais de saison"] },
  { name: "Paris Brest à la Noisette, sauce chocolat", category: "Desserts", price: "90 MAD", ingredients: ["Pâte à choux", "Crème pralinée noisette", "Sauce chocolat"] },

  // ─── Accompagnement (rangé en Plats Principaux, legacy — pas de catégorie dédiée demandée) ───
  { name: "Accompagnement au choix", category: "Plats Principaux", price: "25 MAD", desc: "Semoule, Frites, Riz, Salade Verte, Légumes sautés", ingredients: ["Semoule", "Frites", "Riz", "Salade verte", "Légumes sautés"] },

  // ─── Boissons Fraîches (produits embouteillés/commerciaux — pas de liste d'ingrédients) ───
  { name: "Sidi Ali 75cl", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Sidi Ali 50cl", category: "Boissons Fraîches", price: "25 MAD" },
  { name: "Oulmès 75cl", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Oulmès 50cl", category: "Boissons Fraîches", price: "25 MAD" },
  { name: "Coca Cola / Coca Cola Zero", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Schweppes Citron", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Schweppes Tonic", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Sprite", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Hawaï", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Thé glacé maison", category: "Boissons Fraîches", price: "40 MAD", ingredients: ["Thé", "Glaçons"] },
  { name: "Red Bull", category: "Boissons Fraîches", price: "50 MAD" },
  { name: "Bière sans alcool", category: "Boissons Fraîches", price: "60 MAD" },

  // ─── Boissons Chaudes ───
  { name: "Espresso", category: "Boissons Chaudes", price: "30 MAD" },
  { name: "Double Espresso", category: "Boissons Chaudes", price: "40 MAD" },
  { name: "Americano", category: "Boissons Chaudes", price: "35 MAD" },
  { name: "Cappuccino", category: "Boissons Chaudes", price: "45 MAD" },
  { name: "Chaï Latte à la Cannelle", category: "Boissons Chaudes", price: "45 MAD", ingredients: ["Thé chaï", "Lait", "Cannelle"] },
  { name: "Matcha Latte", category: "Boissons Chaudes", price: "45 MAD", ingredients: ["Matcha", "Lait"] },
  { name: "Thé Marocain à la Menthe", category: "Boissons Chaudes", price: "35 MAD", ingredients: ["Thé vert", "Menthe fraîche", "Sucre"] },
  { name: "Infusion au choix", category: "Boissons Chaudes", price: "35 MAD" },
  { name: "Chocolat fondu à l'Espagnole", category: "Boissons Chaudes", price: "45 MAD", ingredients: ["Chocolat fondu", "Lait"] },

  // ─── Jus Maison (tous 80 Dhs) ───
  { name: "Jus Detox", category: "Jus Maison", price: "80 MAD", desc: "Citron, concombre, gingembre, pomme", ingredients: ["Citron", "Concombre", "Gingembre", "Pomme"] },
  { name: "Jus ACE", category: "Jus Maison", price: "80 MAD", desc: "Orange pressée, carotte, citron", ingredients: ["Orange pressée", "Carotte", "Citron"] },
  { name: "Jus Vitalité", category: "Jus Maison", price: "80 MAD", desc: "Betterave, orange, citron", ingredients: ["Betterave", "Orange", "Citron"] },
  { name: "Jus Protéine", category: "Jus Maison", price: "80 MAD", desc: "Banane, pomme, graines de chia", ingredients: ["Banane", "Pomme", "Graines de chia"] },

  // ─── Mocktails ───
  { name: "Fleurs d'Hibiscus Bio", category: "Mocktails", price: "90 MAD", desc: "Purée d'hibiscus, citron vert, jus d'ananas, sirop d'agave", ingredients: ["Purée d'hibiscus", "Citron vert", "Jus d'ananas", "Sirop d'agave"] },
  { name: "Mojito Flowers", category: "Mocktails", price: "90 MAD", desc: "Lime, menthe fraîche, fleur d'oranger", ingredients: ["Lime", "Menthe fraîche", "Fleur d'oranger"] },
  { name: "Espresso Daïquiri", category: "Mocktails", price: "90 MAD", desc: "Espresso, gingembre, miel", ingredients: ["Espresso", "Gingembre", "Miel"] },
  { name: "Fraise Orgasme", category: "Mocktails", price: "90 MAD", desc: "Purée de fraise, jus d'ananas citron vert, menthe fraîche", ingredients: ["Purée de fraise", "Jus d'ananas", "Citron vert", "Menthe fraîche"] },

  // ─── Cocktails ───
  { name: "Aperol Spritz", category: "Cocktails", price: "120 MAD", desc: "Aperol, prosecco, orange", ingredients: ["Aperol", "Prosecco", "Orange"] },
  { name: "Cuba Libre", category: "Cocktails", price: "120 MAD", desc: "Rhum, jus de citron, coca", ingredients: ["Rhum", "Jus de citron", "Coca"] },
  { name: "Gin Tonic", category: "Cocktails", price: "120 MAD", ingredients: ["Gin", "Tonic"] },
  { name: "Piment Mule", category: "Cocktails", price: "120 MAD", desc: "Vodka, sirop de sucre, citron vert, piment frais", ingredients: ["Vodka", "Sirop de sucre", "Citron vert", "Piment frais"] },
  { name: "Godfather", category: "Cocktails", price: "120 MAD", desc: "Whisky, Amaretto, cannelle", ingredients: ["Whisky", "Amaretto", "Cannelle"] },
  { name: "Mouda Cocktail", category: "Cocktails", price: "120 MAD", desc: "Cardamome, vodka, lime", ingredients: ["Cardamome", "Vodka", "Lime"] },

  // ─── Bières (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Casablanca", category: "Bières", price: "70 MAD" },
  { name: "Corona", category: "Bières", price: "90 MAD" },
  { name: "Heineken 0.0%", category: "Bières", price: "60 MAD" },

  // ─── Vins Blancs & Rosé (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Zellige Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "400 MAD" },
  { name: "Volubilia Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "420 MAD" },
  { name: "Epicuria Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "600 MAD" },
  { name: "Verre de vin (au choix)", category: "Vins Blancs & Rosé", price: "100 MAD" },

  // ─── Vins Rouges (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Zellige Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "400 MAD" },
  { name: "Volubilia Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "420 MAD" },
  { name: "Epicuria Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "600 MAD" },

  // ─── Champagnes & Prosecco (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Nicolas Feuillatte Brut", category: "Champagnes & Prosecco", price: "1200 MAD" },
  { name: "Veuve Clicquot Brut", category: "Champagnes & Prosecco", price: "1500 MAD" },
  { name: "Prosecco George X", category: "Champagnes & Prosecco", price: "400 MAD" },

  // ─── Spiritueux (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Johnnie Walker Red", category: "Spiritueux", price: "160 MAD" },
  { name: "Johnnie Walker Black Label", category: "Spiritueux", price: "160 MAD" },
  { name: "Gordon's Gin", category: "Spiritueux", price: "150 MAD" },
  { name: "Vodka Absolut", category: "Spiritueux", price: "150 MAD" },
  { name: "Havana Club 3 ans", category: "Spiritueux", price: "150 MAD" },

  // ─── Digestifs (produits commerciaux — pas de liste d'ingrédients) ───
  { name: "Limoncello", category: "Digestifs", price: "80 MAD" },
  { name: "Amaretto", category: "Digestifs", price: "80 MAD" },
  { name: "Pastis Ricard", category: "Digestifs", price: "90 MAD" },
  { name: "Jägermeister", category: "Digestifs", price: "120 MAD" },

  // ─── Tapas ───
  { name: "Croustillant de poulet sauce thaï", category: "Tapas", price: "70 MAD", ingredients: ["Poulet", "Sauce thaï"] },
  { name: "Bouchées dorées de fromages au figue caramélisées", category: "Tapas", price: "90 MAD", ingredients: ["Fromage", "Figues caramélisées"] },
  { name: "Crevettes à la plancha sauce aux herbes", category: "Tapas", price: "70 MAD", ingredients: ["Crevettes", "Sauce aux herbes"] },
  { name: "Anchois marinés à l'huile d'olive", category: "Tapas", price: "70 MAD", ingredients: ["Anchois", "Huile d'olive"] },

  // ─── Chicha (parfum au choix — pas de liste d'ingrédients fixe) ───
  { name: "Chicha - Parfums au choix", category: "Chicha", price: "150 MAD" }
];
