# 📊 Guide : Comment Calculer la Couverture de Code (Code Coverage)

## 🎯 Qu'est-ce que la Couverture de Code ?

La **couverture de code** (code coverage) mesure le pourcentage de votre code source qui est exécuté par vos tests. C'est un indicateur de qualité qui montre combien de votre code est testé.

## 📈 Types de Métriques de Couverture

### 1. **Statement Coverage (Couverture des Instructions)**
- **Définition** : Pourcentage d'instructions exécutées au moins une fois
- **Formule** : `(Instructions exécutées / Total d'instructions) × 100`
- **Exemple** :
  ```typescript
  function calculate(a: number, b: number): number {
    if (a > 0) {        // ✅ Testé
      return a + b;    // ✅ Testé
    }
    return a - b;       // ❌ Non testé
  }
  ```
  **Couverture** : 2/3 = 66.67%

### 2. **Branch Coverage (Couverture des Branches)**
- **Définition** : Pourcentage de branches conditionnelles testées (if/else, switch, etc.)
- **Formule** : `(Branches exécutées / Total de branches) × 100`
- **Exemple** :
  ```typescript
  if (user.isAdmin) {     // Branche TRUE ✅
    // ...
  } else {                // Branche FALSE ❌
    // ...
  }
  ```
  **Couverture** : 1/2 = 50%

### 3. **Function Coverage (Couverture des Fonctions)**
- **Définition** : Pourcentage de fonctions appelées au moins une fois
- **Formule** : `(Fonctions appelées / Total de fonctions) × 100`

### 4. **Line Coverage (Couverture des Lignes)**
- **Définition** : Pourcentage de lignes de code exécutées
- **Formule** : `(Lignes exécutées / Total de lignes) × 100`
- **Note** : C'est la métrique la plus simple mais moins précise

## 🔧 Comment ça Fonctionne dans Votre Projet

### **Frontend Angular/TypeScript**

#### 1. **Génération du Rapport de Couverture**

```bash
cd coach_ai_frontend
npm run test:coverage
```

Cette commande :
- Lance tous les tests unitaires
- Utilise **Istanbul** (via `karma-coverage`) pour instrumenter le code
- Génère un rapport dans `coverage/lcov.info`

#### 2. **Configuration Karma** (`karma.conf.js`)

```javascript
coverageReporter: {
  type: 'lcov',
  dir: require('path').join(__dirname, './coverage'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' },
    { type: 'lcovonly' }  // Pour SonarQube
  ]
}
```

#### 3. **Format LCOV**

Le fichier `coverage/lcov.info` contient :
```
SF:src/app/services/auth.service.ts
FN:10,login
FNF:5
FNH:3
DA:15,1
DA:16,1
DA:20,0    # Ligne 20 non exécutée
LF:50      # Total lignes
LH:45      # Lignes exécutées
end_of_record
```

**Décodage** :
- `SF` : Source File
- `FN` : Function Name
- `DA` : Line Data (ligne, nombre d'exécutions)
- `LF` : Lines Found (total)
- `LH` : Lines Hit (exécutées)

#### 4. **Calcul dans SonarQube**

SonarQube lit `coverage/lcov.info` et calcule :
```
Couverture = (LH / LF) × 100
```

### **Backend Java/Spring Boot**

#### 1. **Génération avec JaCoCo**

```bash
cd backend
mvn clean test jacoco:report
```

#### 2. **Comment JaCoCo Fonctionne**

JaCoCo utilise **bytecode instrumentation** :
1. **À l'exécution** : JaCoCo modifie le bytecode Java pour ajouter des compteurs
2. **Pendant les tests** : Chaque instruction exécutée incrémente un compteur
3. **Après les tests** : JaCoCo génère un rapport XML avec les statistiques

#### 3. **Rapport JaCoCo** (`target/site/jacoco/jacoco.xml`)

```xml
<package name="com/coachai/service">
  <class name="AuthService">
    <method name="login">
      <counter type="INSTRUCTION" missed="5" covered="20"/>
      <counter type="BRANCH" missed="2" covered="8"/>
      <counter type="LINE" missed="2" covered="10"/>
    </method>
  </class>
</package>
```

#### 4. **Calcul des Métriques**

```java
// Exemple de calcul
int totalInstructions = missed + covered;  // 5 + 20 = 25
double coverage = (covered / totalInstructions) * 100;  // (20/25) * 100 = 80%
```

## 📊 Exemple Concret de Calcul

### **Fichier : `auth.service.ts`**

```typescript
export class AuthService {
  login(email: string, password: string): Observable<AuthUser> {
    if (!email || !password) {           // Ligne 1 ✅ Testée
      return throwError('Invalid');      // Ligne 2 ✅ Testée
    }
    
    return this.http.post('/api/auth/login', { email, password })
      .pipe(
        map(response => response.user),  // Ligne 3 ✅ Testée
        catchError(error => {            // Ligne 4 ✅ Testée
          console.error(error);          // Ligne 5 ❌ Non testée (catchError non déclenché)
          return throwError(error);       // Ligne 6 ❌ Non testée
        })
      );
  }
}
```

**Résultat** :
- **Lignes totales** : 6
- **Lignes exécutées** : 4
- **Couverture** : 4/6 = **66.67%**

### **Pour Améliorer à 100%** :

```typescript
// Test supplémentaire nécessaire
it('should handle login error', () => {
  httpMock.expectOne('/api/auth/login')
    .error(new ErrorEvent('Network error'));
  
  service.login('test@test.com', 'pass').subscribe({
    error: (err) => expect(err).toBeTruthy()
  });
});
```

## 🎯 Métriques dans SonarQube

SonarQube affiche plusieurs métriques :

| Métrique | Description | Calcul |
|----------|-------------|--------|
| **Coverage** | Couverture globale | `(Lignes couvertes / Lignes totales) × 100` |
| **Lines to Cover** | Nombre de lignes à couvrir | Lignes exécutables (hors commentaires, déclarations) |
| **Uncovered Lines** | Lignes non couvertes | `Lines to Cover - Covered Lines` |
| **Line Coverage** | Couverture par ligne | `(Covered Lines / Lines to Cover) × 100` |
| **Branch Coverage** | Couverture des branches | `(Covered Branches / Total Branches) × 100` |

## 🔍 Comment Vérifier la Couverture

### **1. Frontend Angular**

```bash
# Générer le rapport
npm run test:coverage

# Voir le rapport HTML
# Ouvrir: coach_ai_frontend/coverage/index.html
```

**Rapport HTML affiche** :
- Couverture par fichier
- Lignes couvertes (vert) vs non couvertes (rouge)
- Pourcentage par métrique

### **2. Backend Java**

```bash
# Générer le rapport
mvn clean test jacoco:report

# Voir le rapport HTML
# Ouvrir: backend/target/site/jacoco/index.html
```

### **3. Dans SonarQube**

1. Lancer l'analyse SonarQube
2. Aller dans l'onglet **"Measures"** ou **"Code"**
3. Voir la section **"Coverage"**

## 📈 Améliorer la Couverture

### **Stratégie Progressive**

1. **Cibler les fichiers critiques** (services, contrôleurs)
2. **Tester les chemins heureux** (happy paths)
3. **Tester les cas d'erreur** (error handling)
4. **Tester les cas limites** (edge cases)

### **Exemple d'Amélioration**

**Avant** (50% de couverture) :
```typescript
// auth.service.ts - 10 lignes, 5 testées
login() { /* ... */ }  ✅ Testé
logout() { /* ... */ } ❌ Non testé
```

**Après** (100% de couverture) :
```typescript
// Tests ajoutés
describe('AuthService', () => {
  it('should login', () => { /* ... */ });      ✅
  it('should logout', () => { /* ... */ });     ✅
  it('should handle login error', () => { /* ... */ }); ✅
});
```

## 🎓 Bonnes Pratiques

### ✅ **À Faire**
- Viser **minimum 60-80%** de couverture
- Tester les **chemins critiques** (authentification, paiement, etc.)
- Tester les **cas d'erreur**
- Maintenir la couverture dans le temps

### ❌ **À Éviter**
- Viser 100% partout (coûteux et pas toujours utile)
- Tester uniquement les lignes faciles
- Ignorer les branches conditionnelles
- Tester le code généré automatiquement

## 📝 Commandes Utiles

### **Frontend**
```bash
# Générer couverture
npm run test:coverage

# Voir le rapport
start coverage/index.html  # Windows
open coverage/index.html   # Mac
```

### **Backend**
```bash
# Générer couverture
mvn clean test jacoco:report

# Voir le rapport
start target/site/jacoco/index.html  # Windows
```

### **SonarQube**
```bash
# Frontend
cd coach_ai_frontend
sonar-scanner -Dsonar.host.url=http://localhost:9000

# Backend
cd backend
mvn sonar:sonar
```

## 🔢 Formule Générale

```
Couverture (%) = (Code Exécuté / Code Total) × 100
```

Où :
- **Code Exécuté** = Lignes/Branches/Fonctions testées
- **Code Total** = Lignes/Branches/Fonctions totales

## 📊 Votre Situation Actuelle

D'après SonarQube :
- **Coverage** : **2.9%** (très faible)
- **Lines to Cover** : **8.7k lignes**
- **Covered Lines** : ~252 lignes (8.7k × 2.9%)

**Objectif** : Atteindre **60%+** de couverture

## 🚀 Plan d'Action

1. **Identifier les fichiers non testés** (via SonarQube)
2. **Créer des tests pour les services critiques**
3. **Ajouter des tests d'intégration**
4. **Vérifier régulièrement** la couverture

---

*Document créé le 25 Décembre 2025*


