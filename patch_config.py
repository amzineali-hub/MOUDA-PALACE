import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the Configuration start
config_start_old = """function Configuration() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const { showToast } = useToast();

  const handleSave = () => {
    showToast("Paramètres sauvegardés avec succès");
  };"""

config_start_new = """function Configuration() {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [websiteConfig, setWebsiteConfig] = useState({
    url: 'https://moudapalace.com',
    username: '',
    password: '',
    webhookUrl: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    const loadWebsiteConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'website');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWebsiteConfig(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration du site web:", error);
      }
    };
    loadWebsiteConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeSettingsTab === 'website') {
        const docRef = doc(db, 'settings', 'website');
        await setDoc(docRef, websiteConfig, { merge: true });
        
        // Also update webhook for backward compatibility with BlogWriter
        const webhookRef = doc(db, 'settings', 'webhook');
        await setDoc(webhookRef, { url: websiteConfig.webhookUrl }, { merge: true });
      }
      showToast("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur de sauvegarde:", error);
      showToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setIsSaving(false);
    }
  };"""

content = content.replace(config_start_old, config_start_new)

# Replace the save button to use isSaving
save_btn_old = """<button onClick={handleSave} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors">
          <Save size={18} />
          Sauvegarder
        </button>"""
save_btn_new = """<button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
          <Save size={18} />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </button>"""
content = content.replace(save_btn_old, save_btn_new)

# Add the website tab to the sidebar
sidebar_old = """<SettingsTab active={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} icon={<Building size={18} />} label="Général" />
          <SettingsTab active={activeSettingsTab === 'integrations'} onClick={() => setActiveSettingsTab('integrations')} icon={<Globe size={18} />} label="Intégrations & IA" />"""
sidebar_new = """<SettingsTab active={activeSettingsTab === 'general'} onClick={() => setActiveSettingsTab('general')} icon={<Building size={18} />} label="Général" />
          <SettingsTab active={activeSettingsTab === 'integrations'} onClick={() => setActiveSettingsTab('integrations')} icon={<Globe size={18} />} label="Intégrations & IA" />
          <SettingsTab active={activeSettingsTab === 'website'} onClick={() => setActiveSettingsTab('website')} icon={<Globe size={18} />} label="Site Web (moudapalace.com)" />"""
content = content.replace(sidebar_old, sidebar_new)

# Add the website tab content
integrations_content_end_old = """<input type="text" placeholder="Collez votre jeton d'accès WhatsApp ici..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white" />
                </div>
              </div>
            </motion.div>
          )}"""

website_content = """<input type="text" placeholder="Collez votre jeton d'accès WhatsApp ici..." className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors bg-white" />
                </div>
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'website' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-serif font-medium border-b border-gray-100 pb-4 text-[#1A1A1A]">Configuration du site web</h3>
              <p className="text-sm text-gray-500 mb-6">Paramétrez les accès à votre site WordPress (moudapalace.com) et les webhooks d'automatisation (Make.com, Zapier).</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL du site</label>
                  <input 
                    type="url" 
                    value={websiteConfig.url} 
                    onChange={e => setWebsiteConfig({...websiteConfig, url: e.target.value})} 
                    placeholder="https://moudapalace.com" 
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant administrateur</label>
                    <input 
                      type="text" 
                      value={websiteConfig.username} 
                      onChange={e => setWebsiteConfig({...websiteConfig, username: e.target.value})} 
                      placeholder="admin" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe d'application</label>
                    <input 
                      type="password" 
                      value={websiteConfig.password} 
                      onChange={e => setWebsiteConfig({...websiteConfig, password: e.target.value})} 
                      placeholder="xxxx xxxx xxxx xxxx" 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Générez ce mot de passe dans votre profil WordPress.</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Automatisation (Webhook)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL du Webhook de publication (Make.com)</label>
                    <input 
                      type="url" 
                      value={websiteConfig.webhookUrl} 
                      onChange={e => setWebsiteConfig({...websiteConfig, webhookUrl: e.target.value})} 
                      placeholder="https://hook.eu1.make.com/..." 
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDA956] focus:ring-1 focus:ring-[#DDA956] transition-colors" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Cette URL est utilisée par le module de rédaction IA pour publier directement sur votre site.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}"""
content = content.replace(integrations_content_end_old, website_content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

