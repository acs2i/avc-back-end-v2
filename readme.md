# Starter Express avec Webpack et TypeScript

Ce projet est un modèle simple pour construire une application Express.js avec TypeScript et Webpack.

## Prérequis

Avant d'exécuter ce projet, assurez-vous d'avoir Node.js et npm installés sur votre machine.

## Les dependencies

1.  Installez Node et Npm. Vous pouvez les trouver là: https://nodejs.org/en/download

## Pour installer

1. Clonez ce dépôt sur votre machine locale.

2. Installez les dépendances avec npm :

    naviguer au niveau du project qui contient "package.json" en terminal
    
    npm install


## Pour Developpement 

L'utilisation de ts-node-dev mets à jour notre application automatiquement chaque fois que vous sauvegardez un fichier. 
NOTEZ que: ts-node-dev ne fait rien "type-checking", c'est-à-dire que c'est possible qu'il y aie des bouges à cause de mauvais types

1. Naviguer au niveau du project qui contient "package.json" en terminal
2. npm run dev 


## Pour Deployer

Il faut compiler le .ts files en .js pour que ils puissent utilisés par le Node.js runtime dans le serveur. 
Le "start" cmd va faire la compilation, ainsi que le deploie sur la PORT addresse écrite. 

1. Naviguer au niveau du project qui contient "package.json" en terminal
2. npm start 