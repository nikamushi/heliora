<#
.SYNOPSIS
    Toggle skill Antigravity antara aktif dan nonaktif.
.PARAMETER SkillName
    Nama skill (default: to-tickets)
.PARAMETER Action
    Aksi: 'on' / 'enable' / 'aktif' atau 'off' / 'disable' / 'nonaktif' atau 'status'
#>

param(
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$SkillName = "to-tickets",

    [Parameter(Mandatory = $false, Position = 1)]
    [string]$Action = "status"
)

$repoSkillPath = Join-Path $PSScriptRoot "..\\.agents\\skills\\$SkillName\\SKILL.md"

if (-not (Test-Path $repoSkillPath)) {
    Write-Error "Skill '$SkillName' tidak ditemukan di $repoSkillPath"
    exit 1
}

$content = Get-Content -Path $repoSkillPath -Raw
$isCurrentlyDisabled = $content -match "(?m)^disable-model-invocation:\s*true"

switch -Regex ($Action.ToLower()) {
    "^(on|enable|aktif|activate)$" {
        if (-not $isCurrentlyDisabled) {
            Write-Host "Skill '$SkillName' SUDAH dalam keadaan AKTIF." -ForegroundColor Cyan
        } else {
            $newContent = $content -replace "(?m)^disable-model-invocation:\s*true\r?\n?", ""
            Set-Content -Path $repoSkillPath -Value $newContent -NoNewline
            Write-Host "Skill '$SkillName' BERHASIL DIAKTIFKAN! (Model sekarang dapat melihat dan memanggil skill ini)." -ForegroundColor Green
        }
    }
    "^(off|disable|nonaktif|deactivate)$" {
        if ($isCurrentlyDisabled) {
            Write-Host "Skill '$SkillName' SUDAH dalam keadaan NONAKTIF." -ForegroundColor Yellow
        } else {
            $newContent = $content -replace "(?m)^(name:\s*.+\r?\n)", "`$1disable-model-invocation: true`n"
            Set-Content -Path $repoSkillPath -Value $newContent -NoNewline
            Write-Host "Skill '$SkillName' BERHASIL DINONAKTIFKAN! (Model tidak akan memanggil skill ini secara otomatis)." -ForegroundColor Yellow
        }
    }
    default {
        $statusStr = if ($isCurrentlyDisabled) { "NONAKTIF (disable-model-invocation: true)" } else { "AKTIF (Dapat dipanggil oleh Model)" }
        $color = if ($isCurrentlyDisabled) { "Yellow" } else { "Green" }
        Write-Host "Status Skill '$SkillName': $statusStr" -ForegroundColor $color
        Write-Host "Penggunaan: .\scripts\toggle-skill.ps1 $SkillName [on|off|status]" -ForegroundColor Gray
    }
}
