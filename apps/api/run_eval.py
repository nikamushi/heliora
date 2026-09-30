"""Run evaluation and print results."""
import json
import logging
import sys

sys.path.insert(0, ".")

logging.basicConfig(level=logging.INFO)

from app.ai.evaluation import _serialize_report, evaluate_risk_engine  # noqa: E402

result = evaluate_risk_engine(n_samples=1000, seed=42)
report = _serialize_report(result)

with open("evaluation_report.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)

print("Eval done. Writing report...")
print()
print("=== Results ===")
for c in result.conditions:
    print(f"{c.condition}: precision={c.precision}, recall={c.recall}, f1={c.f1}, roc_auc={c.roc_auc}, brier={c.brier_score}")
print(f"Overall accuracy: {result.overall_accuracy}")
print(f"Runtime: {result.runtime_seconds}s")
