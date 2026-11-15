# Hardwood GM – ligue sur Railway

Une fois déployé, toi et ton frère ouvrez **la même adresse** (https://xxx.up.railway.app) : la ligue est partagée et sauvegardée automatiquement, sans compte Claude, sans code ni lien à renvoyer.

## Déploiement (≈ 5 min)
1. Crée un dépôt GitHub (privé ou public) et mets-y **le contenu de ce dossier** (server.js, package.json, public/, .gitignore).
2. Sur railway.com : *New Project* → *Deploy from GitHub repo* → choisis le dépôt. Railway détecte Node et lance `npm start`.
3. Service → *Settings* → *Networking* → **Generate Domain**. Ouvre l'adresse : le jeu s'affiche.
4. **Important – sauvegarde des données** : service → *Volumes* → *Add Volume*, point de montage `/data`, puis *Variables* → `DATA_DIR=/data`. Sans volume, la ligue est perdue à chaque redéploiement.
5. Envoie l'adresse à ton frère. Dans le jeu : mode *Ligue entre amis*, chacun choisit son équipe.

## Mise à jour du jeu
Remplace `public/Hardwood_GM.html` par la nouvelle version, commit + push : Railway redéploie (la ligue reste sur le volume).

## Notes
- Le serveur n'a aucune dépendance et consomme très peu (une ligue ≈ quelques centaines de Ko).
- Pas de mot de passe : quiconque connaît l'adresse peut rejoindre la ligue. Garde-la privée.
- Le plan gratuit/Hobby de Railway change parfois : vérifie le crédit mensuel sur railway.com/pricing.
- Test local : `node server.js` puis http://localhost:3000.
