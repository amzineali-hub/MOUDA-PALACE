import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { FileText, File, Upload, Trash2, Download, FileSpreadsheet, FileIcon, Loader2, Search, Eye, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface RestaurantDoc {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
  storagePath: string;
}

const getFileIcon = (type: string, name: string) => {
  if (type.includes('pdf') || name.endsWith('.pdf')) return <FileText className="text-red-500" size={24} />;
  if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return <File className="text-blue-500" size={24} />;
  if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return <FileSpreadsheet className="text-green-500" size={24} />;
  return <FileIcon className="text-gray-500" size={24} />;
};

const DocumentPreview = ({ docData, onClose }: { docData: RestaurantDoc, onClose: () => void }) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        let arrayBuffer: ArrayBuffer;
        
        try {
          // Use proxy to avoid CORS issues from Firebase Storage (works on Express and Vercel)
          const proxyUrl = `/api/proxy-document?url=${encodeURIComponent(docData.url)}`;
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error('Failed to load document via proxy');
          }
          arrayBuffer = await response.arrayBuffer();
        } catch (proxyError) {
          console.warn("Proxy failed, trying direct fetch...", proxyError);
          // Fallback to direct fetch in case proxy is unavailable but CORS is allowed
          const directResponse = await fetch(docData.url);
          if (!directResponse.ok) {
            throw new Error('Failed to load document directly');
          }
          arrayBuffer = await directResponse.arrayBuffer();
        }

        if (docData.type.includes('excel') || docData.type.includes('spreadsheet') || docData.name.match(/\.(xls|xlsx)$/i)) {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const html = XLSX.utils.sheet_to_html(worksheet, { id: 'excel-table' });
          
          // Basic styling for the excel HTML
          const styledHtml = html
            .replace(/<table/g, '<table class="w-full text-left text-sm border-collapse bg-white shadow-sm rounded-lg overflow-hidden"')
            .replace(/<td/g, '<td class="border border-gray-200 px-4 py-2 text-gray-700"')
            .replace(/<th/g, '<th class="border border-gray-200 px-4 py-3 bg-gray-50 font-medium text-gray-900"');
          
          setHtmlContent(styledHtml);
        } else if (docData.type.includes('word') || docData.name.match(/\.(doc|docx)$/i)) {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          // Basic styling for Word docs
          const styledHtml = `<div class="prose max-w-none p-8 bg-white shadow-sm rounded-lg">${result.value}</div>`;
          setHtmlContent(styledHtml);
        } else {
          setError("Format non supporté pour la prévisualisation native.");
        }
      } catch (err) {
        console.error("Preview error:", err);
        setError("Impossible de prévisualiser ce fichier. Il peut être corrompu ou d'un format non pris en charge.");
      } finally {
        setLoading(false);
      }
    };

    if (docData.name.match(/\.(xls|xlsx|doc|docx)$/i)) {
      loadContent();
    } else {
      setLoading(false);
    }
  }, [docData]);

  const renderContent = () => {
    if (docData.type.includes('pdf') || docData.name.endsWith('.pdf')) {
      return (
        <iframe 
          src={`${docData.url}#toolbar=0`} 
          className="w-full h-full border-0"
          title="PDF Preview"
        />
      );
    }
    if (docData.type.includes('image') || docData.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <img 
            src={docData.url} 
            alt={docData.name} 
            className="max-w-full max-h-full object-contain rounded shadow-sm bg-white"
          />
        </div>
      );
    }
    
    // For DOCX / XLSX
    if (loading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#F4C75B]" />
            <p>Génération de l'aperçu du document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileIcon className="text-red-500" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de prévisualisation</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <a 
              href={docData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F4C75B] text-white font-medium rounded-lg hover:bg-[#C5964A] transition-colors"
              download
            >
              <Download size={20} />
              Télécharger le fichier original
            </a>
          </div>
        </div>
      );
    }

    if (htmlContent) {
      return (
        <div className="w-full h-full overflow-auto p-4 md:p-8 bg-gray-100">
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            className="max-w-5xl mx-auto"
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileIcon className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aperçu non disponible</h3>
          <p className="text-gray-500 mb-6">Ce type de fichier ne peut pas être prévisualisé directement dans le navigateur.</p>
          <a 
            href={docData.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F4C75B] text-white font-medium rounded-lg hover:bg-[#C5964A] transition-colors"
            download
          >
            <Download size={20} />
            Télécharger le fichier
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {getFileIcon(docData.type, docData.name)}
            <h3 className="font-medium text-gray-900 truncate max-w-xl" title={docData.name}>{docData.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={docData.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              download
            >
              <Download size={16} />
              Télécharger
            </a>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-50 overflow-hidden relative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default function DocumentsRestaurant() {
  const [documents, setDocuments] = useState<RestaurantDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RestaurantDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'restaurant_documents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RestaurantDoc[];
      setDocuments(docsData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const storagePath = `restaurant_documents/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload error:", error);
        alert("Erreur lors de l'upload du fichier. Vérifiez les permissions Storage.");
        setUploading(false);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'restaurant_documents'), {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
            storagePath: storagePath,
            createdAt: new Date()
          });
        } catch (dbError) {
          console.error("Error saving document metadata:", dbError);
        } finally {
          setUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    );
  };

  const handleDelete = async (docData: RestaurantDoc) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le document "${docData.name}" ?`)) return;

    try {
      if (docData.storagePath) {
        const fileRef = ref(storage, docData.storagePath);
        await deleteObject(fileRef).catch(e => console.warn("Storage deletion error:", e));
      }
      await deleteDoc(doc(db, 'restaurant_documents', docData.id));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Erreur lors de la suppression.");
    }
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.endsWith('.pdf')) return <FileText className="text-red-500" size={24} />;
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return <File className="text-blue-500" size={24} />;
    if (type.includes('excel') || type.includes('spreadsheet') || name.endsWith('.xls') || name.endsWith('.xlsx')) return <FileSpreadsheet className="text-green-500" size={24} />;
    return <FileIcon className="text-gray-500" size={24} />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Documents Restaurant</h1>
          <p className="text-gray-500">Gérez vos fichiers, modèles et documents importants (PDF, Word, Excel).</p>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#F4C75B] text-white px-5 py-2.5 rounded-lg hover:bg-[#C5964A] transition-colors font-medium shadow-sm disabled:opacity-70"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Upload en cours... {Math.round(uploadProgress)}%</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Ajouter un document</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Vos fichiers</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un document..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F4C75B] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun document</h3>
            <p className="text-gray-500 mb-6">Ajoutez des menus, des fiches techniques, ou des contrats.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[#F4C75B] hover:text-[#C5964A] font-medium"
            >
              Importer le premier fichier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 rounded-tl-lg">Nom du fichier</th>
                  <th className="px-6 py-4">Taille</th>
                  <th className="px-6 py-4">Date d'ajout</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                          {getFileIcon(doc.type, doc.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs md:max-w-md" title={doc.name}>
                            {doc.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {doc.createdAt?.toDate ? new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }).format(doc.createdAt.toDate()) : 'Récemment'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="p-2 text-gray-500 hover:text-[#F4C75B] hover:bg-[#F4C75B]/10 rounded-lg transition-colors"
                          title="Aperçu"
                        >
                          <Eye size={18} />
                        </button>
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Télécharger"
                          download
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(doc)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreview docData={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}
