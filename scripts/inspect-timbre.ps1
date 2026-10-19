Add-Type -AssemblyName System.IO.Compression.FileSystem
$f = (Get-ChildItem -Path "public\modelos" -Recurse -Filter "*.docx" | Select-Object -First 1).FullName
$docxPath = $f
$zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
$outDir = "public\timbre"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }

foreach ($item in $zip.Entries) {
    if ($item.FullName -like "word/media/*" -or $item.FullName -like "word/header*" -or $item.FullName -like "word/footer*") {
        $cleanName = $item.FullName.Replace('/', '_')
        $target = Join-Path $outDir $cleanName
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($item, $target, $true)
        Write-Output "Saved: $cleanName"
    }
}
$zip.Dispose()
