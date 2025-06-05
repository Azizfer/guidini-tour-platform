$componentsDir = "c:\Users\azizf\OneDrive\Desktop\guidini\frontend\src\components\ui"
$srcDir = "c:\Users\azizf\OneDrive\Desktop\guidini\frontend\src"

# Get all UI component files
$componentFiles = Get-ChildItem -Path $componentsDir -Filter "*.tsx" | ForEach-Object { $_.BaseName }

# Initialize results array
$results = @()

foreach ($component in $componentFiles) {
    # Skip use-toast.ts as it's not a component
    if ($component -eq "use-toast") { continue }
    
    # Search for component usage
    $pattern = "@/components/ui/$component"
    $usages = Get-ChildItem -Path $srcDir -Recurse -Include *.tsx,*.ts,*.jsx,*.js | 
              Select-String -Pattern $pattern -SimpleMatch
    
    # Add to results
    $results += [PSCustomObject]@{
        Component = $component
        UsageCount = $usages.Count
        IsUnused = ($usages.Count -eq 0)
    }
}

# Display unused components
Write-Host "Unused UI Components:"
$unusedComponents = $results | Where-Object { $_.IsUnused -eq $true }
$unusedComponents | Format-Table Component, UsageCount

# Display used components for reference
Write-Host "Used UI Components:"
$usedComponents = $results | Where-Object { $_.IsUnused -eq $false }
$usedComponents | Format-Table Component, UsageCount
