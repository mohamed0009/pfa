import pandas as pd
import numpy as np
import json
import joblib
from typing import Dict, List, Any, Tuple
from datetime import datetime
import logging
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import GridSearchCV, cross_val_score, learning_curve
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score,
    roc_curve, precision_recall_curve
)
import warnings
warnings.filterwarnings('ignore')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EducationalModelTrainer:
    """Comprehensive model training pipeline for educational data"""
    
    def __init__(self, data_dir: str = "processed_datasets", output_dir: str = "models"):
        self.data_dir = Path(data_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Set random seeds for reproducibility
        np.random.seed(42)
        
        # Model configurations
        self.models = {
            'random_forest': {
                'model': RandomForestClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [10, 20, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            },
            'gradient_boosting': {
                'model': GradientBoostingClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7],
                    'subsample': [0.8, 1.0]
                }
            },
            'logistic_regression': {
                'model': LogisticRegression(random_state=42, max_iter=1000),
                'params': {
                    'C': [0.1, 1, 10],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear', 'saga']
                }
            },
            'svm': {
                'model': SVC(random_state=42, probability=True),
                'params': {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf'],
                    'gamma': ['scale', 'auto']
                }
            },
            'neural_network': {
                'model': MLPClassifier(random_state=42, max_iter=1000),
                'params': {
                    'hidden_layer_sizes': [(100,), (100, 50), (150, 100, 50)],
                    'activation': ['relu', 'tanh'],
                    'alpha': [0.0001, 0.001, 0.01],
                    'learning_rate': ['constant', 'adaptive']
                }
            }
        }
        
        # Training history
        self.training_history = {}
        self.best_models = {}
        self.evaluation_results = {}
        
    def load_processed_data(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Load processed training and test data"""
        logger.info("Loading processed data...")
        
        # Find the most recent data files
        train_files = list(self.data_dir.glob("train_data_*.csv"))
        test_files = list(self.data_dir.glob("test_data_*.csv"))
        
        if not train_files or not test_files:
            raise FileNotFoundError("No processed data files found")
        
        # Use the most recent files
        train_file = max(train_files, key=lambda x: x.stat().st_mtime)
        test_file = max(test_files, key=lambda x: x.stat().st_mtime)
        
        logger.info(f"Loading training data from {train_file}")
        train_df = pd.read_csv(train_file)
        
        logger.info(f"Loading test data from {test_file}")
        test_df = pd.read_csv(test_file)
        
        return train_df, test_df
    
    def prepare_features_and_targets(self, train_df: pd.DataFrame, test_df: pd.DataFrame, 
                                   target_column: str = 'difficulty_category') -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str]]:
        """Prepare features and target variables for training"""
        logger.info("Preparing features and targets...")
        
        # Identify feature columns (exclude target and metadata)
        exclude_columns = [target_column, 'difficulty_level', 'engagement_score', 
                          'engagement_category', 'question', 'answer', 'explanation']
        
        feature_columns = [col for col in train_df.columns if col not in exclude_columns]
        
        # Handle any remaining non-numeric columns
        numeric_features = []
        for col in feature_columns:
            if train_df[col].dtype in ['int64', 'float64']:
                numeric_features.append(col)
            else:
                logger.warning(f"Excluding non-numeric feature: {col}")
        
        feature_columns = numeric_features
        
        # Prepare features and targets
        X_train = train_df[feature_columns].fillna(0)
        X_test = test_df[feature_columns].fillna(0)
        
        y_train = train_df[target_column].fillna(train_df[target_column].mode()[0])
        y_test = test_df[target_column].fillna(test_df[target_column].mode()[0])
        
        logger.info(f"Features prepared: {len(feature_columns)} features")
        logger.info(f"Training set shape: {X_train.shape}")
        logger.info(f"Test set shape: {X_test.shape}")
        logger.info(f"Target distribution (train): {y_train.value_counts().to_dict()}")
        
        return X_train.values, X_test.values, y_train.values, y_test.values, feature_columns
    
    def train_model_with_grid_search(self, model_name: str, model_config: Dict, 
                                   X_train: np.ndarray, y_train: np.ndarray) -> Any:
        """Train a model using grid search for hyperparameter tuning"""
        logger.info(f"Training {model_name} with grid search...")
        
        model = model_config['model']
        param_grid = model_config['params']
        
        # Perform grid search with cross-validation
        grid_search = GridSearchCV(
            model,
            param_grid,
            cv=5,
            scoring='f1_weighted',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Store training history
        self.training_history[model_name] = {
            'best_params': grid_search.best_params_,
            'best_score': grid_search.best_score_,
            'cv_results': grid_search.cv_results_
        }
        
        logger.info(f"Best parameters for {model_name}: {grid_search.best_params_}")
        logger.info(f"Best CV score: {grid_search.best_score_:.4f}")
        
        return grid_search.best_estimator_
    
    def evaluate_model(self, model: Any, model_name: str, X_test: np.ndarray, 
                      y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate model performance"""
        logger.info(f"Evaluating {model_name}...")
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted')
        }
        
        # Add AUC for binary classification or macro AUC for multi-class
        if y_pred_proba is not None:
            if len(np.unique(y_test)) == 2:
                metrics['auc'] = roc_auc_score(y_test, y_pred_proba[:, 1])
            else:
                metrics['auc'] = roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='macro')
        
        # Classification report
        metrics['classification_report'] = classification_report(y_test, y_pred, output_dict=True)
        
        # Confusion matrix
        metrics['confusion_matrix'] = confusion_matrix(y_test, y_pred).tolist()
        
        # Store results
        self.evaluation_results[model_name] = metrics
        
        logger.info(f"{model_name} - Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}")
        
        return metrics
    
    def perform_cross_validation(self, model: Any, X: np.ndarray, y: np.ndarray, 
                               model_name: str) -> Dict[str, float]:
        """Perform cross-validation analysis"""
        logger.info(f"Performing cross-validation for {model_name}...")
        
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='f1_weighted')
        
        cv_results = {
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'cv_scores': cv_scores.tolist()
        }
        
        logger.info(f"{model_name} CV - Mean: {cv_results['cv_mean']:.4f} ± {cv_results['cv_std']:.4f}")
        
        return cv_results
    
    def plot_learning_curves(self, model: Any, X: np.ndarray, y: np.ndarray, 
                            model_name: str):
        """Generate learning curves for the model"""
        logger.info(f"Generating learning curves for {model_name}...")
        
        train_sizes, train_scores, val_scores = learning_curve(
            model, X, y, cv=5, n_jobs=-1, 
            train_sizes=np.linspace(0.1, 1.0, 10),
            scoring='f1_weighted'
        )
        
        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        val_mean = np.mean(val_scores, axis=1)
        val_std = np.std(val_scores, axis=1)
        
        plt.figure(figsize=(10, 6))
        plt.plot(train_sizes, train_mean, 'o-', color='blue', label='Training Score')
        plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color='blue')
        plt.plot(train_sizes, val_mean, 'o-', color='red', label='Validation Score')
        plt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1, color='red')
        
        plt.xlabel('Training Set Size')
        plt.ylabel('F1 Score')
        plt.title(f'Learning Curves - {model_name}')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save the plot
        plot_path = self.output_dir / f"learning_curve_{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Learning curve saved to {plot_path}")
    
    def plot_confusion_matrix(self, y_true: np.ndarray, y_pred: np.ndarray, 
                            model_name: str, class_names: List[str] = None):
        """Plot confusion matrix"""
        if class_names is None:
            class_names = [f'Class {i}' for i in range(len(np.unique(y_true)))]
        
        cm = confusion_matrix(y_true, y_pred)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=class_names, yticklabels=class_names)
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.title(f'Confusion Matrix - {model_name}')
        
        # Save the plot
        plot_path = self.output_dir / f"confusion_matrix_{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Confusion matrix saved to {plot_path}")
    
    def train_all_models(self, X_train: np.ndarray, X_test: np.ndarray, 
                        y_train: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Train all models and evaluate them"""
        logger.info("Starting comprehensive model training...")
        
        results = {}
        
        for model_name, model_config in self.models.items():
            try:
                # Train model with grid search
                best_model = self.train_model_with_grid_search(
                    model_name, model_config, X_train, y_train
                )
                
                # Evaluate model
                metrics = self.evaluate_model(best_model, model_name, X_test, y_test)
                
                # Cross-validation
                cv_results = self.perform_cross_validation(best_model, X_train, y_train, model_name)
                metrics['cross_validation'] = cv_results
                
                # Generate learning curves
                self.plot_learning_curves(best_model, X_train, y_train, model_name)
                
                # Plot confusion matrix
                y_pred = best_model.predict(X_test)
                self.plot_confusion_matrix(y_test, y_pred, model_name)
                
                # Store best model
                self.best_models[model_name] = best_model
                
                results[model_name] = metrics
                
                logger.info(f"Completed training and evaluation for {model_name}")
                
            except Exception as e:
                logger.error(f"Error training {model_name}: {str(e)}")
                results[model_name] = {'error': str(e)}
        
        return results
    
    def select_best_model(self) -> Tuple[str, Any, Dict[str, Any]]:
        """Select the best performing model based on F1 score"""
        logger.info("Selecting best model...")
        
        best_model_name = None
        best_score = 0
        best_metrics = None
        
        for model_name, metrics in self.evaluation_results.items():
            if 'error' not in metrics and 'f1_score' in metrics:
                if metrics['f1_score'] > best_score:
                    best_score = metrics['f1_score']
                    best_model_name = model_name
                    best_metrics = metrics
        
        if best_model_name is None:
            raise ValueError("No valid models found")
        
        best_model = self.best_models[best_model_name]
        
        logger.info(f"Best model: {best_model_name} with F1 score: {best_score:.4f}")
        
        return best_model_name, best_model, best_metrics
    
    def save_model(self, model_name: str, model: Any, feature_names: List[str]):
        """Save the trained model and metadata"""
        logger.info(f"Saving model: {model_name}")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save model
        model_path = self.output_dir / f"{model_name}_model_{timestamp}.joblib"
        joblib.dump(model, model_path)
        
        # Save metadata
        metadata = {
            'model_name': model_name,
            'training_timestamp': datetime.now().isoformat(),
            'feature_names': feature_names,
            'training_history': self.training_history.get(model_name, {}),
            'evaluation_results': self.evaluation_results.get(model_name, {}),
            'model_type': type(model).__name__
        }
        
        metadata_path = self.output_dir / f"{model_name}_metadata_{timestamp}.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        logger.info(f"Model saved to {model_path}")
        logger.info(f"Metadata saved to {metadata_path}")
        
        return model_path, metadata_path
    
    def create_model_comparison_plot(self):
        """Create comparison plot of all models"""
        logger.info("Creating model comparison plot...")
        
        models = list(self.evaluation_results.keys())
        metrics = ['accuracy', 'precision', 'recall', 'f1_score']
        
        # Prepare data for plotting
        plot_data = {metric: [] for metric in metrics}
        valid_models = []
        
        for model in models:
            if 'error' not in self.evaluation_results[model]:
                valid_models.append(model)
                for metric in metrics:
                    plot_data[metric].append(self.evaluation_results[model].get(metric, 0))
        
        # Create bar plot
        x = np.arange(len(valid_models))
        width = 0.2
        
        plt.figure(figsize=(12, 8))
        
        for i, metric in enumerate(metrics):
            plt.bar(x + i * width, plot_data[metric], width, label=metric.capitalize())
        
        plt.xlabel('Models')
        plt.ylabel('Score')
        plt.title('Model Performance Comparison')
        plt.xticks(x + width * 1.5, valid_models, rotation=45)
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        # Save the plot
        plot_path = self.output_dir / f"model_comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Model comparison plot saved to {plot_path}")
    
    def generate_training_report(self) -> Dict[str, Any]:
        """Generate comprehensive training report"""
        logger.info("Generating training report...")
        
        report = {
            'training_timestamp': datetime.now().isoformat(),
            'models_trained': list(self.models.keys()),
            'successful_models': [],
            'failed_models': [],
            'best_model': None,
            'model_performance': {},
            'training_summary': {}
        }
        
        # Analyze results
        for model_name, metrics in self.evaluation_results.items():
            if 'error' in metrics:
                report['failed_models'].append({
                    'model': model_name,
                    'error': metrics['error']
                })
            else:
                report['successful_models'].append(model_name)
                report['model_performance'][model_name] = {
                    'accuracy': metrics.get('accuracy', 0),
                    'precision': metrics.get('precision', 0),
                    'recall': metrics.get('recall', 0),
                    'f1_score': metrics.get('f1_score', 0),
                    'auc': metrics.get('auc', 0),
                    'cv_mean': metrics.get('cross_validation', {}).get('cv_mean', 0)
                }
        
        # Find best model
        if report['successful_models']:
            best_model_name = max(report['successful_models'], 
                                 key=lambda x: report['model_performance'][x]['f1_score'])
            report['best_model'] = {
                'name': best_model_name,
                'performance': report['model_performance'][best_model_name]
            }
        
        # Training summary
        report['training_summary'] = {
            'total_models': len(self.models),
            'successful': len(report['successful_models']),
            'failed': len(report['failed_models']),
            'success_rate': len(report['successful_models']) / len(self.models) * 100
        }
        
        # Save report
        report_path = self.output_dir / f"training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Training report saved to {report_path}")
        return report
    
    def run_full_training_pipeline(self, target_column: str = 'difficulty_category') -> Dict[str, Any]:
        """Run the complete training pipeline"""
        logger.info("Starting full training pipeline...")
        
        # Load data
        train_df, test_df = self.load_processed_data()
        
        # Prepare features and targets
        X_train, X_test, y_train, y_test, feature_names = self.prepare_features_and_targets(
            train_df, test_df, target_column
        )
        
        # Train all models
        results = self.train_all_models(X_train, X_test, y_train, y_test)
        
        # Select best model
        best_model_name, best_model, best_metrics = self.select_best_model()
        
        # Save best model
        model_path, metadata_path = self.save_model(best_model_name, best_model, feature_names)
        
        # Create comparison plot
        self.create_model_comparison_plot()
        
        # Generate training report
        report = self.generate_training_report()
        
        logger.info("Training pipeline completed successfully!")
        logger.info(f"Best model: {best_model_name}")
        logger.info(f"Model saved to: {model_path}")
        
        return {
            'best_model_name': best_model_name,
            'best_model': best_model,
            'best_metrics': best_metrics,
            'model_path': model_path,
            'metadata_path': metadata_path,
            'training_report': report
        }

if __name__ == "__main__":
    # Initialize trainer
    trainer = EducationalModelTrainer()
    
    # Run full training pipeline
    results = trainer.run_full_training_pipeline()
    
    print(f"\nTraining completed!")
    print(f"Best model: {results['best_model_name']}")
    print(f"F1 Score: {results['best_metrics']['f1_score']:.4f}")
    print(f"Accuracy: {results['best_metrics']['accuracy']:.4f}")
    print(f"Model saved to: {results['model_path']}")
