
import sys
import pandas as pd
import numpy as np
import json
from pathlib import Path
import joblib

# Add lib to path
sys.path.append(str(Path(__file__).parent / "lib"))

def recover():
    data_dir = Path("processed_datasets")
    model_dir = Path("models")
    
    # 1. Load train data
    train_files = list(data_dir.glob("train_data_*.csv"))
    if not train_files:
        print("No training data found.")
        return
    train_file = max(train_files, key=lambda x: x.stat().st_mtime)
    print(f"Loading {train_file}...")
    train_df = pd.read_csv(train_file)
    
    # 2. Reconstruct feature names using logic from EducationalModelTrainer.prepare_features_and_targets
    target_column = 'difficulty_category'
    exclude_columns = [target_column, 'difficulty_level', 'engagement_score', 
                      'engagement_category', 'question', 'answer', 'explanation']
    
    feature_columns = [col for col in train_df.columns if col not in exclude_columns]
    
    numeric_features = []
    for col in feature_columns:
        if train_df[col].dtype in ['int64', 'float64']:
            numeric_features.append(col)
        else:
            pass # Exclude non-numeric
            
    feature_names = numeric_features
    print(f"Recovered {len(feature_names)} features.")
    
    # 3. Create metadata file for the latest model
    model_files = list(model_dir.glob("*_model_*.joblib"))
    if not model_files:
        print("No model files found.")
        return
    
    # Group by timestamp/name
    latest_model = max(model_files, key=lambda x: x.stat().st_mtime)
    
    # Construct metadata filename
    # e.g. gradient_boosting_model_20251215_035939.joblib -> gradient_boosting_metadata_20251215_035939.json
    model_name_parts = latest_model.stem.split("_model_")
    if len(model_name_parts) != 2:
        print(f"Could not parse model name: {latest_model.name}")
        # Try a fallback or assume it is the one we want
    
    metadata_filename = latest_model.name.replace("_model_", "_metadata_").replace(".joblib", ".json")
    metadata_path = model_dir / metadata_filename
    
    print(f"Creating metadata file: {metadata_path}")
    
    metadata = {
        'model_name': model_name_parts[0],
        'training_timestamp': "RECOVERED",
        'feature_names': feature_names,
        'note': "Recovered via script"
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print("Done.")

if __name__ == "__main__":
    recover()
