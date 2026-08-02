const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStatsStart = `      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => {`;
const targetStatsEnd = `          </div>
        </div>
      </div>`;

const startIndex = code.indexOf(targetStatsStart);
if (startIndex !== -1) {
  const endIndex = code.indexOf(targetStatsEnd, startIndex) + targetStatsEnd.length;
  const originalStats = code.substring(startIndex, endIndex);

  const newStats = `      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Tous');
            setStockAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-[#F4C75B] hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-gray-50 text-gray-600 rounded-xl group-hover:bg-[#F4C75B]/10 group-hover:text-[#265C6D] transition-colors">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Références</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{stockItemsData.length}</h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setStockAlertFilter(true);
            setExpirationFilter('Tous');
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-red-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alertes Stock Bas</p>
            <h4 className="text-2xl font-bold text-red-600 mt-1">
              {stockItemsData.filter(i => i.quantity <= i.minStock).length}
            </h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('suppliers')}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-green-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-100 transition-colors">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Fournisseurs Actifs</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{fournisseurs.length}</h4>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          onClick={() => {
            setActiveTab('stocks');
            setExpirationFilter('Proche/Expiré');
            setStockAlertFilter(false);
            setSelectedCategory('Tous');
            setSearchQuery('');
          }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-orange-300 hover:shadow-lg transition-all group"
        >
          <div className="p-4 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Péremption Proche/Expiré</p>
            <h4 className="text-2xl font-bold text-orange-600 mt-1">
              {stockItemsData.filter(i => {
                if (!i.expirationDate) return false;
                const expDate = new Date(i.expirationDate);
                const today = new Date();
                const diffTime = expDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </h4>
          </div>
        </motion.div>
      </motion.div>`;

  code = code.replace(originalStats, newStats);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully added motion animations to stats cards in App.tsx');
} else {
  console.log('Could not find target stats section');
}
