import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { PenTool, Sparkles, Loader2, Copy, Check, FileText, Clock, Trash2, ArrowRight, Edit2, X, Save, Settings, Send } from 'lucide-react';
import { useToast } from './context/ToastContext';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function BlogWriterAI() {
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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [websiteConfig, setWebsiteConfig] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const availableImages = [
    "/8c978763-67b7-4533-b682-dad543615044_3-hours-cultural-walk-in-fez-medina-medium.jpg",
    "/Capture-decran-2024-10-06-150159.png",
    "/Capture-decran-2025-07-17-144912.png",
    "/d0.jpg",
    "/DSC_0290-scaled.jpg",
    "/fes-spring.jpg",
    "/IMG_4253-2048x1365.jpg"
  ];
  
  const { showToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedArticles(articles);
    });

    const loadConfig = async () => {
      try {
        const wpDocRef = doc(db, "settings", "website");
        const wpDocSnap = await getDoc(wpDocRef);
        if (wpDocSnap.exists()) {
          setWebsiteConfig(wpDocSnap.data());
          if (wpDocSnap.data().webhookUrl) {
            setWebhookUrl(wpDocSnap.data().webhookUrl);
          }
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


    return () => unsubscribe();
  }, []);

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

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      
      let finalImageUrl = imageUrl;
      if (!finalImageUrl) {
        finalImageUrl = availableImages[Math.floor(Math.random() * availableImages.length)];
      }

      // Auto-save to Firestore
      const docRef = await addDoc(collection(db, 'blog_posts'), {
        topic,
        keywords,
        content: data.article,
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp()
      });

      setActiveArticle({
        id: docRef.id,
        topic,
        keywords,
        content: data.article,
        imageUrl: finalImageUrl
      });

      showToast('Article généré et sauvegardé avec succès !');

      // Auto-publish via Webhook if configured
      if (webhookUrl) {
        try {
          fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: docRef.id,
              topic,
              keywords,
              content: data.article,
              imageUrl: finalImageUrl
            })
          }).then(response => {
            if (response.ok || response.type === 'opaque') {
              showToast("Article automatiquement publié via Webhook !");
              updateDoc(doc(db, 'blog_posts', docRef.id), { published: true, publishedAt: serverTimestamp() });
              setActiveArticle((prev: any) => prev ? { ...prev, published: true } : prev);
            }
          }).catch(err => console.error("Auto-publish webhook failed:", err));
        } catch (e) {
          console.error("Auto-publish dispatch failed", e);
        }
      }
      
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la génération de l'article.");
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

  const handleSaveWebhook = async () => {
    try {
      await setDoc(doc(db, "settings", "webhook"), { url: webhookUrl });
      showToast("URL Webhook sauvegardée");
      setIsSettingsOpen(false);
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la sauvegarde du webhook");
    }
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
      
      // Try WordPress REST API first if credentials exist
      if (websiteConfig?.url && websiteConfig?.username && websiteConfig?.password) {
        method = 'WordPress';
        const cleanUrl = websiteConfig.url.replace(/\/$/, '');
        
        // Use html-to-markdown or just send markdown (WordPress generally needs HTML, but we'll send it as is for now or use a simple converter if needed, though markdown works if they have a plugin. Actually, let's just send the content)
        // Wait, WordPress REST API expects HTML in the 'content' field. But our 'content' is markdown.
        // We'll send it anyway, WordPress block editor sometimes parses markdown or we can convert it. 
        // For standard publishing, let's just send what we have.
        
        
        // Simple Markdown to HTML formatting for WordPress
        let htmlContent = article.content
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/gim, '<em>$1</em>')
          .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
          .replace(/\n\n/gim, '<br><br>')
          .replace(/\n/gim, '<br>');

        const wpResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password}`)
          },
          body: JSON.stringify({
            title: article.topic,
            content: htmlContent, 
            status: 'publish'
          })
        });
        
        if (wpResponse.ok) {
          publishedSuccessfully = true;
        } else {
          const err = await wpResponse.json();
          throw new Error(err.message || "Erreur WordPress API");
        }
      } 
      // Fallback to webhook
      else if (webhookUrl) {
        method = 'Webhook';
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: article.id,
            topic: article.topic,
            keywords: article.keywords,
            content: article.content,
            imageUrl: article.imageUrl
          })
        });
        if (response.ok || response.type === 'opaque') {
          publishedSuccessfully = true;
        } else {
          throw new Error("Webhook returned " + response.status);
        }
      }

      if (publishedSuccessfully) {
        showToast(`Article publié avec succès via ${method} !`);
        await updateDoc(doc(db, 'blog_posts', article.id), { published: true, publishedAt: serverTimestamp() });
        if (activeArticle && activeArticle.id === article.id) {
          setActiveArticle((prev: any) => prev ? { ...prev, published: true } : prev);
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
            <div className="p-3 bg-[#DDA956]/10 text-[#DDA956] rounded-xl">
              <PenTool size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#1A1A1A]">Rédaction Blog Automatique</h2>
              <p className="text-gray-500 mt-1">Générez des articles de blog immersifs et poétiques pour Mouda Palace</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-[#DDA956] hover:bg-[#DDA956]/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <Settings size={20} />
            <span className="text-sm font-medium hidden md:inline">Webhook</span>
          </button>
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all resize-none h-32"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de couverture (Optionnel)
              </label>
              <div className="space-y-3">
                <select
                  value={availableImages.includes(imageUrl) ? imageUrl : (imageUrl !== '' ? 'custom' : '')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setImageUrl('https://');
                    } else {
                      setImageUrl(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Image aléatoire</option>
                  {availableImages.map(img => (
                    <option key={img} value={img}>{img.split('/').pop()}</option>
                  ))}
                  <option value="custom">Autre (URL personnalisée)</option>
                </select>
                
                {!availableImages.includes(imageUrl) && imageUrl !== '' ? (
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image (ex: https://...)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
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
                  <Sparkles size={18} className="text-[#DDA956]" />
                  Générer l'article
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 h-full min-h-[500px] flex flex-col relative overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <FileText size={18} className="text-[#DDA956]" />
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
                      <button 
                        onClick={() => handleEditClick(article)}
                        className="text-gray-400 hover:text-[#DDA956] transition-colors p-1"
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
                    <div className="mb-4 text-xs font-medium text-[#DDA956] bg-[#DDA956]/10 px-2 py-1 rounded-md inline-block w-fit line-clamp-1">
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
                      className="flex items-center gap-1 text-sm font-medium text-[#1A1A1A] hover:text-[#DDA956] transition-colors"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <div className="space-y-3">
                  <select
                    value={availableImages.includes(editImageUrl) ? editImageUrl : (editImageUrl !== '' ? 'custom' : '')}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setEditImageUrl('https://');
                      } else {
                        setEditImageUrl(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Image aléatoire</option>
                    {availableImages.map(img => (
                      <option key={img} value={img}>{img.split('/').pop()}</option>
                    ))}
                    <option value="custom">Autre (URL personnalisée)</option>
                  </select>
                  
                  {!availableImages.includes(editImageUrl) && editImageUrl !== '' ? (
                    <input
                      type="text"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="URL de l'image (ex: https://...)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all resize-none h-96 font-mono text-sm"
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

      {/* Modal Webhook */}
      {isSettingsOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-serif text-[#1A1A1A] flex items-center gap-2"><Settings size={20} className="text-[#DDA956]" /> Webhook Config</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Configurez l'URL du webhook Make ou Zapier pour automatiser la publication des articles sur votre blog.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL du Webhook</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hook.eu1.make.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#DDA956] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsSettingsOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveWebhook} className="px-6 py-2.5 rounded-xl font-medium text-white bg-[#1A1A1A] hover:bg-[#2a2a2a] shadow-lg shadow-[#1A1A1A]/20 flex items-center gap-2 transition-all">
                <Save size={18} /> Enregistrer
              </button>
            </div>
          </motion.div>
        </div>, document.body
      )}
    </motion.div>
  );
}
