#!/usr/bin/env bash
# Membuat GitHub Ruleset "protect-main" untuk branch `main`.
#
# - Dokumentatif/reproduksibel saja: jalankan MANUAL oleh maintainer berizin admin.
# - Tidak dijalankan oleh CI atau oleh perubahan PR ini.
# - Prasyarat: `gh` terinstal dan login sebagai admin repo (gh auth login).
#
# Aturan yang dibuat:
#   - direct push ke `main` ditolak (wajib pull request)
#   - minimal 1 approval non-author
#   - required status checks wajib hijau (disesuaikan dengan check CI yang ada)
#   - squash merge direkomendasikan via pengaturan repo (lihat catatan di bawah)
#
# Catatan: metode merge yang diizinkan (mis. squash-only) dikonfigurasi di
# pengaturan repo (Settings → General → Pull Requests), bukan di payload ruleset.

set -euo pipefail

OWNER="${OWNER:-nikamushi}"
REPO="${REPO:-heliora}"

PAYLOAD="$(cat <<'JSON'
{
  "name": "protect-main",
  "enforcement": "active",
  "target": "branch",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "creation" },
    { "type": "update" },
    { "type": "deletion" },
    { "type": "required_linear_history" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          { "context": "CI Gate" }
        ]
      }
    }
  ]
}
JSON
)"

echo "Membuat ruleset 'protect-main' di ${OWNER}/${REPO}..."
gh api -X POST "repos/${OWNER}/${REPO}/rulesets" \
  -H "Accept: application/vnd.github+json" \
  --input <(printf '%s' "$PAYLOAD")

echo "Selesai. Verifikasi dengan:"
echo "  gh api repos/${OWNER}/${REPO}/rulesets --jq '.[].name'"
echo ""
echo "Ruleset memakai required check 'CI Gate' (lihat docs/CI-CD.md)."
