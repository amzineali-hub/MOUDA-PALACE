import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SeoAnalytics from './SeoAnalytics';

export default function SeoAnalyticsContainer() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(docs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-serif text-[#1A1A1A] mb-2">Analytics SEO</h2>
        <p className="text-gray-500 mb-8">Suivez les performances de votre contenu et l'évolution de votre référencement.</p>
        <SeoAnalytics articles={articles} />
      </div>
    </div>
  );
}
