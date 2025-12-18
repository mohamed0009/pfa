#!/usr/bin/env python3
"""
Preprocess 4GB data and train SVM + Neural Network
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent / "lib"))

from data_preprocessing import EducationalDataPreprocessor
from model_training import EducationalModelTrainer
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('preprocess_and_train.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Preprocess 4GB data then train SVM and NN"""
    logger.info("="*60)
    logger.info("PREPROCESSING 4GB DATA AND TRAINING SVM + NN")
    logger.info("="*60)
    
    # Step 1: Preprocess the 4GB raw data
    logger.info("Step 1: Preprocessing 4GB raw dataset...")
    preprocessor = EducationalDataPreprocessor(
        input_dir="datasets",
        output_dir="processed_datasets"
    )
    train_df, test_df = preprocessor.run_full_preprocessing_pipeline()
    logger.info(f"Preprocessing complete. Train: {len(train_df)}, Test: {len(test_df)}")
    
    # Step 2: Train only SVM and Neural Network
    logger.info("Step 2: Training SVM and Neural Network...")
    trainer = EducationalModelTrainer(
        data_dir="processed_datasets",
        output_dir="models"
    )
    
    # Keep only SVM and Neural Network
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
