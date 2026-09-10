// Import ponctuel du contenu de MOUDA PALACE MENU.pdf et MENU BOISSON.pdf dans `menu_items`.
// Transcrit à la main depuis les deux PDF (pages rendues en image, lues visuellement — ces PDF
// n'ont pas de texte réel intégré). Prix en Dhs (MAD) uniquement ; les colonnes €/$ du PDF ne
// sont qu'une conversion indicative, pas stockées. Sans photo (`imageUrl` volontairement vide,
// prend le placeholder par défaut) — à illustrer ensuite depuis l'éditeur de menu.
//
// Usage : bouton "Importer le menu PDF" dans MenuGenerator (import ponctuel, protégé contre les
// doublons par nom — peut être relancé sans risque). À retirer du code une fois l'import confirmé
// par l'utilisateur.

export type PdfMenuImportItem = {
  name: string;
  category: string;
  price: string;
  desc?: string;
};

export const PDF_MENU_IMPORT_ITEMS: PdfMenuImportItem[] = [
  // ─── Entrées marocaines (MENU MAROCAIN) ───
  { name: "La Fameuse Soupe Traditionnelle Harira servie avec ses Dattes, Chebbakia", category: "Entrées marocaines", price: "60 MAD" },
  { name: "Seffa", category: "Entrées marocaines", price: "80 MAD", desc: "Cheveux d'Ange parfumé à la Cannelle, garni de Raisins Secs et Amandes" },
  { name: "Mosaïque de Salades Marocaines", category: "Entrées marocaines", price: "90 MAD" },
  { name: "Sélection de Briouates", category: "Entrées marocaines", price: "90 MAD", desc: "Feuilletés farcis à la Viande Hachée, aux Légumes frais, et au Fromage" },
  { name: "Foie de Boeuf à la Charmoula Marocaine", category: "Entrées marocaines", price: "120 MAD" },

  // ─── Plats marocains (MENU MAROCAIN) ───
  { name: "Pastilla Fassie à la Volaille", category: "Plats marocains", price: "140 MAD", desc: "Tourte croustillante farcie, aux Amandes, goût sucré salé" },
  { name: "Tajine Berbère aux Légumes de saison, Citron confit", category: "Plats marocains", price: "130 MAD" },
  { name: "Tajine Kefta aux Œufs et Sauce Tomate", category: "Plats marocains", price: "150 MAD" },
  { name: "Tajine de Crevettes à la Marocaine", category: "Plats marocains", price: "150 MAD" },
  { name: "Tajine de Poulet aux Frites, Olives et Citron confit", category: "Plats marocains", price: "170 MAD" },
  { name: "Tajine de Boeuf Confit, Légumes, Safran, Citron", category: "Plats marocains", price: "180 MAD" },
  { name: "Couscous Végétarien aux Légumes frais et Raisins Secs caramélisés", category: "Plats marocains", price: "130 MAD" },
  { name: "Couscous Fassi Traditionnel", category: "Plats marocains", price: "170 MAD", desc: "Poulet ou Boeuf aux Légumes frais et Raisins Secs caramélisés" },
  { name: "Tajine d'Agneau aux Pruneaux, Abricots et Amandes grillées", category: "Plats marocains", price: "220 MAD" },

  // ─── Entrées saveurs du monde ───
  { name: "Crème de Légumes d'hiver", category: "Entrées saveurs du monde", price: "70 MAD" },
  { name: "Mezze Libanais", category: "Entrées saveurs du monde", price: "80 MAD", desc: "Houmous, Tzatziki, Baba Ghanoush" },
  { name: "Arancini à la Bolognaise parfumée au Safran Bio", category: "Entrées saveurs du monde", price: "90 MAD" },
  { name: "Tartare de Thon Rouge aromatisé au Gingembre, au Citron Vert et à l'Huile d'Argan", category: "Entrées saveurs du monde", price: "120 MAD" },
  { name: "Coupe fraîcheur à la Mozzarella panée", category: "Entrées saveurs du monde", price: "90 MAD", desc: "Quinoa, Courgette grillée, et Fruits de saison" },

  // ─── Plats saveurs du monde ───
  { name: "Brochettes de volaille aux trois saveurs", category: "Plats saveurs du monde", price: "160 MAD", desc: "Curry miel, marinade marocaine, sauce grecque, frites" },
  { name: "Pavé de Saumon", category: "Plats saveurs du monde", price: "190 MAD", desc: "Déclinaison de poivron et ratatouille de légumes, sauce à l'orange" },
  { name: "Mouda Burger", category: "Plats saveurs du monde", price: "160 MAD", desc: "Pain brioché maison, viande de bœuf maturée, tombée de Daghmira, fromage, frites" },
  { name: "Filet de Bœuf", category: "Plats saveurs du monde", price: "220 MAD", desc: "Mousseline de pommes de terre parfumée à la truffe, carotte glacée, jus à la réglisse" },
  { name: "Linguine alla Stracciatella", category: "Plats saveurs du monde", price: "140 MAD", desc: "Tomates cerises, olives, câpres, Parmesan, cœur de burrata" },
  { name: "Penne alla crema di zucchine e salmone", category: "Plats saveurs du monde", price: "160 MAD", desc: "Courgette, Saumon frais, citron vert" },
  { name: "Risotto crémeux con gamberi", category: "Plats saveurs du monde", price: "160 MAD", desc: "Crème de Safran" },

  // ─── Desserts (catégorie existante, inchangée) ───
  { name: "Mouda Pastilla à la Poire caramélisée et Pistache", category: "Desserts", price: "90 MAD", desc: "Parfumée à la Gomme Arabique" },
  { name: "Assortiment de Gâteaux Marocains, Thé à la Menthe fraîche", category: "Desserts", price: "80 MAD" },
  { name: "Assiette de Fruits frais découpés", category: "Desserts", price: "80 MAD" },
  { name: "Paris Brest à la Noisette, sauce chocolat", category: "Desserts", price: "90 MAD" },

  // ─── Accompagnement (rangé en Plats Principaux, legacy — pas de catégorie dédiée demandée) ───
  { name: "Accompagnement au choix", category: "Plats Principaux", price: "25 MAD", desc: "Semoule, Frites, Riz, Salade Verte, Légumes sautés" },

  // ─── Boissons Fraîches ───
  { name: "Sidi Ali 75cl", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Sidi Ali 50cl", category: "Boissons Fraîches", price: "25 MAD" },
  { name: "Oulmès 75cl", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Oulmès 50cl", category: "Boissons Fraîches", price: "25 MAD" },
  { name: "Coca Cola / Coca Cola Zero", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Schweppes Citron", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Schweppes Tonic", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Sprite", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Hawaï", category: "Boissons Fraîches", price: "30 MAD" },
  { name: "Thé glacé maison", category: "Boissons Fraîches", price: "40 MAD" },
  { name: "Red Bull", category: "Boissons Fraîches", price: "50 MAD" },
  { name: "Bière sans alcool", category: "Boissons Fraîches", price: "60 MAD" },

  // ─── Boissons Chaudes ───
  { name: "Espresso", category: "Boissons Chaudes", price: "30 MAD" },
  { name: "Double Espresso", category: "Boissons Chaudes", price: "40 MAD" },
  { name: "Americano", category: "Boissons Chaudes", price: "35 MAD" },
  { name: "Cappuccino", category: "Boissons Chaudes", price: "45 MAD" },
  { name: "Chaï Latte à la Cannelle", category: "Boissons Chaudes", price: "45 MAD" },
  { name: "Matcha Latte", category: "Boissons Chaudes", price: "45 MAD" },
  { name: "Thé Marocain à la Menthe", category: "Boissons Chaudes", price: "35 MAD" },
  { name: "Infusion au choix", category: "Boissons Chaudes", price: "35 MAD" },
  { name: "Chocolat fondu à l'Espagnole", category: "Boissons Chaudes", price: "45 MAD" },

  // ─── Jus Maison (tous 80 Dhs) ───
  { name: "Jus Detox", category: "Jus Maison", price: "80 MAD", desc: "Citron, concombre, gingembre, pomme" },
  { name: "Jus ACE", category: "Jus Maison", price: "80 MAD", desc: "Orange pressée, carotte, citron" },
  { name: "Jus Vitalité", category: "Jus Maison", price: "80 MAD", desc: "Betterave, orange, citron" },
  { name: "Jus Protéine", category: "Jus Maison", price: "80 MAD", desc: "Banane, pomme, graines de chia" },

  // ─── Mocktails ───
  { name: "Fleurs d'Hibiscus Bio", category: "Mocktails", price: "90 MAD", desc: "Purée d'hibiscus, citron vert, jus d'ananas, sirop d'agave" },
  { name: "Mojito Flowers", category: "Mocktails", price: "90 MAD", desc: "Lime, menthe fraîche, fleur d'oranger" },
  { name: "Espresso Daïquiri", category: "Mocktails", price: "90 MAD", desc: "Espresso, gingembre, miel" },
  { name: "Fraise Orgasme", category: "Mocktails", price: "90 MAD", desc: "Purée de fraise, jus d'ananas, citron vert, menthe fraîche" },

  // ─── Cocktails ───
  { name: "Aperol Spritz", category: "Cocktails", price: "120 MAD", desc: "Aperol, prosecco, orange" },
  { name: "Cuba Libre", category: "Cocktails", price: "120 MAD", desc: "Rhum, jus de citron, coca" },
  { name: "Gin Tonic", category: "Cocktails", price: "120 MAD" },
  { name: "Piment Mule", category: "Cocktails", price: "120 MAD", desc: "Vodka, sirop de sucre, citron vert, piment frais" },
  { name: "Godfather", category: "Cocktails", price: "120 MAD", desc: "Whisky, Amaretto, cannelle" },
  { name: "Mouda Cocktail", category: "Cocktails", price: "120 MAD", desc: "Cardamome, vodka, lime" },

  // ─── Bières ───
  { name: "Casablanca", category: "Bières", price: "70 MAD" },
  { name: "Corona", category: "Bières", price: "90 MAD" },
  { name: "Heineken 0.0%", category: "Bières", price: "60 MAD" },

  // ─── Vins Blancs & Rosé ───
  { name: "Zellige Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "400 MAD" },
  { name: "Volubilia Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "420 MAD" },
  { name: "Epicuria Blanc/Rosé - Domaine de la Zouina", category: "Vins Blancs & Rosé", price: "600 MAD" },
  { name: "Verre de vin (au choix)", category: "Vins Blancs & Rosé", price: "100 MAD" },

  // ─── Vins Rouges ───
  { name: "Zellige Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "400 MAD" },
  { name: "Volubilia Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "420 MAD" },
  { name: "Epicuria Rouge - Domaine de la Zouina", category: "Vins Rouges", price: "600 MAD" },

  // ─── Champagnes & Prosecco ───
  { name: "Nicolas Feuillatte Brut", category: "Champagnes & Prosecco", price: "1200 MAD" },
  { name: "Veuve Clicquot Brut", category: "Champagnes & Prosecco", price: "1500 MAD" },
  { name: "Prosecco George X", category: "Champagnes & Prosecco", price: "400 MAD" },

  // ─── Spiritueux ───
  { name: "Johnnie Walker Red", category: "Spiritueux", price: "160 MAD" },
  { name: "Johnnie Walker Black Label", category: "Spiritueux", price: "160 MAD" },
  { name: "Gordon's Gin", category: "Spiritueux", price: "150 MAD" },
  { name: "Vodka Absolut", category: "Spiritueux", price: "150 MAD" },
  { name: "Havana Club 3 ans", category: "Spiritueux", price: "150 MAD" },

  // ─── Digestifs ───
  { name: "Limoncello", category: "Digestifs", price: "80 MAD" },
  { name: "Amaretto", category: "Digestifs", price: "80 MAD" },
  { name: "Pastis Ricard", category: "Digestifs", price: "90 MAD" },
  { name: "Jägermeister", category: "Digestifs", price: "120 MAD" },

  // ─── Tapas ───
  { name: "Croustillant de poulet sauce thaï", category: "Tapas", price: "70 MAD" },
  { name: "Bouchées dorées de fromages au figue caramélisées", category: "Tapas", price: "90 MAD" },
  { name: "Crevettes à la plancha sauce aux herbes", category: "Tapas", price: "70 MAD" },
  { name: "Anchois marinés à l'huile d'olive", category: "Tapas", price: "70 MAD" },

  // ─── Chicha ───
  { name: "Chicha - Parfums au choix", category: "Chicha", price: "150 MAD" }
];
