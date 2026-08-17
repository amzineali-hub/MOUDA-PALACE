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
          body { font-family: 'Times New Roman', serif; color: #1a1a1a; margin: 0; }
          .letterhead { background: #265C6D; color: #fff; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; }
          .lh-brand { display: flex; align-items: center; gap: 14px; }
          .lh-brand img { height: 46px; }
          .lh-brand-name { font-size: 22px; letter-spacing: 3px; color: #F4C75B; font-weight: bold; }
          .lh-contact { text-align: right; font-size: 11px; line-height: 1.7; }
          .lh-divider { height: 8px; background: #D8A353; }
          .content { padding: 30px 40px 0 40px; }
          .lh-footer-bar { background: #D8A353; padding: 10px 40px; margin-top: 20px; }
          .lh-footer-box { background: #fff; border: 1px solid #D8A353; display: flex; justify-content: space-around; padding: 8px 16px; font-size: 10.5px; text-align: center; }
          ${options.extraStyles || ''}
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="lh-brand">
            <img src="${originUrl}/mouda-1-1-1.png" alt="${companyInfo.name || 'Mouda Palace'}" />
            <div class="lh-brand-name">${(companyInfo.name || 'MOUDA PALACE').toUpperCase()}</div>
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
