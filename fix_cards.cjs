const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetCards = `<DashboardCard 
            title="Daily Active Users" 
            value="324"
            subtitle="Utilisateurs uniques aujourd'hui"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Average Order Value" 
            value="1,076 MAD"
            subtitle="Panier moyen par table"
            icon={<CreditCard className="text-[#DDA956]" size={24} />}
            delay={0.2}
          />
          <DashboardCard 
            title="Réservations du Jour" 
            value="42"
            subtitle="+12 via WhatsApp IA, 4 via Riads B2B"
            icon={<CalendarCheck className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Chiffre d'Affaires Prév." 
            value="45,200 MAD"
            subtitle="Basé sur les réservations du jour"
            icon={<Banknote className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Point de Vente (POS)" 
            value="Actif"
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Clients Actifs (CRM)" 
            value="1,204"
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
          <DashboardCard 
            title="Commissions Riads" 
            value="3,450 MAD"
            subtitle="À régler pour le mois en cours"
            icon={<MapPin className="text-[#DDA956]" size={24} />}
            delay={0.5}
          />`;

const repCards = `<DashboardCard 
            title="Daily Active Users" 
            value={isLoadingMetrics ? "..." : metrics.users}
            subtitle="Utilisateurs uniques"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.1}
          />
          <DashboardCard 
            title="Average Order Value" 
            value={isLoadingMetrics ? "..." : metrics.aov}
            subtitle="Panier moyen par table"
            icon={<CreditCard className="text-[#DDA956]" size={24} />}
            delay={0.2}
          />
          <DashboardCard 
            title="Réservations" 
            value={isLoadingMetrics ? "..." : metrics.reservations}
            subtitle="+12 via WhatsApp IA, 4 via Riads B2B"
            icon={<CalendarCheck className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Chiffre d'Affaires Prév." 
            value={isLoadingMetrics ? "..." : metrics.revenue}
            subtitle="Basé sur les réservations"
            icon={<Banknote className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
        </div>

        {/* Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard 
            title="Point de Vente (POS)" 
            value={isLoadingMetrics ? "..." : metrics.pos}
            subtitle="Synchronisation des tables en temps réel"
            icon={<Store className="text-[#DDA956]" size={24} />}
            delay={0.3}
          />
          <DashboardCard 
            title="Clients Actifs (CRM)" 
            value={isLoadingMetrics ? "..." : metrics.crm}
            subtitle="Base Firestore synchronisée en temps réel"
            icon={<Users className="text-[#DDA956]" size={24} />}
            delay={0.4}
          />
          <DashboardCard 
            title="Commissions Riads" 
            value={isLoadingMetrics ? "..." : metrics.commissions}
            subtitle="À régler pour la période"
            icon={<MapPin className="text-[#DDA956]" size={24} />}
            delay={0.5}
          />`;

code = code.replace(targetCards, repCards);

fs.writeFileSync('src/App.tsx', code);
