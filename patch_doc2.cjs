const fs = require('fs');
let code = fs.readFileSync('src/Documentation.tsx', 'utf8');

const targetStr = `              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Chercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

const replaceStr = `              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                  Chercher
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={() => {
                const guide = guides.find(g => g.id === 11);
                if (guide) setActiveGuide(guide);
              }}
              className="bg-amber-400 text-amber-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors shadow-lg flex items-center gap-2"
            >
              <BookOpen size={20} />
              Procédé de base : par quoi commencer ?
            </button>
          </div>
        </div>
      </div>`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/Documentation.tsx', code);
