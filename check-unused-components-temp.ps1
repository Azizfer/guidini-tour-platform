$componentsDir = "c:\Users\azizf\OneDrive\Desktop\guidini\frontend\src\components\ui"
$srcDir = "c:\Users\azizf\OneDrive\Desktop\guidini\frontend\src"

# Get all UI component files
$componentFiles = Get-ChildItem -Path $componentsDir -Filter "*.tsx" | ForEach-Object { $_.BaseName }

# Initialize results array
$unusedComponents = @()
$usedComponents = @()

foreach ($component in $componentFiles) {
    # Search for component usage
    $pattern = "@/components/ui/$component"
    $usages = Get-ChildItem -Path $srcDir -Recurse -Include *.tsx,*.ts,*.jsx,*.js | 
              Select-String -Pattern $pattern -SimpleMatch
    
    # Add to appropriate list
    if ($usages.Count -eq 0) {
        $unusedComponents += $component
    } else {
        $usedComponents += "$component ($($usages.Count) usages)"
    }
}

# Display results
Write-Host "UNUSED UI COMPONENTS:" -ForegroundColor Red
foreach ($comp in $unusedComponents) {
    Write-Host "- $comp" -ForegroundColor Yellow
}

Write-Host "`nUSED UI COMPONENTS:" -ForegroundColor Green
foreach ($comp in $usedComponents) {
    Write-Host "- $comp"
}
