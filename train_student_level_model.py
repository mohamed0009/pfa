"""
Script d'entraînement pour le modèle de prédiction du niveau d'étudiant
utilisant Gradient Boosting Classifier
"""
import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Créer les dossiers nécessaires
MODEL_DIR = Path("models")
PROCESSED_DIR = Path("processed_datasets")
MODEL_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

def generate_synthetic_student_data(n_samples=2000):
    """
    Génère des données synthétiques d'étudiants pour l'entraînement
    En production, ces données viendraient de la base de données
    """
    np.random.seed(42)
    
    data = {
        # Métriques de conversation
        'total_conversations': np.random.poisson(lam=15, size=n_samples),
        'total_messages': np.random.poisson(lam=50, size=n_samples),
        'avg_messages_per_conversation': np.random.uniform(1, 20, n_samples),
        'conversation_frequency': np.random.uniform(0.1, 2.0, n_samples),  # conversations par jour
        
        # Métriques de complexité
        'avg_message_length': np.random.uniform(20, 500, n_samples),
        'avg_question_complexity': np.random.uniform(1, 10, n_samples),
        'unique_topics_count': np.random.poisson(lam=10, size=n_samples),
        
        # Métriques de performance académique
        'quiz_average_score': np.random.uniform(40, 100, n_samples),
        'exercise_completion_rate': np.random.uniform(0, 1, n_samples),
        'total_quizzes_taken': np.random.poisson(lam=8, size=n_samples),
        'total_exercises_completed': np.random.poisson(lam=15, size=n_samples),
        
        # Métriques temporelles
        'days_active': np.random.uniform(1, 180, n_samples),
        'avg_time_between_sessions': np.random.uniform(0.5, 7, n_samples),  # jours
        'last_activity_days_ago': np.random.uniform(0, 30, n_samples),
        
        # Métriques d'engagement
        'response_time_avg': np.random.uniform(1, 60, n_samples),  # minutes
        'follow_up_questions_rate': np.random.uniform(0, 0.5, n_samples),
        'content_consumption_rate': np.random.uniform(0.1, 1.0, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Calculer le niveau cible basé sur les caractéristiques
    # Plus un étudiant est actif et performant, plus son niveau est élevé
    level_score = (
        df['total_conversations'] * 0.1 +
        df['total_messages'] * 0.15 +
        df['avg_message_length'] * 0.05 +
        df['quiz_average_score'] * 0.3 +
        df['exercise_completion_rate'] * 0.2 +
        df['conversation_frequency'] * 0.1 +
        df['days_active'] * 0.1
    )
    
    # Normaliser et créer les catégories de niveau
    level_score = (level_score - level_score.min()) / (level_score.max() - level_score.min()) * 300
    
    # Créer les labels de niveau
    def assign_level(score):
        if score < 50:
            return 'DEBUTANT'
        elif score < 150:
            return 'INTERMEDIAIRE'
        elif score < 300:
            return 'AVANCE'
        else:
            return 'EXPERT'
    
    df['level'] = level_score.apply(assign_level)
    df['level_score'] = level_score
    
    return df

def preprocess_features(df):
    """Préprocesse les features pour l'entraînement"""
    # Sélectionner les features
    feature_columns = [
        'total_conversations',
        'total_messages',
        'avg_messages_per_conversation',
        'conversation_frequency',
        'avg_message_length',
        'avg_question_complexity',
        'unique_topics_count',
        'quiz_average_score',
        'exercise_completion_rate',
        'total_quizzes_taken',
        'total_exercises_completed',
        'days_active',
        'avg_time_between_sessions',
        'last_activity_days_ago',
        'response_time_avg',
        'follow_up_questions_rate',
        'content_consumption_rate'
    ]
    
    X = df[feature_columns].copy()
    y = df['level'].copy()
    
    # Normaliser les features
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(
        scaler.fit_transform(X),
        columns=X.columns,
        index=X.index
    )
    
    return X_scaled, y, scaler, feature_columns

def train_model():
    """Entraîne le modèle Gradient Boosting pour prédire le niveau d'étudiant"""
    logger.info("Génération des données synthétiques...")
    df = generate_synthetic_student_data(n_samples=2000)
    
    logger.info("Préprocessing des features...")
    X, y, scaler, feature_names = preprocess_features(df)
    
    # Split train/test (sans stratification si certaines classes sont trop petites)
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError:
        # Si stratification échoue, utiliser sans stratification
        logger.warning("Stratification failed, using non-stratified split")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
    
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    # Entraîner le modèle Gradient Boosting
    logger.info("Entraînement du modèle Gradient Boosting...")
    model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=5,
        min_samples_split=10,
        min_samples_leaf=4,
        subsample=0.8,
        random_state=42,
        verbose=1
    )
    
    model.fit(X_train, y_train)
    
    # Évaluation
    logger.info("Évaluation du modèle...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info("\nClassification Report:")
    logger.info(classification_report(y_test, y_pred))
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    logger.info(f"\nCross-validation scores: {cv_scores}")
    logger.info(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Sauvegarder le modèle
    timestamp = pd.Timestamp.now().strftime("%Y%m%d_%H%M%S")
    model_filename = MODEL_DIR / f"student_level_model_{timestamp}.joblib"
    metadata_filename = MODEL_DIR / f"student_level_metadata_{timestamp}.json"
    artifacts_filename = PROCESSED_DIR / f"student_level_preprocessing_{timestamp}.joblib"
    
    logger.info(f"Sauvegarde du modèle dans {model_filename}")
    joblib.dump(model, model_filename)
    
    # Sauvegarder les métadonnées
    metadata = {
        "model_type": "GradientBoostingClassifier",
        "feature_names": feature_names,
        "target_classes": model.classes_.tolist(),
        "accuracy": float(accuracy),
        "cv_mean_accuracy": float(cv_scores.mean()),
        "cv_std_accuracy": float(cv_scores.std()),
        "n_estimators": 200,
        "learning_rate": 0.1,
        "max_depth": 5,
        "timestamp": timestamp
    }
    
    with open(metadata_filename, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    # Sauvegarder les artifacts de preprocessing
    artifacts = {
        "scaler": scaler,
        "feature_names": feature_names
    }
    joblib.dump(artifacts, artifacts_filename)
    
    logger.info(f"Modèle sauvegardé avec succès!")
    logger.info(f"  - Modèle: {model_filename}")
    logger.info(f"  - Métadonnées: {metadata_filename}")
    logger.info(f"  - Artifacts: {artifacts_filename}")
    
    return model, scaler, feature_names, metadata

if __name__ == "__main__":
    train_model()

