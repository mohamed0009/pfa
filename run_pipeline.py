#!/usr/bin/env python3
"""
Educational ML Pipeline Runner
Complete pipeline for dataset collection, preprocessing, and model training
"""

import sys
import os
import argparse
import logging
from pathlib import Path
from datetime import datetime

# Add lib directory to path
sys.path.append(str(Path(__file__).parent / "lib"))

try:
    from data_collection import EducationalDatasetCollector
    from data_preprocessing import EducationalDataPreprocessor
    from model_training import EducationalModelTrainer
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure all required files are in the lib/ directory")
    sys.exit(1)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_data_collection(args):
    """Run data collection pipeline"""
    logger.info("="*50)
    logger.info("STARTING DATA COLLECTION")
    logger.info("="*50)
    
    collector = EducationalDatasetCollector(output_dir=args.data_dir)
    
    # Collect data from all sources
    data = collector.collect_all_data()
    
    # Save raw data
    collector.save_raw_data()
    
    # Generate and display statistics
    stats = collector.get_dataset_statistics()
    logger.info(f"Collection completed. Total items: {stats['total_items']}")
    
    return True

def run_data_preprocessing(args):
    """Run data preprocessing pipeline"""
    logger.info("="*50)
    logger.info("STARTING DATA PREPROCESSING")
    logger.info("="*50)
    
    preprocessor = EducationalDataPreprocessor(
        input_dir=args.data_dir,
        output_dir=args.processed_dir
    )
    
    # Run full preprocessing pipeline
    train_df, test_df = preprocessor.run_full_preprocessing_pipeline()
    
    logger.info(f"Preprocessing completed. Train: {len(train_df)}, Test: {len(test_df)}")
    
    return True

def run_model_training(args):
    """Run model training pipeline"""
    logger.info("="*50)
    logger.info("STARTING MODEL TRAINING")
    logger.info("="*50)
    
    trainer = EducationalModelTrainer(
        data_dir=args.processed_dir,
        output_dir=args.models_dir
    )
    
    # Run full training pipeline
    results = trainer.run_full_training_pipeline(target_column=args.target)
    
    logger.info(f"Training completed. Best model: {results['best_model_name']}")
    logger.info(f"F1 Score: {results['best_metrics']['f1_score']:.4f}")
    
    return True

def run_full_pipeline(args):
    """Run the complete pipeline"""
    logger.info("="*60)
    logger.info("STARTING COMPLETE EDUCATIONAL ML PIPELINE")
    logger.info("="*60)
    
    start_time = datetime.now()
    
    try:
        # Step 1: Data Collection
        if not run_data_collection(args):
            logger.error("Data collection failed")
            return False
        
        # Step 2: Data Preprocessing
        if not run_data_preprocessing(args):
            logger.error("Data preprocessing failed")
            return False
        
        # Step 3: Model Training
        if not run_model_training(args):
            logger.error("Model training failed")
            return False
        
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info("="*60)
        logger.info("PIPELINE COMPLETED SUCCESSFULLY!")
        logger.info(f"Total Duration: {duration}")
        logger.info("="*60)
        
        return True
        
    except Exception as e:
        logger.error(f"Pipeline failed with error: {str(e)}")
        return False

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Educational ML Pipeline - Complete dataset collection and model training"
    )
    
    parser.add_argument(
        "--stage",
        choices=["collect", "preprocess", "train", "full"],
        default="full",
        help="Pipeline stage to run (default: full)"
    )
    
    parser.add_argument(
        "--data-dir",
        default="datasets",
        help="Directory for raw data (default: datasets)"
    )
    
    parser.add_argument(
        "--processed-dir",
        default="processed_datasets",
        help="Directory for processed data (default: processed_datasets)"
    )
    
    parser.add_argument(
        "--models-dir",
        default="models",
        help="Directory for trained models (default: models)"
    )
    
    parser.add_argument(
        "--target",
        default="difficulty_category",
        help="Target variable for training (default: difficulty_category)"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create directories
    Path(args.data_dir).mkdir(exist_ok=True)
    Path(args.processed_dir).mkdir(exist_ok=True)
    Path(args.models_dir).mkdir(exist_ok=True)
    
    # Run pipeline based on stage
    success = False
    
    if args.stage == "collect":
        success = run_data_collection(args)
    elif args.stage == "preprocess":
        success = run_data_preprocessing(args)
    elif args.stage == "train":
        success = run_model_training(args)
    elif args.stage == "full":
        success = run_full_pipeline(args)
    
    if success:
        logger.info("Pipeline execution completed successfully!")
        return 0
    else:
        logger.error("Pipeline execution failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
