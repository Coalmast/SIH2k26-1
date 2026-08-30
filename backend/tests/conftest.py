import sys
import os

# Add the backend directory to sys.path so we can import models, schemas, etc.
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
