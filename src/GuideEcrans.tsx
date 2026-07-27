import React from 'react';
import { Monitor, Server, Tablet, Smartphone, Search, RefreshCw, Activity, ArrowRight, ShieldCheck } from 'lucide-react';

export default function GuideEcrans() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">Guide et Suivi des Écrans</h1>
        <p className="text-gray-600 text-lg">
          Découvrez comment configurer, utiliser et superviser l'ensemble des écrans (KDS, POS, Tablettes) déployés au sein de l'établissement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Monitor size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Caisse Tactile (POS)</h2>
          <p className="text-gray-500 text-sm">Gestion des commandes, paiements, et clôture de caisse en salle.</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <Server size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Écran Cuisine (KDS)</h2>
          <p className="text-gray-500 text-sm">Affichage en temps réel des bons de commande, gestion des statuts de préparation.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Tablet size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Tablettes Serveurs</h2>
          <p className="text-gray-500 text-sm">Prise de commande mobile, encaissement à table et liaison directe en cuisine.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Activity className="text-[#DDA956]" /> Fonctionnement Général
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Le système repose sur une architecture Cloud en temps réel. Chaque écran est enregistré et possède un rôle défini. 
              Lorsqu'une commande est saisie sur un <strong>POS</strong> ou une <strong>Tablette</strong>, elle est instantanément transmise à l'<strong>Écran Cuisine (KDS)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Synchronisation :</strong> Moins de 200ms de latence entre la prise de commande et l'affichage en cuisine.</li>
              <li><strong>Mode hors-ligne :</strong> En cas de coupure internet, les caisses continuent de fonctionner localement et se synchronisent dès le retour de la connexion.</li>
              <li><strong>Notifications :</strong> Les serveurs sont notifiés sur leur tablette dès que la cuisine marque un plat comme "Prêt".</li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <RefreshCw className="text-[#DDA956]" /> Suivi et Supervision
          </h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Pour assurer une continuité de service optimale, le module de "Gestion des Écrans" permet un suivi en temps réel de votre parc matériel.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
              <div className="flex gap-4">
                <div className="mt-1"><ShieldCheck className="text-green-500" size={24}/></div>
                <div>
                  <h3 className="font-bold text-gray-900">État de connexion (En ligne / Hors ligne)</h3>
                  <p className="text-sm">Vérifiez si l'écran communique avec le serveur central. Les déconnexions sont enregistrées dans le journal système.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1"><Search className="text-blue-500" size={24}/></div>
                <div>
                  <h3 className="font-bold text-gray-900">Diagnostic à distance</h3>
                  <p className="text-sm">Consultez le niveau de batterie (pour les tablettes), la version de l'application et rafraîchissez l'écran à distance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* NOUVEAU MODULE : MODE D'EMPLOI ET CONFIGURATION */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Smartphone className="text-[#DDA956]" /> Mode d'emploi : Connexion et Configuration
          </h2>
          <div className="space-y-6 text-gray-600">
            <p>
              Ce guide détaillé vous explique pas-à-pas comment ajouter un nouvel appareil (tablette, POS ou KDS) à votre établissement, comment lui attribuer un rôle et comment le gérer au quotidien.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Étape 1 : Ajouter un appareil */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">1</span>
                  <h3 className="font-bold text-gray-900 text-lg">Générer un code d'appairage</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Depuis le tableau de bord administrateur :</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Allez dans le module <strong>"Gestion des Écrans"</strong>.</li>
                    <li>Cliquez sur le bouton <strong>"Ajouter un Écran"</strong>.</li>
                    <li>Renseignez le nom (ex: "Caisse Bar"), le type d'appareil, et éventuellement un identifiant unique (ex: "BAR-01").</li>
                    <li>Validez pour générer un <strong>code à 6 chiffres</strong>. Ce code est valable pour une durée limitée.</li>
                  </ol>
                </div>
              </div>

              {/* Étape 2 : Connecter l'appareil */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">2</span>
                  <h3 className="font-bold text-gray-900 text-lg">Connecter l'appareil physique</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Sur la nouvelle tablette ou l'écran POS/KDS vierge :</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Ouvrez l'application (ou simulez-la via <strong>"Simuler Tablette"</strong>).</li>
                    <li>L'écran affichera une mire de connexion demandant un code.</li>
                    <li>Saisissez le <strong>code à 6 chiffres</strong> généré à l'étape précédente.</li>
                    <li>L'appareil est désormais connecté, authentifié, et synchronisé avec le serveur central !</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Étape 3 : Gestion et Assignation */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-bold">3</span>
                <h3 className="font-bold text-gray-900 text-lg">Gérer et Assigner les appareils</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p>Une fois l'appareil connecté, il apparaît dans la liste de la <strong>Gestion des Écrans</strong>. Vous pouvez à tout moment :</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Configurer l'appareil :</strong> Cliquez sur "Configurer" pour modifier son nom, changer son type, ou <strong>l'assigner à un membre spécifique du personnel</strong> (ex: "Assigné à : Youssef"). Cela est particulièrement utile pour suivre qui utilise quelle tablette serveur.
                  </li>
                  <li>
                    <strong>Modifier l'identifiant :</strong> Vous pouvez mettre à jour l'identifiant unique (ex: changer "TERRASSE-1" en "TERRASSE-2").
                  </li>
                  <li>
                    <strong>Déconnecter l'appareil :</strong> Cliquez sur "Déconnecter" (icône corbeille) pour révoquer l'accès de cet appareil. L'appareil physique se reverrouillera automatiquement et demandera un nouveau code d'appairage.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <ArrowRight className="text-[#DDA956]" /> Résolution des Problèmes Courants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-50 text-red-900 border border-red-100">
              <h4 className="font-bold mb-2">L'écran de cuisine ne reçoit pas les bons</h4>
              <p className="text-sm text-red-700">Vérifiez la connexion Wi-Fi de l'écran. Si le voyant réseau est au vert, redémarrez l'application via le bouton "Rafraîchir" du module de gestion.</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 text-orange-900 border border-orange-100">
              <h4 className="font-bold mb-2">Tablette déconnectée</h4>
              <p className="text-sm text-orange-700">Vérifiez le niveau de batterie. Une tablette en dessous de 10% peut désactiver son antenne Wi-Fi pour économiser l'énergie.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
