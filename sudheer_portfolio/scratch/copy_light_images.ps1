$srcDir = "C:\Users\venka\.gemini\antigravity-ide\brain\e4835ba0-bcd1-4405-a1f0-2e19d9c20721\.user_uploaded"
$destDir = "d:\vcard-personal-portfolio-master\vcard-personal-portfolio-master\assets\images"

$mapping = @{
    "media_1792601389291.png" = "project-1-light.png" # TrustPay light
    "media_1792601392029.png" = "project-2-light.png" # Linora light
    "media_1792601393950.png" = "project-3-light.png" # College DSA light
    "media_1792601411530.png" = "project-4-light.png" # CodeOrbit light
    "media_1792601413600.png" = "project-5-light.png" # Ganesh Utsav light
}

foreach ($key in $mapping.Keys) {
    $src = Join-Path $srcDir $key
    $dest = Join-Path $destDir $mapping[$key]
    Copy-Item -Path $src -Destination $dest -Force
    Write-Output ("Copied " + $key + " to " + $mapping[$key] + " (Size: " + (Get-Item $dest).Length + " bytes)")
}
