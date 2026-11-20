param(
  [string]$RepoUrl
)

$ErrorActionPreference = "Stop"

if ($RepoUrl) {
  Write-Host "Setting remote origin to $RepoUrl..." -ForegroundColor Cyan
  & git remote remove origin 2>$null
  & git remote add origin $RepoUrl
  & git branch -M main
  Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
  & git push -u origin main
  Write-Host "Pushed successfully! If GitHub Pages is enabled on the repository, your site is deploying." -ForegroundColor Green
  exit 0
}

Write-Host "Checking GitHub CLI login..." -ForegroundColor Cyan
$auth = & gh auth status 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "Logged into GitHub! Creating public repository 'study-orbit-planner'..." -ForegroundColor Green
  & gh repo create study-orbit-planner --public --source=. --remote=origin --push
  Write-Host "Done! Your repository is live." -ForegroundColor Green
} else {
  Write-Host "`nTo publish this to your GitHub account, choose one of these two options:`n" -ForegroundColor Yellow
  Write-Host "Option 1 (Quick CLI login):" -ForegroundColor Cyan
  Write-Host "  gh auth login"
  Write-Host "  .\deploy.ps1`n"
  Write-Host "Option 2 (Existing repo URL):" -ForegroundColor Cyan
  Write-Host "  .\deploy.ps1 -RepoUrl https://github.com/<your-username>/<your-repo-name>.git`n"
}
