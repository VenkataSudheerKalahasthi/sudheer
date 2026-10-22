Add-Type -AssemblyName System.Drawing

$dir = "C:\Users\venka\.gemini\antigravity-ide\brain\e4835ba0-bcd1-4405-a1f0-2e19d9c20721\.user_uploaded"
$files = Get-ChildItem -Path $dir | Where-Object { $_.Name.StartsWith("media_1792601") } | Sort-Object LastWriteTime

foreach ($f in $files) {
    try {
        $bmp = New-Object System.Drawing.Bitmap $f.FullName
        $w = $bmp.Width
        $h = $bmp.Height
        
        # sample top-left, top-center, bottom-center
        $cTopLeft = $bmp.GetPixel(5, 5)
        $cTopMid = $bmp.GetPixel([int]($w/2), 5)
        $cBotMid = $bmp.GetPixel([int]($w/2), $h - 5)
        $bmp.Dispose()

        Write-Output ("NAME:" + $f.Name + " SIZE:" + $w + "x" + $h + " TIME:" + $f.LastWriteTime + " TL:#" + $cTopLeft.R.ToString("X2") + $cTopLeft.G.ToString("X2") + $cTopLeft.B.ToString("X2") + " TM:#" + $cTopMid.R.ToString("X2") + $cTopMid.G.ToString("X2") + $cTopMid.B.ToString("X2") + " BM:#" + $cBotMid.R.ToString("X2") + $cBotMid.G.ToString("X2") + $cBotMid.B.ToString("X2"))
    } catch {
        Write-Output ("ERROR:" + $f.Name + " " + $_)
    }
}
