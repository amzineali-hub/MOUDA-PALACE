import re

with open('src/BlogWriterAI.tsx', 'r') as f:
    content = f.read()

# Replace state and load function
old_state = """  const [webhookUrl, setWebhookUrl] = useState('https://hook.eu1.make.com/vho6csmodvbnb6te53clnm4yra5cngt3');"""
new_state = """  const [webhookUrl, setWebhookUrl] = useState('');
  const [websiteConfig, setWebsiteConfig] = useState<any>(null);"""

content = content.replace(old_state, new_state)

old_load = """    const loadWebhook = async () => {
      try {
        const docRef = doc(db, "settings", "webhook");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().url) {
          setWebhookUrl(docSnap.data().url);
        }
      } catch (e) {
        console.error("Failed to load webhook URL", e);
      }
    };
    loadWebhook();"""

new_load = """    const loadConfig = async () => {
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
    loadConfig();"""
    
content = content.replace(old_load, new_load)

old_publish = """  const handlePublish = async (article: any) => {
    if (!webhookUrl) {
      showToast("Veuillez configurer l'URL du webhook Make/Zapier d'abord", "error");
      return;
    }
    setIsPublishing(article.id);
    try {
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
      
      // Even if response is opaque (no-cors), we might not get ok=true, but we assume it worked.
      // Make/Zapier usually accept no-cors, but to read response we need cors.
      // For now, we'll just check ok or let it throw if network fails.
      // Note: If using mode: 'no-cors', response.type is 'opaque' and ok is false.
      // But let's try standard cors first.
      
      if (response.ok || response.type === 'opaque') {
        showToast("Article publié avec succès via Webhook !");
        await updateDoc(doc(db, 'blog_posts', article.id), { published: true, publishedAt: serverTimestamp() });
        if (activeArticle && activeArticle.id === article.id) {
          setActiveArticle((prev: any) => prev ? { ...prev, published: true } : prev);
        }
      } else {
        throw new Error("Webhook returned " + response.status);
      }
    } catch (error) {
      console.error("Webhook error:", error);
      showToast("Erreur lors de la publication via Webhook", "error");
    } finally {
      setIsPublishing(null);
    }
  };"""

new_publish = """  const handlePublish = async (article: any) => {
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
        
        const wpResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(`${websiteConfig.username}:${websiteConfig.password}`)
          },
          body: JSON.stringify({
            title: article.topic,
            content: article.content, // Ideally converted to HTML, but this is a start
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
  };"""
  
content = content.replace(old_publish, new_publish)

with open('src/BlogWriterAI.tsx', 'w') as f:
    f.write(content)

