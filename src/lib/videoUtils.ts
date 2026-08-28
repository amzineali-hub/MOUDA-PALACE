// Convertit un lien YouTube "watch"/"youtu.be" en URL embarquable (iframe) ; renvoie null pour
// les autres liens (mp4 direct...), à afficher alors dans une balise <video> classique.
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;
  const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return null;
}
