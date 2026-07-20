sed -i -e '/<button onClick={() => showToast && showToast('\''Action en cours de développement...'\'')}  /,/<\/button>/c\
                          <button \
                            onClick={() => showToast && showToast(`Téléchargement de la fiche de ${partner.name}...`)}  \
                            className="p-2 text-gray-400 hover:text-[#DDA956] transition-colors rounded-lg hover:bg-amber-50"\
                            title="Télécharger Fiche Partenaire"\
                          >\
                            <Download size={18} />\
                          </button>\
                          <button \
                            onClick={() => showToast && showToast(`Modification de ${partner.name} en cours de développement...`)}  \
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"\
                            title="Modifier Partenaire"\
                          >\
                            <Edit2 size={18} />\
                          </button>\
                          <button \
                            onClick={() => showToast && showToast(`Suppression de ${partner.name}...`)}  \
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"\
                            title="Supprimer Partenaire"\
                          >\
                            <Trash2 size={18} />\
                          </button>' src/App.tsx
