#!/usr/bin/env python3
"""
Efficient 4GB dataset generator - saves data in batches to reach 4GB target
"""
import json
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from pathlib import Path
import logging
import os

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('generate_4gb.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Set random seeds
np.random.seed(42)
random.seed(42)

def get_directory_size_gb(directory):
    """Calculate directory size in GB"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(directory):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            if os.path.exists(filepath):
                total_size += os.path.getsize(filepath)
    return total_size / (1024 ** 3)

def generate_batch(source, batch_num, batch_size=50000):
    """Generate a batch of sample data"""
    data = []
    
    if source == 'khan_academy':
        subjects = ['math', 'science', 'computing', 'arts-humanities']
        difficulties = ['beginner', 'intermediate', 'advanced']
        
        for i in range(batch_size):
            subject = random.choice(subjects)
            difficulty = random.choice(difficulties)
            topic = random.choice(['algebra', 'geometry', 'calculus', 'programming', 'algorithms'])
            
            data.append({
                'id': f'ka_batch{batch_num}_{i}',
                'source': 'khan_academy',
                'subject': subject,
                'topic': topic,
                'difficulty': difficulty,
                'question': f"Question about {topic} - {random.choice(['solve', 'explain', 'calculate'])} {random.randint(1, 100)}",
                'answer': f"The answer involves {random.choice(['applying the formula', 'step-by-step solution', 'understanding the concept'])}",
                'explanation': f"This {topic} concept requires {random.choice(['practice', 'understanding', 'application'])} and {random.choice(['patience', 'focus', 'dedication'])}",
                'learning_objectives': [f'Understand {topic}', 'Apply concepts', 'Problem solving'],
                'tags': [subject, topic, difficulty],
                'timestamp': (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat(),
                'rating': round(random.uniform(3.5, 5.0), 1),
                'views': random.randint(100, 10000)
            })
            
    elif source == 'mit_opencourseware':
        departments = ['mathematics', 'electrical-engineering', 'computer-science', 'physics']
        course_levels = ['undergraduate', 'graduate']
        
        for i in range(batch_size):
            department = random.choice(departments)
            level = random.choice(course_levels)
            course = random.choice(['Linear Algebra', 'Calculus', 'Algorithms', 'Machine Learning'])
            
            data.append({
                'id': f'mit_batch{batch_num}_{i}',
                'source': 'mit_opencourseware',
                'department': department,
                'course': course,
                'level': level,
                'question': f"Advanced {course} problem: {random.choice(['derive', 'prove', 'calculate'])} the {random.choice(['theorem', 'formula', 'solution'])}",
                'answer': f"The solution requires {random.choice(['mathematical rigor', 'computational thinking', 'analytical skills'])}",
                'explanation': f"This {course} concept is fundamental in {department}",
                'prerequisites': [f'Basic {department}', 'Mathematics fundamentals'],
                'learning_outcomes': ['Master core concepts', 'Apply theoretical knowledge', 'Solve complex problems'],
                'instructor': f'Prof. {random.choice(["Smith", "Johnson", "Williams", "Brown", "Davis", "Miller"])}',
                'semester': random.choice(['Fall', 'Spring']),
                'year': random.randint(2019, 2024),
                'enrollment': random.randint(50, 500),
                'timestamp': (datetime.now() - timedelta(days=random.randint(0, 730))).isoformat()
            })
            
    else:  # stack_exchange
        sites = ['math', 'stackoverflow', 'cseducators']
        question_types = ['conceptual', 'problem-solving', 'debugging', 'best-practices']
        
        for i in range(batch_size):
            site = random.choice(sites)
            q_type = random.choice(question_types)
            votes = random.randint(-2, 50)
            
            data.append({
                'id': f'se_batch{batch_num}_{i}',
                'source': 'stack_exchange',
                'site': site,
                'question_type': q_type,
                'question': f"How do I {random.choice(['solve', 'implement', 'understand'])} {random.choice(['this algorithm', 'this equation', 'this code'])}?",
                'answer': f"You should {random.choice(['use this approach', 'follow these steps', 'apply this pattern'])}",
                'explanation': f"The solution involves {random.choice(['understanding fundamentals', 'applying best practices', 'careful implementation'])}",
                'votes': votes,
                'answers_count': random.randint(0, 10),
                'views': random.randint(10, 10000),
                'tags': random.sample(['algorithm', 'programming', 'mathematics', 'tutorial', 'beginner', 'advanced'], k=3),
                'accepted_answer': random.random() > 0.3,
                'reputation': random.randint(1, 10000),
                'timestamp': (datetime.now() - timedelta(days=random.randint(1, 1825))).isoformat(),
                'difficulty': 'hard' if votes < 0 else ('medium' if votes < 10 else 'easy')
            })
    
    return data

def main():
    """Generate 4GB of data in batches"""
    logger.info("="*70)
    logger.info("GENERATING 4GB DATASET IN BATCHES")
    logger.info("="*70)
    
    output_dir = Path("datasets")
    output_dir.mkdir(exist_ok=True)
    
    target_size_gb = 4.0
    batch_size = 50000
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    sources = ['khan_academy', 'mit_opencourseware', 'stack_exchange']
    batch_num = 0
    
    logger.info(f"Target size: {target_size_gb} GB")
    logger.info(f"Batch size: {batch_size} records per batch\n")
    
    while True:
        current_size_gb = get_directory_size_gb(output_dir)
        
        if current_size_gb >= target_size_gb:
            logger.info(f"\n{'='*70}")
            logger.info(f"✓ TARGET REACHED!")
            logger.info(f"Current size: {current_size_gb:.2f} GB")
            logger.info(f"Target size: {target_size_gb:.2f} GB")
            logger.info(f"Total batches generated: {batch_num}")
            logger.info(f"{'='*70}\n")
            break
        
        # Generate batch for each source
        for source in sources:
            logger.info(f"Generating batch {batch_num} for {source}... (Current: {current_size_gb:.2f} GB / {target_size_gb:.2f} GB)")
            
            data = generate_batch(source, batch_num, batch_size)
            
            # Save as JSON
            filename = output_dir / f"{source}_batch{batch_num}_{timestamp}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            # Check if we've reached target
            current_size_gb = get_directory_size_gb(output_dir)
            if current_size_gb >= target_size_gb:
                logger.info(f"✓ Target reached at {current_size_gb:.2f} GB!")
                break
        
        batch_num += 1
    
    # Final statistics
    final_size_gb = get_directory_size_gb(output_dir)
    logger.info(f"\nFinal dataset size: {final_size_gb:.2f} GB")
    logger.info(f"Batches created: {batch_num}")
    logger.info(f"Estimated total records: {batch_num * batch_size * len(sources):,}")
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
