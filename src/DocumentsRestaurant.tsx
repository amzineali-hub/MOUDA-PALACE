import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { FileText, File, Upload, Trash2, Download, FileSpreadsheet, FileIcon, Loader2, Search, Eye, X } from 'lucide-react';

interface RestaurantDoc {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: any;
  storagePath: string;
}

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
            className="flex items-center gap-2 bg-[#DDA956] text-white px-5 py-2.5 rounded-lg hover:bg-[#C5964A] transition-colors font-medium shadow-sm disabled:opacity-70"
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
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DDA956] focus:border-transparent text-sm"
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
              className="text-[#DDA956] hover:text-[#C5964A] font-medium"
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setPreviewDoc(doc)}
                          className="p-2 text-gray-500 hover:text-[#DDA956] hover:bg-[#DDA956]/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {getFileIcon(previewDoc.type, previewDoc.name)}
                <h3 className="font-medium text-gray-900 truncate max-w-xl" title={previewDoc.name}>{previewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={previewDoc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  download
                >
                  <Download size={16} />
                  Télécharger
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 overflow-hidden relative">
              {previewDoc.type.includes('pdf') || previewDoc.name.endsWith('.pdf') ? (
                <iframe 
                  src={`${previewDoc.url}#toolbar=0`} 
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              ) : previewDoc.type.includes('image') || previewDoc.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={previewDoc.url} 
                    alt={previewDoc.name} 
                    className="max-w-full max-h-full object-contain rounded shadow-sm"
                  />
                </div>
              ) : previewDoc.name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i) ? (
                <iframe 
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDoc.url)}`} 
                  className="w-full h-full border-0"
                  title="Office Document Preview"
                />
              ) : (
                <iframe 
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.url)}&embedded=true`} 
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
