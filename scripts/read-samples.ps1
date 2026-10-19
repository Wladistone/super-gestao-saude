Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-DocxText($filePath) {
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)
        $entry = $zip.GetEntry('word/document.xml')
        if (-not $entry) { return "NO document.xml" }
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $zip.Dispose()
        
        $clean = $xml -replace '<w:p[^>]*>', "`n" -replace '<[^>]+>', ''
        $clean = $clean -replace ' +', ' '
        return $clean.Trim()
    } catch {
        return "ERROR: $_"
    }
}

$typesToTest = @('DFD', 'ETP', 'MATRIZ', 'TERMO DE REFERÊNCIA', 'MEMO', 'DESPACHO', 'PORTARIA', 'AUTORIZAÇÃO')

foreach ($t in $typesToTest) {
    $f = Get-ChildItem -Path "public\modelos" -Recurse -Filter "*$t*.docx" | Select-Object -First 1
    if ($f) {
        Write-Output "=========================================================="
        Write-Output "PECA: $t | ARQUIVO: $($f.Name)"
        Write-Output "=========================================================="
        $txt = Get-DocxText $f.FullName
        Write-Output $txt.Substring(0, [Math]::Min(1200, $txt.Length))
        Write-Output "`n`n"
    }
}
