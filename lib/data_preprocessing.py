import pandas as pd
import numpy as np
import json
import re
from typing import List, Dict, Any, Tuple
from datetime import datetime
import logging
from pathlib import Path
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import joblib
import warnings
warnings.filterwarnings('ignore')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EducationalDataPreprocessor:
    """Comprehensive data preprocessing pipeline for educational datasets"""
    
    def __init__(self, input_dir: str = "datasets", output_dir: str = "processed_datasets"):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Set random seeds for reproducibility
        np.random.seed(42)
        
        # Preprocessing parameters
        self.min_text_length = 10
        self.max_text_length = 1000
        self.min_rating = 3.0
        
        # Initialize encoders
        self.label_encoders = {}
        self.scalers = {}
        self.vectorizer = None
        
    def load_raw_data(self) -> pd.DataFrame:
        """Load and combine data from all sources"""
        logger.info("Loading raw data from all sources...")
        
        all_data = []
        
        # Find all JSON files in input directory
        json_files = list(self.input_dir.glob("*_raw_*.json"))
        
        if not json_files:
            raise FileNotFoundError(f"No raw data files found in {self.input_dir}")
        
        for file_path in json_files:
            logger.info(f"Loading data from {file_path}")
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, list):
                df = pd.DataFrame(data)
                df['source_file'] = file_path.stem
                all_data.append(df)
        
        if not all_data:
            raise ValueError("No valid data found in files")
        
        combined_df = pd.concat(all_data, ignore_index=True)
        logger.info(f"Combined dataset shape: {combined_df.shape}")
        
        return combined_df
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text data"""
        if pd.isna(text) or not isinstance(text, str):
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove special characters but keep essential punctuation
        text = re.sub(r'[^\w\s\.\!\?\,\;\:\-\(\)\[\]\{\}\"\'\/\\]', ' ', text)
        
        # Normalize multiple punctuation
        text = re.sub(r'([.!?])\1+', r'\1', text)
        
        # Remove extra spaces again
        text = re.sub(r'\s+', ' ', text.strip())
        
        return text
    
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the dataset"""
        logger.info("Handling missing values...")
        
        # Initial missing value analysis
        missing_analysis = df.isnull().sum()
        logger.info(f"Missing values before cleaning:\n{missing_analysis[missing_analysis > 0]}")
        
        # Handle text columns
        text_columns = ['question', 'answer', 'explanation']
        for col in text_columns:
            if col in df.columns:
                df[col] = df[col].fillna("")
                df[col] = df[col].apply(self.clean_text)
        
        # Handle categorical columns
        categorical_columns = ['subject', 'topic', 'difficulty', 'source']
        for col in categorical_columns:
            if col in df.columns:
                df[col] = df[col].fillna("unknown")
                df[col] = df[col].astype(str)
        
        # Handle numerical columns
        numerical_columns = ['rating', 'views', 'votes']
        for col in numerical_columns:
            if col in df.columns:
                # Fill with median for robust statistics
                median_value = df[col].median()
                df[col] = df[col].fillna(median_value)
        
        # Handle timestamp
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            # Fill missing timestamps with current date
            df['timestamp'] = df['timestamp'].fillna(datetime.now())
        
        logger.info("Missing values handled successfully")
        return df
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate entries"""
        logger.info("Removing duplicates...")
        
        initial_count = len(df)
        
        # Convert list columns to strings for duplicate detection
        list_columns = []
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check if column contains lists
                sample_values = df[col].dropna().head()
                if len(sample_values) > 0 and isinstance(sample_values.iloc[0], list):
                    list_columns.append(col)
                    df[col] = df[col].apply(lambda x: str(x) if isinstance(x, list) else x)
        
        # Remove exact duplicates
        df = df.drop_duplicates()
        
        # Remove near-duplicates based on question similarity
        if 'question' in df.columns:
            # Create a simplified version of questions for comparison
            df['question_simple'] = df['question'].str.lower().str.replace(r'[^\w\s]', '', regex=True)
            df['question_simple'] = df['question_simple'].str.replace(r'\s+', ' ', regex=True).str.strip()
            
            # Remove duplicates based on simplified questions
            df = df.drop_duplicates(subset=['question_simple'], keep='first')
            df = df.drop('question_simple', axis=1)
        
        final_count = len(df)
        duplicates_removed = initial_count - final_count
        
        logger.info(f"Removed {duplicates_removed} duplicate entries ({duplicates_removed/initial_count:.2%})")
        return df
    
    def filter_quality_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Filter data based on quality criteria"""
        logger.info("Filtering data based on quality criteria...")
        
        initial_count = len(df)
        
        # Filter by text length
        if 'question' in df.columns:
            df = df[df['question'].str.len() >= self.min_text_length]
            df = df[df['question'].str.len() <= self.max_text_length]
        
        if 'answer' in df.columns:
            df = df[df['answer'].str.len() >= self.min_text_length]
            df = df[df['answer'].str.len() <= self.max_text_length]
        
        # Filter by rating if available
        if 'rating' in df.columns:
            df = df[df['rating'] >= self.min_rating]
        
        # Filter by views/votes if available (remove very low engagement content)
        if 'views' in df.columns:
            df = df[df['views'] >= 10]  # Minimum views threshold
        
        if 'votes' in df.columns:
            df = df[df['votes'] >= -2]  # Remove heavily downvoted content
        
        final_count = len(df)
        filtered_count = initial_count - final_count
        
        logger.info(f"Filtered out {filtered_count} low-quality entries ({filtered_count/initial_count:.2%})")
        return df
    
    def encode_categorical_variables(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical variables"""
        logger.info("Encoding categorical variables...")
        
        categorical_columns = ['subject', 'topic', 'difficulty', 'source']
        
        for col in categorical_columns:
            if col in df.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                
                # Handle unseen categories by fitting on all unique values
                unique_values = df[col].unique()
                self.label_encoders[col].fit(unique_values)
                
                df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col])
                
                logger.info(f"Encoded {col}: {len(unique_values)} unique values")
        
        return df
    
    def scale_numerical_variables(self, df: pd.DataFrame) -> pd.DataFrame:
        """Scale numerical variables"""
        logger.info("Scaling numerical variables...")
        
        numerical_columns = ['rating', 'views', 'votes']
        
        for col in numerical_columns:
            if col in df.columns:
                if col not in self.scalers:
                    self.scalers[col] = StandardScaler()
                
                df[f'{col}_scaled'] = self.scalers[col].fit_transform(df[[col]])
                
                logger.info(f"Scaled {col}: min={df[col].min():.2f}, max={df[col].max():.2f}")
        
        return df
    
    def create_text_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create text-based features"""
        logger.info("Creating text features...")
        
        # Text length features
        if 'question' in df.columns:
            df['question_length'] = df['question'].str.len()
            df['question_word_count'] = df['question'].str.split().str.len()
        
        if 'answer' in df.columns:
            df['answer_length'] = df['answer'].str.len()
            df['answer_word_count'] = df['answer'].str.split().str.len()
        
        # Text complexity features (simplified)
        if 'question' in df.columns:
            df['question_avg_word_length'] = df['question'].apply(
                lambda x: np.mean([len(word) for word in x.split()]) if x.split() else 0
            )
        
        return df
    
    def vectorize_text(self, df: pd.DataFrame, max_features: int = 1000) -> pd.DataFrame:
        """Vectorize text data using TF-IDF"""
        logger.info("Vectorizing text data...")
        
        # Combine question and answer for vectorization
        if 'question' in df.columns and 'answer' in df.columns:
            text_data = (df['question'] + ' ' + df['answer']).fillna("")
        elif 'question' in df.columns:
            text_data = df['question'].fillna("")
        else:
            logger.warning("No text columns found for vectorization")
            return df
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        
        # Fit and transform text data
        tfidf_matrix = self.vectorizer.fit_transform(text_data)
        
        # Convert to DataFrame and merge
        feature_names = [f'tfidf_{i}' for i in range(tfidf_matrix.shape[1])]
        tfidf_df = pd.DataFrame(
            tfidf_matrix.toarray(),
            columns=feature_names,
            index=df.index
        )
        
        # Combine with original dataframe
        df = pd.concat([df, tfidf_df], axis=1)
        
        logger.info(f"Created {len(feature_names)} TF-IDF features")
        return df
    
    def create_target_variable(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create target variable for supervised learning"""
        logger.info("Creating target variable...")
        
        # Create difficulty classification target
        if 'difficulty' in df.columns:
            # Map difficulty to numeric levels
            difficulty_mapping = {
                'beginner': 0,
                'easy': 0,
                'medium': 1,
                'intermediate': 1,
                'hard': 2,
                'advanced': 2
            }
            
            df['difficulty_level'] = df['difficulty'].map(difficulty_mapping).fillna(1)
            
            # Create categorical target for classification
            df['difficulty_category'] = pd.cut(
                df['difficulty_level'],
                bins=[-1, 0.5, 1.5, 3],
                labels=['beginner', 'intermediate', 'advanced']
            )
        
        # Create engagement score as alternative target
        engagement_features = []
        if 'views' in df.columns:
            engagement_features.append('views')
        if 'votes' in df.columns:
            engagement_features.append('votes')
        if 'rating' in df.columns:
            engagement_features.append('rating')
        
        if engagement_features:
            # Normalize and combine engagement features
            df['engagement_score'] = df[engagement_features].apply(
                lambda x: (x - x.min()) / (x.max() - x.min()) if x.max() > x.min() else 0
            ).sum(axis=1) / len(engagement_features)
            
            # Create engagement categories
            df['engagement_category'] = pd.cut(
                df['engagement_score'],
                bins=[0, 0.33, 0.67, 1.0],
                labels=['low', 'medium', 'high']
            )
        
        return df
    
    def split_dataset(self, df: pd.DataFrame, test_size: float = 0.2, 
                     stratify_column: str = 'difficulty_category') -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split dataset into training and testing sets with stratification"""
        logger.info(f"Splitting dataset (test_size={test_size})...")
        
        # Ensure stratification column exists
        if stratify_column not in df.columns:
            logger.warning(f"Stratification column '{stratify_column}' not found, using random split")
            stratify = None
        else:
            stratify = df[stratify_column]
        
        # Perform stratified split
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            random_state=42,
            stratify=stratify
        )
        
        logger.info(f"Training set: {len(train_df)} samples ({len(train_df)/len(df):.2%})")
        logger.info(f"Test set: {len(test_df)} samples ({len(test_df)/len(df):.2%})")
        
        return train_df, test_df
    
    def generate_preprocessing_report(self, df: pd.DataFrame, train_df: pd.DataFrame, test_df: pd.DataFrame):
        """Generate comprehensive preprocessing report"""
        logger.info("Generating preprocessing report...")
        
        report = {
            'preprocessing_timestamp': datetime.now().isoformat(),
            'dataset_overview': {
                'total_samples': len(df),
                'training_samples': len(train_df),
                'test_samples': len(test_df),
                'features': len(df.columns),
                'memory_usage_mb': df.memory_usage(deep=True).sum() / 1024**2
            },
            'data_quality': {
                'missing_values_after_cleaning': df.isnull().sum().sum(),
                'duplicate_rows_removed': len(df) - len(df.drop_duplicates()),
                'text_length_stats': {
                    'min_question_length': df['question'].str.len().min() if 'question' in df.columns else 0,
                    'max_question_length': df['question'].str.len().max() if 'question' in df.columns else 0,
                    'avg_question_length': df['question'].str.len().mean() if 'question' in df.columns else 0
                }
            },
            'feature_engineering': {
                'categorical_variables_encoded': len(self.label_encoders),
                'numerical_variables_scaled': len(self.scalers),
                'text_features_created': len([col for col in df.columns if 'tfidf_' in col]),
                'target_variables_created': ['difficulty_level', 'engagement_score']
            },
            'class_distribution': {}
        }
        
        # Add class distribution if target variables exist
        if 'difficulty_category' in df.columns:
            report['class_distribution']['difficulty'] = df['difficulty_category'].value_counts().to_dict()
        
        if 'engagement_category' in df.columns:
            report['class_distribution']['engagement'] = df['engagement_category'].value_counts().to_dict()
        
        # Save report
        report_path = self.output_dir / f"preprocessing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Preprocessing report saved to {report_path}")
        return report
    
    def save_processed_data(self, train_df: pd.DataFrame, test_df: pd.DataFrame):
        """Save processed datasets"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save training data
        train_path = self.output_dir / f"train_data_{timestamp}.csv"
        train_df.to_csv(train_path, index=False)
        
        # Save test data
        test_path = self.output_dir / f"test_data_{timestamp}.csv"
        test_df.to_csv(test_path, index=False)
        
        # Save encoders and scalers
        encoders_path = self.output_dir / f"encoders_{timestamp}.json"
        encoders_data = {}
        for name, encoder in self.label_encoders.items():
            encoders_data[name] = {
                'classes': encoder.classes_.tolist(),
                'dtype': str(encoder.classes_.dtype)
            }
        
        with open(encoders_path, 'w') as f:
            json.dump(encoders_data, f, indent=2)

        # Persist preprocessing artifacts for inference reuse
        artifacts_path = self.output_dir / f"preprocessing_artifacts_{timestamp}.joblib"
        joblib.dump({
            'label_encoders': self.label_encoders,
            'scalers': self.scalers,
            'vectorizer': self.vectorizer
        }, artifacts_path)

        logger.info(f"Processed data saved:")
        logger.info(f"  Training data: {train_path}")
        logger.info(f"  Test data: {test_path}")
        logger.info(f"  Encoders: {encoders_path}")
        logger.info(f"  Artifacts: {artifacts_path}")
    
    def create_visualizations(self, df: pd.DataFrame):
        """Create data visualization plots"""
        logger.info("Creating data visualizations...")
        
        # ... (rest of the code remains the same)
        plt.style.use('seaborn-v0_8')
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        fig.suptitle('Educational Dataset Analysis', fontsize=16)
        
        # 1. Subject distribution
        if 'subject' in df.columns:
            subject_counts = df['subject'].value_counts()
            axes[0, 0].pie(subject_counts.values, labels=subject_counts.index, autopct='%1.1f%%')
            axes[0, 0].set_title('Subject Distribution')
        
        # 2. Difficulty distribution
        if 'difficulty' in df.columns:
            difficulty_counts = df['difficulty'].value_counts()
            axes[0, 1].bar(difficulty_counts.index, difficulty_counts.values)
            axes[0, 1].set_title('Difficulty Distribution')
            axes[0, 1].set_xlabel('Difficulty')
            axes[0, 1].set_ylabel('Count')
        
        # 3. Text length distribution
        if 'question_length' in df.columns:
            axes[1, 0].hist(df['question_length'], bins=30, alpha=0.7)
            axes[1, 0].set_title('Question Length Distribution')
            axes[1, 0].set_xlabel('Character Count')
            axes[1, 0].set_ylabel('Frequency')
        
        # 4. Source distribution
        if 'source' in df.columns:
            source_counts = df['source'].value_counts()
            axes[1, 1].bar(source_counts.index, source_counts.values)
            axes[1, 1].set_title('Source Distribution')
            axes[1, 1].set_xlabel('Source')
            axes[1, 1].set_ylabel('Count')
            axes[1, 1].tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # Save the plot
        plot_path = self.output_dir / f"data_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Visualization saved to {plot_path}")
    
    def run_full_preprocessing_pipeline(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Run the complete preprocessing pipeline"""
        logger.info("Starting full preprocessing pipeline...")
        
        # Load raw data
        df = self.load_raw_data()
        
        # Step 1: Handle missing values
        df = self.handle_missing_values(df)
        
        # Step 2: Remove duplicates
        df = self.remove_duplicates(df)
        
        # Step 3: Filter quality data
        df = self.filter_quality_data(df)
        
        # Step 4: Encode categorical variables
        df = self.encode_categorical_variables(df)
        
        # Step 5: Scale numerical variables
        df = self.scale_numerical_variables(df)
        
        # Step 6: Create text features
        df = self.create_text_features(df)
        
        # Step 7: Vectorize text
        df = self.vectorize_text(df)
        
        # Step 8: Create target variables
        df = self.create_target_variable(df)
        
        # Step 9: Split dataset
        train_df, test_df = self.split_dataset(df)
        
        # Step 10: Generate report
        self.generate_preprocessing_report(df, train_df, test_df)
        
        # Step 11: Create visualizations
        self.create_visualizations(df)
        
        # Step 12: Save processed data
        self.save_processed_data(train_df, test_df)
        
        logger.info("Preprocessing pipeline completed successfully!")
        return train_df, test_df

if __name__ == "__main__":
    # Initialize preprocessor
    preprocessor = EducationalDataPreprocessor()
    
    # Run full preprocessing pipeline
    train_data, test_data = preprocessor.run_full_preprocessing_pipeline()
    
    print(f"\nPreprocessing completed!")
    print(f"Training set shape: {train_data.shape}")
    print(f"Test set shape: {test_data.shape}")
    print(f"Features created: {len(train_data.columns)}")
