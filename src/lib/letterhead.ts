// Génère le document HTML imprimable habillé du papier en-tête officiel Mouda Palace
// (bandeau teal + coordonnées, liseré doré, pied de page ICE/IF/Patente), partagé par
// tous les documents imprimés de l'app (factures, documents RH...) pour qu'ils restent
// visuellement identiques et que les coordonnées légales ne soient éditées qu'à un seul
// endroit (Configuration > Général).

export interface CompanyInfo {
  name?: string;
  category?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ice?: string;
  patente?: string;
  rc?: string;
  identifiantFiscal?: string;
  managerName?: string;
}

// Valeurs par défaut de l'établissement — mêmes valeurs que le préremplissage du formulaire
// Configuration > Général (App.tsx). Sert de repli tant que `settings/general` n'a pas encore
// été chargé/enregistré dans Firestore, pour que l'adresse et les coordonnées ne soient jamais
// vides sur un document imprimé (RH, factures...).
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Mouda Palace',
  category: 'Restaurant - Lounge - Rooftop',
  address: '7 Derb Agoual Sefli, Talaa Sghira, Fès Médina',
  phone: '+212 5 35 63 78 80 / +212 6 61 35 71 91',
  email: 'moudapalace@gmail.com',
  website: 'www.moudapalace.com',
  ice: '002898284000015',
  patente: '13900549',
  rc: '',
  identifiantFiscal: '50520780',
  managerName: 'Mohammed Houari Guertit'
};

// Fusionne les données Firestore sur l'état courant en ignorant les champs vides — un champ
// resté vide côté Configuration (ex: enregistré une première fois avant d'avoir rempli l'adresse)
// ne doit pas effacer une valeur par défaut correcte (DEFAULT_COMPANY_INFO) sur les documents imprimés.
export function mergeCompanyInfo<T extends Record<string, any>>(prev: T, data: Record<string, any>): T {
  const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v != null));
  return { ...prev, ...cleaned };
}

export interface LetterheadOptions {
  title: string;
  bodyHtml: string;
  /** CSS additionnel propre au document (tableaux de facture, mise en page de lettre...). */
  extraStyles?: string;
  /** Lance window.print() automatiquement à l'ouverture. Par défaut: true. */
  autoPrint?: boolean;
}

export function buildLetterheadHtml(companyInfo: CompanyInfo, originUrl: string, options: LetterheadOptions): string {
  const phones = (companyInfo.phone || '').split('/').map(p => p.trim()).filter(Boolean);
  const website = (companyInfo.website || 'www.moudapalace.com').replace(/^https?:\/\//, '');
  const autoPrint = options.autoPrint !== false;

  return `
    <html>
      <head>
        <title>${options.title}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body { font-family: 'Times New Roman', serif; color: #1a1a1a; margin: 0; }
          .letterhead { background: #265C6D; color: #fff; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
          .lh-brand { display: flex; align-items: center; gap: 14px; }
          .lh-brand img { height: 40px; }
          .lh-brand-name { font-size: 20px; letter-spacing: 3px; color: #F4C75B; font-weight: bold; }
          .lh-brand-sub { font-size: 10px; letter-spacing: 2px; color: #fff; text-transform: uppercase; opacity: 0.85; margin-top: 2px; }
          .lh-contact { text-align: right; font-size: 10.5px; line-height: 1.6; }
          .lh-divider { height: 6px; background: #D8A353; }
          .content { padding: 18px 40px 0 40px; }
          .lh-footer-bar { background: #D8A353; padding: 7px 40px; margin-top: 14px; }
          .lh-footer-box { background: #fff; border: 1px solid #D8A353; display: flex; justify-content: space-around; padding: 6px 16px; font-size: 10px; text-align: center; }
          ${options.extraStyles || ''}
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="lh-brand">
            <img src="${originUrl}/mouda-1-1-1.png" alt="${companyInfo.name || 'Mouda Palace'}" />
            <div>
              <div class="lh-brand-name">${(companyInfo.name || 'MOUDA PALACE').toUpperCase()}</div>
              <div class="lh-brand-sub">Restaurant - Lounge - Rooftop</div>
            </div>
          </div>
          <div class="lh-contact">
            ${phones.map(p => `<div>${p}</div>`).join('')}
            ${companyInfo.address ? `<div>${companyInfo.address}</div>` : ''}
            ${companyInfo.email ? `<div>${companyInfo.email}</div>` : ''}
            <div>${website}</div>
          </div>
        </div>
        <div class="lh-divider"></div>

        <div class="content">
          ${options.bodyHtml}
        </div>

        <div class="lh-footer-bar">
          <div class="lh-footer-box">
            <div>${companyInfo.ice ? `ICE : ${companyInfo.ice}` : ''}${companyInfo.identifiantFiscal ? `<br/>IF : ${companyInfo.identifiantFiscal}` : ''}</div>
            <div>${companyInfo.address ? `Adresse : ${companyInfo.address}` : ''}${companyInfo.patente ? `<br/>Taxe professionnelle N° : ${companyInfo.patente}` : ''}</div>
          </div>
        </div>
        ${autoPrint ? `<script>window.onload = () => { window.print(); };</script>` : ''}
      </body>
    </html>
  `;
}
