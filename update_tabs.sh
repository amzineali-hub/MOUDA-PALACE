sed -i "s/className=\"flex overflow-x-auto border-b border-gray-100 hide-scrollbar p-2 gap-2\"/className=\"bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2\"/g" src/App.tsx
sed -i "s/className=\"flex overflow-x-auto hide-scrollbar gap-2\"/className=\"bg-gradient-to-r from-[#1A1A1A] to-[#333] flex overflow-x-auto hide-scrollbar p-2 gap-2 w-full\"/g" src/App.tsx
sed -i "s/className=\"flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 p-2 gap-4\"/className=\"flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#333] p-2 gap-4\"/g" src/App.tsx
sed -i "s/className=\"flex overflow-x-auto border-b border-gray-100 hide-scrollbar p-2 gap-2 mb-6\"/className=\"bg-gradient-to-r from-[#1A1A1A] to-[#333] rounded-2xl shadow-xl flex overflow-x-auto hide-scrollbar p-2 gap-2 mb-6\"/g" src/App.tsx

sed -i "s/'bg-\[#DDA956\]\/10 text-\[#DDA956\]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'/'bg-\[#DDA956\]\/20 text-\[#DDA956\]' : 'text-white\/70 hover:text-white hover:bg-white\/10'/g" src/App.tsx
