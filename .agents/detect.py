import json
from pathlib import Path
from graphify.detect import detect

# Resolve root directory of the repo (parent of .agents)
project_root = Path(__file__).resolve().parent.parent if Path(__file__).resolve().parent.name == ".agents" else Path(".")
result = detect(project_root)
out_dir = project_root / "graphify-out"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / ".graphify_detect.json").write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
print(f"Detected {result['total_files']} files across {project_root}")

