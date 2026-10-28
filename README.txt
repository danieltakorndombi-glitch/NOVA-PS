NOVA PSP v10

FICHIERS (tous à la racine du dépôt GitHub, sans sous-dossier)
index.html, sw.js, manifest.webmanifest, icon-192.png, icon-512.png, apple-touch-icon.png

INSTALLER
1. Envoie les 6 fichiers dans ton dépôt GitHub et active GitHub Pages.
2. Ouvre https://TON-NOM.github.io/TON-DEPOT/ . La page se recharge une fois toute seule (c'est normal : elle active l'isolation nécessaire au moteur PSP).
3. Le moteur se télécharge automatiquement (une seule fois) puis reste en cache : la carte "Moteur" passe à "prêt hors ligne".
4. Charge ton jeu .iso / .cso / .pbp. Il reste sur ton appareil.

POURQUOI C'EST FIABLE
- Le moteur PSP exige des threads, donc une page "cross-origin isolated". GitHub Pages ne l'envoie pas : sw.js ajoute ces en-têtes.
- Le moteur est servi depuis ton propre domaine (dossier virtuel engine/), avec 3 tentatives automatiques en cas de coupure.

LIMITES CONNUES
- La documentation d'EmulatorJS indique que le cœur PSP n'est pas pris en charge sur Safari. Sur iPhone, il peut donc refuser de démarrer même si tout est vert. Sur Android (Chrome) ou ordinateur, c'est le cas normal.
- Un jeu de 800 Mo à 1 Go est chargé en mémoire : ferme les autres applis.
- Pour mettre à jour l'appli plus tard, change SHELL dans sw.js (nova-psp-shell-v10 -> v11).
