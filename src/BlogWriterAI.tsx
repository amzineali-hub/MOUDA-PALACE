import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Upload, PenTool, Sparkles, Loader2, Copy, Check, FileText, Clock, Trash2, ArrowRight, Edit2, X, Save, Settings, Send, TrendingUp, MousePointerClick, Award } from 'lucide-react';
import { useToast } from './context/ToastContext';
import ReactMarkdown from 'react-markdown';
import { marked } from 'marked';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import SeoAnalytics from './components/SeoAnalytics';
import { DEFAULT_COMPANY_INFO, mergeCompanyInfo, type CompanyInfo } from './lib/letterhead';

// Bloc factuel ajouté en fin de chaque article généré (voir handleGenerate) : adresse, horaires,
// contact — des faits stables sur l'établissement, pas propres au sujet de l'article. Contrairement
// au corps du texte (rédigé par l'IA, volontairement poétique — voir api/generate-blog.js), ce
// bloc est construit ici de façon déterministe à partir de la fiche établissement (Configuration >
// Général) : ce sont des faits qui doivent rester exacts et identiques d'un article à l'autre, pas
// quelque chose qu'on laisse un modèle de langage reformuler (et risquer de se tromper) à chaque
// génération. Objectif : donner aux moteurs de recherche génératifs (ChatGPT, Perplexity, Google AI
// Overviews...) un résumé net et citable, en plus du texte immersif destiné aux lecteurs humains.
const buildFactBlock = (info: CompanyInfo): string => {
  const name = info.name || 'Mouda Palace';
  const lines = [
    `- **Établissement** : ${name}${info.category ? ` — ${info.category}` : ''}`,
    info.address ? `- **Adresse** : ${info.address}` : null,
    info.hours ? `- **Horaires** : ${info.hours}` : null,
    `- **Cuisine** : Gastronomie marocaine raffinée (tajines, pastillas, mets fassis)`,
    `- **Ambiance** : Riad traditionnel au cœur de la médina de Fès — patio, terrasses (dont le Mouda Rooftop) et salons calmes et spacieux`,
    info.phone ? `- **Téléphone** : ${info.phone}` : null,
    info.email ? `- **Contact** : ${info.email}` : null,
    info.website ? `- **Site** : ${info.website}` : null,
  ].filter(Boolean);
  return `\n\n---\n\n### En bref — ${name}\n\n${lines.join('\n')}\n`;
};

// Extrait/méta-description envoyé à WordPress (champ `excerpt`, repris par défaut par les plugins
// SEO type Yoast/RankMath) — dérivé du vrai texte de l'article plutôt que laissé vide comme avant,
// pour ne pas dépendre d'un format de réponse IA supplémentaire à faire respecter.
const buildExcerpt = (markdown: string, maxLength = 155): string => {
  const plain = (markdown || '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
};

// L'article généré commence par un titre H1 Markdown ("# ..." — voir le prompt dans
// api/generate-blog.js). On l'extrait pour l'utiliser comme titre WordPress (au lieu du sujet brut
// tapé dans le formulaire) et on le retire du corps envoyé à WordPress, sinon le titre se
// retrouverait affiché deux fois sur la page publiée (une fois par le thème via le champ titre,
// une fois en tête du corps de l'article).
const extractTitle = (markdown: string, fallback: string): { title: string; body: string } => {
  const match = (markdown || '').match(/^#\s+(.+?)\s*$/m);
  if (!match) return { title: fallback, body: markdown };
  const title = match[1].trim();
  const body = markdown.slice(0, match.index) + markdown.slice((match.index || 0) + match[0].length);
  return { title: title || fallback, body: body.replace(/^\s+/, '') };
};

// Récupère l'image de couverture d'un article (chemin relatif vers un asset de l'app, ou data URL
// si l'utilisateur en a importé une) et la ré-encode en base64 brut pour l'upload vers la
// médiathèque WordPress via /api/publish-content (voir handlePublish) — WordPress exige un id de
// média existant pour `featured_media`, pas une simple URL d'image externe.
const resolveImageForUpload = async (imageUrl: string): Promise<{ filename: string; contentType: string; dataBase64: string } | null> => {
  if (!imageUrl) return null;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const contentType = blob.type || 'image/jpeg';
    const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg';
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return { filename: `mouda-palace-${Date.now()}.${extension}`, contentType, dataBase64: btoa(binary) };
  } catch (e) {
    console.error('Image resolution failed', e);
    return null;
  }
};

export default function BlogWriterAI({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeArticle, setActiveArticle] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  // WordPress/Webhook sont configurés dans Paramètres > Site Web (Configuration, App.tsx) — ce
  // module se contente de les lire ; l'écran d'édition n'existe qu'à un seul endroit pour éviter
  // deux formulaires qui écrivent sur le même document Firestore sans se voir l'un l'autre.
  const [webhookUrl, setWebhookUrl] = useState('');
  const [websiteConfig, setWebsiteConfig] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  // Fiche établissement (Configuration > Général) — même source que les documents imprimés
  // (RH, factures), utilisée ici pour construire le bloc "En bref" (voir buildFactBlock).
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);

  const availableImages = [
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
  ];
  
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setSavedArticles(articles);
    });

    const loadConfig = async () => {
      try {
        const wpDocRef = doc(db, "settings", "website");
        const wpDocSnap = await getDoc(wpDocRef);
        if (wpDocSnap.exists()) {
          const data = wpDocSnap.data();
          setWebsiteConfig(data);
          if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
        } else {
          // Fallback to old webhook config if website config doesn't exist yet
          const docRef = doc(db, "settings", "webhook");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().url) {
            setWebhookUrl(docSnap.data().url);
          }
        }
      } catch (e) {
        console.error("Failed to load configs", e);
      }
    };
    loadConfig();

    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) setCompanyInfo((prev) => mergeCompanyInfo(prev, snap.data()));
    });

    return () => {
      unsubscribe();
      unsubGeneral();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setter(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast("Veuillez entrer un sujet pour l'article.");
      return;
    }

    setIsGenerating(true);
    setActiveArticle(null);
    showToast("Génération de l'article en cours avec Vertex AI...");

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = 'Erreur lors de la génération';
        if (errData.error === "API key not found") errMsg = "La clé d'API Gemini est manquante. Vérifiez les paramètres.";
        else if (errData.error && errData.error.includes("401")) errMsg = "La clé d'API Gemini utilisée semble invalide.";
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Le corps reste tel que rédigé par l'IA (voir api/generate-blog.js) ; le bloc "En bref" est
      // ajouté ici, déterministe, pour ne jamais dépendre du modèle pour des faits qui doivent
      // rester exacts (voir buildFactBlock plus haut).
      const fullContent = `${data.article}${buildFactBlock(companyInfo)}`;

      let finalImageUrl = imageUrl;
      if (!finalImageUrl) {
        finalImageUrl = availableImages[Math.floor(Math.random() * availableImages.length)];
      }

      // Auto-save to Firestore
      const docRef = await addDoc(collection(db, 'blog_posts'), {
        topic,
        keywords,
        content: fullContent,
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp()
      });

      setActiveArticle({
        id: docRef.id,
        topic,
        keywords,
        content: fullContent,
        imageUrl: finalImageUrl
      });

      showToast('Article généré et sauvegardé avec succès !');

      // Publication automatique si WordPress ou un Webhook est configuré — réutilise handlePublish
      // (WordPress en priorité, Webhook en secours) pour ne pas dupliquer la logique de publication.
      if (websiteConfig?.url || webhookUrl) {
        handlePublish({
          id: docRef.id,
          topic,
          keywords,
          content: fullContent,
          imageUrl: finalImageUrl
        });
      }

    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erreur lors de la génération de l'article.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Article copié dans le presse-papiers');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async (article: any) => {
    if (!websiteConfig?.url && !webhookUrl) {
      showToast("Veuillez configurer WordPress ou le Webhook dans les paramètres", "error");
      return;
    }
    setIsPublishing(article.id);
    try {
      let publishedSuccessfully = false;
      let method = '';
      let wpPostId: number | null = null;
      let wpLink: string | null = null;

      // Try WordPress REST API first if credentials exist
      if (websiteConfig?.url && websiteConfig?.username && websiteConfig?.password) {
        method = 'WordPress';
        const cleanUrl = websiteConfig.url.replace(/\/$/, '');
        const authHeader = "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password.replace(/\s+/g, '')}`);

        // Le corps généré commence par un titre H1 Markdown ("# ..." — voir le prompt dans
        // api/generate-blog.js) : c'est lui, pas `article.topic` (le sujet tel que tapé dans le
        // formulaire), qui doit devenir le titre WordPress — sinon soit le titre WordPress reste
        // le sujet brut, soit (si topic contient déjà un titre) le "#" apparaît tel quel dans le
        // titre publié et le titre se retrouve dupliqué en tête du corps de l'article.
        const { title: wpTitle, body: wpBody } = extractTitle(article.content || '', article.topic);

        // Vraie conversion Markdown → HTML (l'ancienne version regex ne gérait ni les listes ni
        // les formats imbriqués) — WordPress exige du HTML dans `content`, pas du Markdown brut.
        const htmlContent = String(marked.parse(wpBody));

        // Image mise en avant : upload en médiathèque WordPress en tentative isolée — un échec
        // ici ne doit pas empêcher la publication de l'article (mieux vaut un article sans photo
        // que pas d'article du tout).
        let featuredMediaId: number | null = null;
        const imageData = await resolveImageForUpload(article.imageUrl);
        if (imageData) {
          try {
            const mediaResponse = await fetch(`/api/publish-content`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "wordpress-media",
                url: `${cleanUrl}/wp-json/wp/v2/media`,
                headers: { Authorization: authHeader },
                payload: imageData
              })
            });
            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              featuredMediaId = mediaResult?.details?.id ?? null;
            } else {
              console.warn('Featured image upload failed, publishing without it');
            }
          } catch (e) {
            console.warn('Featured image upload failed, publishing without it', e);
          }
        }

        // Un article déjà publié une première fois porte l'id du post WordPress créé (voir plus
        // bas) — le republier met à jour ce même post au lieu d'en créer un doublon sur le site.
        const postsEndpoint = `${cleanUrl}/wp-json/wp/v2/posts`;
        const wpResponse = await fetch(`/api/publish-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "wordpress",
            url: article.wpPostId ? `${postsEndpoint}/${article.wpPostId}` : postsEndpoint,
            headers: {
              "Authorization": authHeader
            },
            payload: {
              title: wpTitle,
              content: htmlContent,
              excerpt: buildExcerpt(wpBody),
              status: 'publish',
              ...(featuredMediaId ? { featured_media: featuredMediaId } : {})
            }
          })
        });

        if (wpResponse.ok) {
          publishedSuccessfully = true;
          const result = await wpResponse.json().catch(() => null);
          wpPostId = result?.details?.id ?? article.wpPostId ?? null;
          wpLink = result?.details?.link ?? null;
        } else {
          const err = await wpResponse.json();
          let msg = "Erreur de publication";
          if (err.details) {
            if (typeof err.details === 'string') msg = err.details;
            else if (err.details.message) msg = err.details.message;
            else msg = JSON.stringify(err.details);
          }
          
          if (msg.includes("not allowed to create posts") || wpResponse.status === 401) {
             throw new Error("Authentification refusée (401) : 1. Vérifiez que l'identifiant (Nom d'utilisateur) et le 'Mot de passe d'application' sont corrects. 2. IMPORTANT : Certains hébergeurs bloquent l'authentification API. Vous devrez peut-être ajouter une règle dans votre fichier .htaccess (SetEnvIf Authorization \"(.*)\" HTTP_AUTHORIZATION=$1).");
          }
          
          throw new Error(msg);
        }
      } 
      // Fallback to webhook
      else if (webhookUrl) {
        method = 'Webhook';
        const { title: webhookTitle, body: webhookBody } = extractTitle(article.content || '', article.topic);
        const response = await fetch(`/api/publish-content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "webhook",
            url: webhookUrl,
            payload: {
              id: article.id,
              topic: article.topic,
              title: webhookTitle,
              keywords: article.keywords,
              content: webhookBody,
              excerpt: buildExcerpt(webhookBody),
              imageUrl: article.imageUrl
            }
          })
        });
        if (response.ok) {
          publishedSuccessfully = true;
        } else {
          throw new Error("Webhook returned error via proxy");
        }
      }

      if (publishedSuccessfully) {
        showToast(`Article publié avec succès via ${method} !`);
        const updates: Record<string, any> = { published: true, publishedAt: serverTimestamp() };
        if (wpPostId) updates.wpPostId = wpPostId;
        if (wpLink) updates.wpLink = wpLink;
        await updateDoc(doc(db, 'blog_posts', article.id), updates);
        if (activeArticle && activeArticle.id === article.id) {
          setActiveArticle((prev: any) => prev ? { ...prev, published: true, ...(wpPostId ? { wpPostId } : {}), ...(wpLink ? { wpLink } : {}) } : prev);
        }
      }
    } catch (error: any) {
      console.error("Publish error:", error);
      showToast(`Erreur de publication: ${error.message || error}`, "error");
    } finally {
      setIsPublishing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await deleteDoc(doc(db, 'blog_posts', id));
        showToast("Article supprimé.");
      } catch (e) {
        console.error(e);
        showToast("Erreur lors de la suppression.");
      }
    }
  };

  // Ajoute le bloc "En bref" (voir buildFactBlock) à un article déjà sauvegardé mais généré avant
  // l'ajout de cette fonctionnalité — complète le texte existant sans le régénérer (le corps
  // rédigé par l'IA n'est jamais touché). Republier ensuite l'article met à jour la page WordPress
  // avec le bloc inclus.
  const handleAddFactBlock = async (article: any) => {
    if ((article.content || '').includes('### En bref')) {
      showToast('Ce bloc est déjà présent sur cet article.');
      return;
    }
    try {
      const newContent = `${article.content || ''}${buildFactBlock(companyInfo)}`;
      await updateDoc(doc(db, 'blog_posts', article.id), { content: newContent });
      if (activeArticle && activeArticle.id === article.id) {
        setActiveArticle((prev: any) => prev ? { ...prev, content: newContent } : prev);
      }
      showToast('Bloc "En bref" ajouté — republiez l\'article pour mettre à jour le site.');
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de l'ajout du bloc", 'error');
    }
  };

  const handleEditClick = (article: any) => {
    setEditingArticleId(article.id);
    setEditTopic(article.topic || '');
    setEditContent(article.content);
    setEditImageUrl(article.imageUrl || '');
  };

  const handleSaveEdit = async () => {
    if (!editingArticleId) return;
    try {
      await updateDoc(doc(db, 'blog_posts', editingArticleId), {
        topic: editTopic,
        content: editContent,
        imageUrl: editImageUrl
      });
      showToast("Article mis à jour avec succès.");
      setEditingArticleId(null);
      
      // If we are currently previewing this article, update the preview as well
      if (activeArticle && activeArticle.id === editingArticleId) {
        // Just a simple check, or we can just always update it if the user was reading it
        setActiveArticle({ ...activeArticle, content: editContent, topic: editTopic, imageUrl: editImageUrl });
      }
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la mise à jour.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F4C75B]/10 text-[#F4C75B] rounded-xl">
              <PenTool size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#1A1A1A]">Rédaction et SEO</h2>
              <p className="text-gray-500 mt-1">Générez des articles de blog optimisés et poétiques pour Mouda Palace</p>
            </div>
          </div>
          <button
            onClick={() => { sessionStorage.setItem('open-settings-website', 'true'); setActiveTab?.('config'); }}
            className="p-2 text-gray-400 hover:text-[#F4C75B] hover:bg-[#F4C75B]/10 rounded-lg transition-colors flex items-center gap-2"
            title="WordPress et Webhook se configurent dans Paramètres > Site Web"
          >
            <Settings size={20} />
            <span className="text-sm font-medium hidden md:inline">Publication</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Articles Publiés</p>
              <h3 className="text-2xl font-bold text-gray-900">{savedArticles.length}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <MousePointerClick size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Taux de Clics (CTR) Moyen</p>
              <h3 className="text-2xl font-bold text-gray-900">4.2%</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Mots-clés dans le Top 10</p>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet de l'article *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Les secrets du zellige fassi et l'architecture du Mouda Palace..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all resize-none h-32"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés ou instructions additionnelles (Optionnel)
              </label>
              <textarea
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: Parler du tajine aux pruneaux, mentionner la terrasse panoramique..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture (Optionnel)
              </label>
              <div className="space-y-3">
                  <select
                    value={availableImages.includes(imageUrl) ? imageUrl : (imageUrl !== '' && !imageUrl.startsWith('data:') ? 'custom' : (imageUrl.startsWith('data:') ? 'upload' : ''))}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setImageUrl('https://');
                      } else if (e.target.value !== 'upload') {
                        setImageUrl(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Image aléatoire</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                    <option value="custom">Autre (URL personnalisée)</option>
                    {imageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                  </select>
                  
                  <label className="cursor-pointer w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-sm">
                      <Upload size={20} />
                      Télécharger une image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setImageUrl)} />
                  </label>
                
                {!availableImages.includes(imageUrl) && imageUrl !== '' && !imageUrl.startsWith('data:') ? (
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image (ex: https://...)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                  />
                ) : null}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-3.5 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#1A1A1A] hover:bg-[#2a2a2a] shadow-[#1A1A1A]/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Rédaction en cours...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-[#F4C75B]" />
                  Générer l'article
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 h-full min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <FileText size={18} className="text-[#F4C75B]" />
                  Aperçu de la rédaction
                </div>
                {activeArticle && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(activeArticle.content)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                    {activeArticle.published ? (
                      <button
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white transition-colors"
                        disabled
                      >
                        <Check size={16} />
                        Publié
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(activeArticle)}
                        disabled={isPublishing === activeArticle.id}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[#1A1A1A] hover:bg-[#2a2a2a] text-white transition-colors"
                      >
                        {isPublishing === activeArticle.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Publier sur le blog
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto prose prose-amber max-w-none">
                {activeArticle ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{activeArticle.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <PenTool size={48} className="mb-4 opacity-20" />
                    <p>L'article généré s'affichera ici et sera sauvegardé automatiquement.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des articles générés */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#1A1A1A]">Répertoire des articles</h2>
            <p className="text-gray-500 mt-1">Historique des articles générés automatiquement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedArticles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun article sauvegardé pour le moment.</p>
            </div>
          ) : (
            savedArticles.map((article) => (
              <div key={article.id} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                {article.imageUrl && (
                  <div className="w-full h-48 bg-gray-100 relative">
                    <img src={article.imageUrl} alt={article.topic} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-serif font-medium text-gray-900 line-clamp-2">
                      {article.topic}
                    </h3>
                    <div className="flex gap-2">
                      {article.published ? (
                        <div className="text-green-500 p-1" title="Publié">
                          <Check size={16} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => handlePublish(article)}
                          disabled={isPublishing === article.id}
                          className="text-gray-400 hover:text-green-500 disabled:opacity-50 transition-colors p-1"
                          title="Publier via Webhook"
                        >
                          {isPublishing === article.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      )}
                      {!(article.content || '').includes('### En bref') && (
                        <button
                          onClick={() => handleAddFactBlock(article)}
                          className="text-gray-400 hover:text-[#265C6D] transition-colors p-1"
                          title="Ajouter le bloc « En bref » (adresse, horaires, contact...) en fin d'article — pour les articles générés avant l'ajout de cette fonctionnalité"
                        >
                          <Sparkles size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditClick(article)}
                        className="text-gray-400 hover:text-[#F4C75B] transition-colors p-1"
                        title="Éditer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {article.keywords && (
                    <div className="mb-4 text-xs font-medium text-[#F4C75B] bg-[#F4C75B]/10 px-2 py-1 rounded-md inline-block w-fit line-clamp-1">
                      {article.keywords}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3">
                    {article.content?.substring(0, 150)}...
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {article.createdAt?.toDate ? new Date(article.createdAt.toDate()).toLocaleDateString() : 'Récemment'}
                    </span>
                    <button 
                      onClick={() => {
                        setActiveArticle(article);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1 text-sm font-medium text-[#1A1A1A] hover:text-[#F4C75B] transition-colors"
                    >
                      Lire <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editingArticleId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#1A1A1A]">Éditer l'article</h2>
              <button 
                onClick={() => setEditingArticleId(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de l'article
                </label>
                <input
                  type="text"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <div className="space-y-3">
                  <select
                    value={availableImages.includes(editImageUrl) ? editImageUrl : (editImageUrl !== '' && !editImageUrl.startsWith('data:') ? 'custom' : (editImageUrl.startsWith('data:') ? 'upload' : ''))}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setEditImageUrl('https://');
                      } else if (e.target.value !== 'upload') {
                        setEditImageUrl(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Image aléatoire</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                    <option value="custom">Autre (URL personnalisée)</option>
                    {editImageUrl.startsWith('data:') && <option value="upload">Image téléchargée</option>}
                  </select>
                  
                  <label className="cursor-pointer w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium shadow-sm">
                      <Upload size={20} />
                      Télécharger une image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setEditImageUrl)} />
                  </label>
                  
                  {!availableImages.includes(editImageUrl) && editImageUrl !== '' && !editImageUrl.startsWith('data:') ? (
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="URL de l'image (ex: https://...)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all"
                    />
                  ) : null}
                </div>
                {editImageUrl && (
                  <div className="mt-4 h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={editImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu de l'article (Markdown)
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent outline-none transition-all resize-none h-96 font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setEditingArticleId(null)}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-[#1A1A1A] hover:bg-[#2a2a2a] shadow-lg shadow-[#1A1A1A]/20 flex items-center gap-2 transition-all"
              >
                <Save size={18} />
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>, document.body
      )}
    </motion.div>
  );
}
