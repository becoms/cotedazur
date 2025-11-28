# Côte d'Azur - Premium Mapbox Experience

Une intégration Mapbox premium présentant la Côte d'Azur avec terrain 3D, animations d'itinéraires fluides et un design de niveau Apple.

## ✨ Fonctionnalités

### 🗺️ Cartographie Premium
- **Terrain 3D réaliste** avec données d'élévation Mapbox DEM
- **Style visuel premium** avec effet dusk et brouillard atmosphérique
- **Bâtiments 3D** avec dégradés de couleur basés sur la hauteur
- **Projection globe** pour une expérience immersive

### 🎯 Villes Principales
- **Nice** - Promenade des Anglais et Vieux-Nice
- **Cannes** - Boulevard de la Croisette
- **Monaco** - Monte-Carlo et Port Hercule
- **Saint-Tropez** - Vieux Port et plages

### 🛣️ Itinéraires Animés
- **Nice → Monaco** - Route côtière panoramique
- **Cannes → Saint-Tropez** - Parcours des plages
- **Parcours Côtier Complet** - Découverte complète de la Côte d'Azur

### 📊 Données Topographiques
- **Altitude en temps réel** au survol de la carte
- **Calcul de distance** pour les itinéraires
- **Exagération du terrain** (1.5x) pour meilleure visibilité
- **Visualisation du relief** avec ombrage naturel

### 🎨 Design System
- **Glassmorphism** avec backdrop-filter pour effets vitrés
- **Animations fluides** avec easing cubic-bezier
- **Ombres portées** multi-niveaux pour profondeur
- **Couleurs inspirées Apple** (SF Blue, gradients premium)
- **Responsive** adapté mobile et desktop

## 🚀 Installation

### Prérequis
- Node.js 18+
- Un token Mapbox (gratuit sur [mapbox.com](https://account.mapbox.com/access-tokens/))

### Configuration

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer votre token Mapbox**

Ouvrez [main.js:4](main.js#L4) et remplacez :
```javascript
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
```

Par votre token Mapbox réel.

3. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application s'ouvrira automatiquement sur `http://localhost:3000`

## 📦 Build Production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## 🎮 Utilisation

### Navigation
- **Clic sur une ville** : Vol animé vers la destination
- **Boutons d'itinéraire** : Dessine l'itinéraire avec animation
- **Molette souris** : Zoom
- **Clic droit + glisser** : Rotation et inclinaison
- **Survol carte** : Affiche l'altitude

### Contrôles
- **Terrain 3D** : Active/désactive le relief
- **Labels** : Affiche/masque les labels de ville
- **Inclinaison** : Ajuste la perspective (0-85°)

## 🏗️ Architecture Technique

### Technologies
- **Mapbox GL JS 3.1** - Rendu vectoriel WebGL
- **Vite 5** - Build tool ultra-rapide
- **Pure JavaScript** - Vanilla JS, pas de framework
- **CSS3 moderne** - Glassmorphism, backdrop-filter, grid

### Fonctionnalités Avancées
- **Rendu GPU** avec antialiasing
- **Line-gradient animé** pour effet de dessin
- **Terrain exagération** pour relief prononcé
- **Custom markers** avec transformations CSS
- **Easing functions** pour animations naturelles
- **RequestAnimationFrame** pour performance 60fps

### Optimisations
- **Lazy loading** des tiles Mapbox
- **Compression terser** en production
- **Tree shaking** avec ES modules
- **Cache DNS Mapbox** pour CDN rapide

## 🎨 Style Customization

### Modifier les couleurs d'itinéraire
Dans [main.js:27-60](main.js#L27-L60) :
```javascript
const routes = {
  'nice-monaco': {
    color: '#007aff', // Bleu Apple
    // ...
  }
}
```

### Ajuster l'exagération du terrain
Dans [main.js:149-152](main.js#L149-L152) :
```javascript
this.map.setTerrain({
  source: 'mapbox-dem',
  exaggeration: 1.5 // Augmenter pour relief plus prononcé
});
```

### Personnaliser le style de carte
Styles disponibles :
- `mapbox://styles/mapbox/standard` (actuel)
- `mapbox://styles/mapbox/streets-v12`
- `mapbox://styles/mapbox/satellite-streets-v12`
- `mapbox://styles/mapbox/outdoors-v12`

## 📐 Ajouter de Nouveaux Itinéraires

Dans [main.js:27](main.js#L27), ajoutez :
```javascript
'votre-route': {
  coordinates: [
    [lon1, lat1],
    [lon2, lat2],
    // ...
  ],
  color: '#couleur',
  name: 'Nom de l\'itinéraire'
}
```

## 🌍 Ajouter de Nouvelles Villes

Dans [main.js:11](main.js#L11) :
```javascript
antibes: {
  coordinates: [7.1250, 43.5808],
  name: 'Antibes',
  zoom: 13
}
```

## 🔧 Variables CSS Principales

Dans [style.css:8-18](style.css#L8-L18) :
```css
:root {
  --primary: #007aff;        /* Couleur principale */
  --bg-glass: rgba(...);     /* Fond glassmorphism */
  --shadow: 0 8px 32px...;   /* Ombres portées */
  --radius: 16px;            /* Bordures arrondies */
  --transition: all 0.3s...; /* Transitions */
}
```

## 📱 Support Navigateurs

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 15+
- ✅ Edge 90+

WebGL requis (activé par défaut sur navigateurs modernes)

## 🎯 Fonctionnalités Futures

- [ ] Mode sombre/clair
- [ ] Calcul d'itinéraire temps réel avec Mapbox Directions API
- [ ] Points d'intérêt (restaurants, plages, monuments)
- [ ] Partage d'itinéraire via URL
- [ ] Export d'itinéraire en GPX
- [ ] Mode Street View (Mapillary integration)

## 📄 License

MIT - Utilisation libre pour projets personnels et commerciaux

## 🙏 Crédits

- **Mapbox** - Cartes et données terrain
- **Design** - Inspiré par Apple Maps et Google Maps
- **Données** - OpenStreetMap contributors
