import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.main import app

with open("openapi.json", "w") as f:
    json.dump(app.openapi(), f, indent=2)
