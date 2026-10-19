Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-DocxText($filePath) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $zip.Dispose()
    
    # Replace paragraphs with newline and remove all xml tags
    $clean = $xml -replace '<w:p[^>]*>', "`n" -replace '<[^>]+>', ''
    # Normalize spaces
    $clean = $clean -replace ' +', ' '
    return $clean
}

$sample = Get-ChildItem -Path "public\modelos" -Recurse -Filter "*DFD*RP*AQUISIÇÃO*.docx" | Select-Object -First 1
if (-not $sample) {
    $sample = Get-ChildItem -Path "public\modelos" -Recurse -Filter "*.docx" | Select-Object -First 1
}

Write-Output "FILE: $($sample.FullName)"
$content = Get-DocxText $sample.FullName
Write-Output "--- CONTENT PREVIEW (FIRST 2500 CHARS) ---"
Write-Output $content.Substring(0, [Math]::Min(2500, $content.Length))
