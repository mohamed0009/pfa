#!/usr/bin/env python3
"""
Quick script to generate 4GB dataset and train model
"""
import sys
import os
from pathlib import Path

# Add lib directory to path
sys.path.append(str(Path(__file__).parent / "lib"))

from data_collection import EducationalDatasetCollector
from data_preprocessing import EducationalDataPreprocessor
from model_training import EducationalModelTrainer
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """Run complete pipeline with 4GB dataset"""
    logger.info("="*60)
    logger.info("STARTING 4GB DATASET TRAINING PIPELINE")
    logger.info("="*60)
    
    # Step 1: Collect 4GB of data
    logger.info("Step 1: Collecting ~4GB of educational data...")
    collector = EducationalDatasetCollector(output_dir="datasets")
    data = collector.collect_all_data()
    collector.save_raw_data()
    stats = collector.get_dataset_statistics()
    logger.info(f"Data collection complete. Total items: {stats['total_items']}")
    
    # Step 2: Preprocess data
    logger.info("Step 2: Preprocessing data...")
    preprocessor = EducationalDataPreprocessor(
        input_dir="datasets",
        output_dir="processed_datasets"
    )
    train_df, test_df = preprocessor.run_full_preprocessing_pipeline()
    logger.info(f"Preprocessing complete. Train: {len(train_df)}, Test: {len(test_df)}")
    
    # Step 3: Train model
    logger.info("Step 3: Training model...")
    trainer = EducationalModelTrainer(
        data_dir="processed_datasets",
        output_dir="models"
    )
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
