#!/usr/bin/env python3
"""
Train only SVM and Neural Network models on existing 4GB dataset
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "lib"))

from model_training import EducationalModelTrainer
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('svm_nn_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Train only SVM and Neural Network"""
    logger.info("="*60)
    logger.info("TRAINING SVM AND NEURAL NETWORK")
    logger.info("="*60)
    
    trainer = EducationalModelTrainer(
        data_dir="processed_datasets",
        output_dir="models"
    )
    
    # Remove all models except SVM and Neural Network
    models_to_train = ['svm', 'neural_network']
    trainer.models = {k: v for k, v in trainer.models.items() if k in models_to_train}
    
    logger.info(f"Training models: {list(trainer.models.keys())}")
    
    # Run training
    results = trainer.run_full_training_pipeline(target_column='difficulty_category')
    
    logger.info("="*60)
    logger.info("TRAINING COMPLETE!")
    logger.info(f"Best Model: {results['best_model_name']}")
    logger.info(f"Accuracy: {results['best_metrics']['accuracy']:.4f}")
    logger.info(f"F1 Score: {results['best_metrics']['f1_score']:.4f}")
    logger.info("="*60)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
