# 📊 Emplacements des Rapports HTML des Tests

## 🧪 Tests Selenium

### Emplacement Principal
```
C:\Users\FadouaOugas\Desktop\pfa\selenium\reports\report.html
```

### Détails
- **Dossier**: `selenium/reports/`
- **Fichier**: `report.html`
- **Type**: Rapport pytest-html
- **Contenu**: Résultats détaillés de tous les tests Selenium
- **Mise à jour**: À chaque exécution de `pytest`

### Pour ouvrir
```powershell
cd selenium\reports
start report.html
```

Ou directement:
```powershell
start selenium\reports\report.html
```

---

## 📈 Tests JMeter

### Emplacement Principal (Dernier rapport)
```
C:\Users\FadouaOugas\Desktop\pfa\jmeter\jmeter-results\20251225_195452\html-report\index.html
```

### Structure
```
jmeter/
└── jmeter-results/
    ├── 20251225_195452/          (Dernier - 97.62% pass rate)
    │   ├── html-report/
    │   │   └── index.html        ← Rapport HTML principal
    │   └── results.jtl           (Fichier de données)
    ├── 20251225_195330/
    ├── 20251225_195203/
    └── ...
```

### Détails
- **Dossier**: `jmeter/jmeter-results/[timestamp]/html-report/`
- **Fichier**: `index.html`
- **Type**: Rapport JMeter HTML complet
- **Contenu**: 
  - Graphiques de performance
  - Statistiques détaillées
  - Temps de réponse
  - Taux d'erreur
  - Throughput
- **Mise à jour**: À chaque exécution de `jmeter`

### Rapports Disponibles
1. **20251225_195452** - Dernier rapport (97.62% pass rate)
2. **20251225_195330** - Rapport précédent
3. **20251225_195203** - Rapport précédent
4. **20251225_194926** - Rapport précédent
5. **20251225_194710** - Rapport précédent

### Pour ouvrir le dernier rapport
```powershell
cd jmeter\jmeter-results
$latest = Get-ChildItem -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
start "$latest\html-report\index.html"
```

---

## 🚀 Accès Rapide

### Ouvrir tous les rapports
```powershell
# Selenium
start selenium\reports\report.html

# JMeter (dernier)
$latest = Get-ChildItem jmeter\jmeter-results -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
start "$latest\html-report\index.html"
```

### Explorer les dossiers
```powershell
# Selenium
explorer selenium\reports

# JMeter
explorer jmeter\jmeter-results
```

---

## 📝 Notes

- Les rapports Selenium sont **écrasés** à chaque exécution
- Les rapports JMeter sont **sauvegardés** avec un timestamp unique
- Les rapports HTML sont **autonomes** (tous les assets sont inclus)
- Les screenshots Selenium sont dans: `selenium/screenshots/`

---

## 🔍 Contenu des Rapports

### Rapport Selenium
- ✅ Liste de tous les tests
- ✅ Statut (Passed/Failed/Skipped)
- ✅ Temps d'exécution
- ✅ Messages d'erreur détaillés
- ✅ Screenshots des échecs
- ✅ Environnement (Python, OS, plugins)

### Rapport JMeter
- 📊 Graphiques de performance
- 📈 Statistiques de réponse
- ⏱️ Temps de réponse (min/max/moyenne)
- 📉 Taux d'erreur
- 🚀 Throughput (requêtes/seconde)
- 📋 Détails par endpoint

---

## 📍 Chemins Complets

### Selenium
```
C:\Users\FadouaOugas\Desktop\pfa\selenium\reports\report.html
```

### JMeter (Dernier)
```
C:\Users\FadouaOugas\Desktop\pfa\jmeter\jmeter-results\20251225_195452\html-report\index.html
```

---

*Dernière mise à jour: 25 Décembre 2025*

