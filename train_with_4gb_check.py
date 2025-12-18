#!/usr/bin/env python3
"""
Script to collect 4GB dataset and train model only if 4GB is reached
"""
import sys
import os
from pathlib import Path
import logging

# Add lib directory to path
sys.path.append(str(Path(__file__).parent / "lib"))

from data_collection import EducationalDatasetCollector
from data_preprocessing import EducationalDataPreprocessor
from model_training import EducationalModelTrainer

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training_4gb.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def get_directory_size_gb(directory):
    """Calculate directory size in GB"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    return total_size / (1024 ** 3)  # Convert to GB

def main():
    """Run pipeline with 4GB check"""
    logger.info("="*70)
    logger.info("4GB DATASET COLLECTION AND TRAINING PIPELINE")
    logger.info("="*70)
    
    # Step 1: Collect data
    logger.info("\nStep 1: Collecting data to reach 4GB target...")
    collector = EducationalDatasetCollector(output_dir="datasets")

    # Remove all old files in datasets directory to avoid duplicates and excess size
    logger.info("Clearing old files in datasets directory...")
    for filename in os.listdir("datasets"):
        file_path = os.path.join("datasets", filename)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.warning(f"Could not remove {file_path}: {e}")

    logger.info("Collecting new dataset...")
    data = collector.collect_all_data()
    collector.save_raw_data()
    
    # Check dataset size
    dataset_size_gb = get_directory_size_gb("datasets")
    logger.info(f"\n{'='*70}")
    logger.info(f"DATASET SIZE: {dataset_size_gb:.2f} GB")
    logger.info(f"TARGET SIZE: 4.00 GB")
    logger.info(f"{'='*70}\n")
    
    # Only proceed with training if we have at least 4GB
    if dataset_size_gb >= 4.0:
        logger.info("✓ Dataset size requirement met! Proceeding with training...")
        
        # Step 2: Preprocess data
        logger.info("\nStep 2: Preprocessing data...")
        preprocessor = EducationalDataPreprocessor(
            input_dir="datasets",
            output_dir="processed_datasets"
        )
        train_df, test_df = preprocessor.run_full_preprocessing_pipeline()
        logger.info(f"Preprocessing complete. Train: {len(train_df)}, Test: {len(test_df)}")
        
        # Step 3: Train model
        logger.info("\nStep 3: Training model...")
        trainer = EducationalModelTrainer(
            data_dir="processed_datasets",
            output_dir="models"
        )
        results = trainer.run_full_training_pipeline(target_column='difficulty_category')
        
        logger.info("\n" + "="*70)
        logger.info("TRAINING COMPLETE!")
        logger.info(f"Dataset Size: {dataset_size_gb:.2f} GB")
        logger.info(f"Best Model: {results['best_model_name']}")
        logger.info(f"Accuracy: {results['best_metrics']['accuracy']:.4f}")
        logger.info(f"F1 Score: {results['best_metrics']['f1_score']:.4f}")
        logger.info("="*70)
        
        return 0
    else:
        logger.error("\n" + "="*70)
        logger.error(f"✗ DATASET SIZE TOO SMALL!")
        logger.error(f"Current size: {dataset_size_gb:.2f} GB")
        logger.error(f"Required size: 4.00 GB")
        logger.error(f"Shortfall: {4.0 - dataset_size_gb:.2f} GB")
        logger.error("TRAINING CANCELLED - Dataset does not meet 4GB requirement")
        logger.error("="*70)
        return 1

if __name__ == "__main__":
    sys.exit(main())
