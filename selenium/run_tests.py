"""
Script pour exécuter les tests Selenium
"""
import subprocess
import sys
import os

def run_tests():
    """Exécuter les tests Selenium"""
    
    # Options de pytest
    pytest_args = [
        "pytest",
        "tests/",
        "-v",  # Verbose
        "--html=reports/report.html",  # Rapport HTML
        "--self-contained-html",  # Rapport HTML autonome
        "-n", "auto",  # Exécution en parallèle (si pytest-xdist est installé)
    ]
    
    # Ajouter des arguments depuis la ligne de commande
    if len(sys.argv) > 1:
        pytest_args.extend(sys.argv[1:])
    
    # Créer le dossier reports s'il n'existe pas
    os.makedirs("reports", exist_ok=True)
    os.makedirs("screenshots", exist_ok=True)
    
    # Exécuter les tests
    result = subprocess.run(pytest_args)
    
    return result.returncode

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)

