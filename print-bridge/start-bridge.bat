@echo off
REM Ce .bat lance le pont depuis le CODE SOURCE (node index.js) — utile en developpement/test.
REM Sur un vrai poste caisse, on utilise directement print-bridge.exe (voir README.md), qui n'a
REM besoin d'aucune installation de Node.js.
cd /d %~dp0
node index.js
pause
