import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PenTool, Sparkles, Loader2, Copy, Check, FileText, Clock, Trash2, ArrowRight } from 'lucide-react';
import { useToast } from './context/ToastContext';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export default function BlogWriterAI() {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
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

    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast("Veuillez entrer un sujet pour l'article.");
      return;
    }

    setIsGenerating(true);
    setGeneratedArticle('');
    showToast("Génération de l'article en cours avec Vertex AI...");

    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setGeneratedArticle(data.article);
      
      // Auto-save to Firestore
      await addDoc(collection(db, 'blog_posts'), {
        topic,
        keywords,
        content: data.article,
        createdAt: serverTimestamp()
      });

      showToast('Article généré et sauvegardé avec succès !');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#DDA956]/10 text-[#DDA956] rounded-xl">
            <PenTool size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-[#1A1A1A]">Rédaction Blog Automatique</h2>
            <p className="text-gray-500 mt-1">Générez des articles de blog immersifs et poétiques pour Mouda Palace</p>
          </div>
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
                {generatedArticle && (
                  <button
                    onClick={() => copyToClipboard(generatedArticle)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                )}
              </div>
              
              <div className="p-8 flex-1 overflow-y-auto prose prose-amber max-w-none">
                {generatedArticle ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{generatedArticle}</ReactMarkdown>
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
              <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-medium text-gray-900 line-clamp-2">
                    {article.topic}
                  </h3>
                  <button 
                    onClick={() => handleDelete(article.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
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
                      setGeneratedArticle(article.content);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-sm font-medium text-[#1A1A1A] hover:text-[#DDA956] transition-colors"
                  >
                    Lire <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
