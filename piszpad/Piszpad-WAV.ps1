$ErrorActionPreference = 'Stop'

$port = 8765
$htmlPath = Join-Path $PSScriptRoot 'index.html'
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Find-HeaderEnd {
    param([byte[]]$Bytes)

    for ($i = 0; $i -le $Bytes.Length - 4; $i++) {
        if ($Bytes[$i] -eq 13 -and $Bytes[$i + 1] -eq 10 -and
            $Bytes[$i + 2] -eq 13 -and $Bytes[$i + 3] -eq 10) {
            return $i
        }
    }
    return -1
}

function Read-HttpRequest {
    param([System.Net.Sockets.NetworkStream]$Stream)

    $buffer = New-Object byte[] 8192
    $memory = New-Object System.IO.MemoryStream
    $headerEnd = -1
    $expectedLength = -1
    $contentLength = 0

    try {
        while ($true) {
            $read = $Stream.Read($buffer, 0, $buffer.Length)
            if ($read -le 0) { break }
            $memory.Write($buffer, 0, $read)

            if ($memory.Length -gt 10485760) {
                throw 'Dokument jest zbyt duży dla lokalnego generatora WAV.'
            }

            $allBytes = $memory.ToArray()
            if ($headerEnd -lt 0) {
                $headerEnd = Find-HeaderEnd $allBytes
                if ($headerEnd -ge 0) {
                    $headerText = [System.Text.Encoding]::ASCII.GetString($allBytes, 0, $headerEnd)
                    $headerLines = $headerText -split "`r`n"
                    $headers = @{}

                    for ($i = 1; $i -lt $headerLines.Length; $i++) {
                        $separator = $headerLines[$i].IndexOf(':')
                        if ($separator -gt 0) {
                            $name = $headerLines[$i].Substring(0, $separator).Trim().ToLowerInvariant()
                            $value = $headerLines[$i].Substring($separator + 1).Trim()
                            $headers[$name] = $value
                        }
                    }

                    if ($headers.ContainsKey('content-length')) {
                        $contentLength = [int]$headers['content-length']
                    }
                    $expectedLength = $headerEnd + 4 + $contentLength
                }
            }

            if ($expectedLength -ge 0 -and $memory.Length -ge $expectedLength) {
                break
            }
        }

        if ($headerEnd -lt 0) {
            throw 'Nieprawidłowe żądanie HTTP.'
        }

        $allBytes = $memory.ToArray()
        $headerText = [System.Text.Encoding]::ASCII.GetString($allBytes, 0, $headerEnd)
        $headerLines = $headerText -split "`r`n"
        $requestParts = $headerLines[0] -split ' '
        if ($requestParts.Length -lt 2) {
            throw 'Nieprawidłowa linia żądania.'
        }

        $headers = @{}
        for ($i = 1; $i -lt $headerLines.Length; $i++) {
            $separator = $headerLines[$i].IndexOf(':')
            if ($separator -gt 0) {
                $name = $headerLines[$i].Substring(0, $separator).Trim().ToLowerInvariant()
                $value = $headerLines[$i].Substring($separator + 1).Trim()
                $headers[$name] = $value
            }
        }

        [byte[]]$bodyBytes = New-Object byte[] $contentLength
        if ($contentLength -gt 0) {
            [System.Array]::Copy($allBytes, $headerEnd + 4, $bodyBytes, 0, $contentLength)
        }

        return [PSCustomObject]@{
            Method  = $requestParts[0].ToUpperInvariant()
            Path    = ($requestParts[1] -split '\?')[0]
            Headers = $headers
            Body    = $utf8.GetString($bodyBytes)
        }
    }
    finally {
        $memory.Dispose()
    }
}

function Send-HttpResponse {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [string]$ContentType,
        [byte[]]$Body
    )

    if ($null -eq $Body) { $Body = New-Object byte[] 0 }
    $header = "HTTP/1.1 $StatusCode $StatusText`r`n" +
              "Content-Type: $ContentType`r`n" +
              "Content-Length: $($Body.Length)`r`n" +
              "Cache-Control: no-store`r`n" +
              "X-Content-Type-Options: nosniff`r`n" +
              "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

function Send-JsonError {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$Message
    )

    $json = @{ error = $Message } | ConvertTo-Json -Compress
    Send-HttpResponse $Stream $StatusCode 'Error' 'application/json; charset=utf-8' $utf8.GetBytes($json)
}

function New-WavBytes {
    param(
        [string]$Text,
        [double]$Speed
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        throw 'Dokument nie zawiera tekstu.'
    }
    if ($Text.Length -gt 500000) {
        throw 'Dokument jest zbyt długi. Maksymalna długość to 500 000 znaków.'
    }

    Add-Type -AssemblyName System.Speech
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $tempFile = Join-Path ([System.IO.Path]::GetTempPath()) (
        'piszpad-' + [System.Guid]::NewGuid().ToString('N') + '.wav'
    )

    try {
        $voices = @($synth.GetInstalledVoices() | Where-Object { $_.Enabled })
        $preferred = $voices |
            Where-Object { $_.VoiceInfo.Name -match 'Paulina' } |
            Select-Object -First 1
        if (-not $preferred) {
            $preferred = $voices |
                Where-Object { $_.VoiceInfo.Culture.Name -eq 'pl-PL' } |
                Select-Object -First 1
        }
        if (-not $preferred) {
            $preferred = $voices |
                Where-Object { $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'pl' } |
                Select-Object -First 1
        }
        if ($preferred) {
            $synth.SelectVoice($preferred.VoiceInfo.Name)
            Write-Host ('Głos: ' + $preferred.VoiceInfo.Name) -ForegroundColor DarkGray
        }

        if ($Speed -le 0) { $Speed = 1.0 }
        $mappedRate = [int][Math]::Round([Math]::Log($Speed, 2.0) * 5.0)
        $synth.Rate = [Math]::Max(-10, [Math]::Min(10, $mappedRate))

        $synth.SetOutputToWaveFile($tempFile)
        $synth.Speak($Text)
        $synth.SetOutputToNull()
        $synth.Dispose()
        $synth = $null

        return [System.IO.File]::ReadAllBytes($tempFile)
    }
    finally {
        if ($null -ne $synth) {
            try { $synth.SetOutputToNull() } catch {}
            $synth.Dispose()
        }
        if (Test-Path $tempFile) {
            Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
}

if (-not (Test-Path -LiteralPath $htmlPath)) {
    Write-Host 'Brak pliku index.html obok generatora.' -ForegroundColor Red
    Read-Host 'Naciśnij Enter, aby zamknąć'
    exit 1
}

$listener = [System.Net.Sockets.TcpListener]::new(
    [System.Net.IPAddress]::Loopback,
    $port
)

try {
    $listener.Start()
}
catch {
    Write-Host "Nie udało się uruchomić Piszpada na porcie $port." -ForegroundColor Red
    Write-Host 'Sprawdź, czy inne okno Piszpada nie jest już uruchomione.'
    Read-Host 'Naciśnij Enter, aby zamknąć'
    exit 1
}

Write-Host ''
Write-Host 'Piszpad WAV działa lokalnie.' -ForegroundColor Green
Write-Host "Adres: http://127.0.0.1:$port/"
Write-Host 'Pozostaw to okno otwarte. Ctrl+C zatrzymuje Piszpad.'
Write-Host ''

Start-Process "http://127.0.0.1:$port/"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $null

        try {
            $stream = $client.GetStream()
            $stream.ReadTimeout = 30000
            $stream.WriteTimeout = 30000
            $request = Read-HttpRequest $stream

            if ($request.Method -eq 'GET' -and
                ($request.Path -eq '/' -or $request.Path -eq '/index.html')) {
                $htmlBytes = [System.IO.File]::ReadAllBytes($htmlPath)
                Send-HttpResponse $stream 200 'OK' 'text/html; charset=utf-8' $htmlBytes
            }
            elseif ($request.Method -eq 'GET' -and $request.Path -eq '/health') {
                $body = $utf8.GetBytes('{"ok":true}')
                Send-HttpResponse $stream 200 'OK' 'application/json; charset=utf-8' $body
            }
            elseif ($request.Method -eq 'POST' -and $request.Path -eq '/generate') {
                if (-not $request.Headers.ContainsKey('x-piszpad-wav') -or
                    $request.Headers['x-piszpad-wav'] -ne '1') {
                    Send-JsonError $stream 403 'Odrzucono nieautoryzowane żądanie.'
                    continue
                }

                $payload = $request.Body | ConvertFrom-Json
                $text = [string]$payload.text
                $speed = 1.0
                if ($null -ne $payload.rate) {
                    $speed = [double]$payload.rate
                }

                Write-Host ('Generowanie WAV: ' + $text.Length + ' znaków…')
                $wavBytes = New-WavBytes $text $speed
                Send-HttpResponse $stream 200 'OK' 'audio/wav' $wavBytes
                Write-Host ('Gotowe: ' + [Math]::Round($wavBytes.Length / 1MB, 2) + ' MB') -ForegroundColor Green
            }
            else {
                Send-JsonError $stream 404 'Nie znaleziono zasobu.'
            }
        }
        catch {
            Write-Host ('Błąd: ' + $_.Exception.Message) -ForegroundColor Red
            if ($null -ne $stream -and $stream.CanWrite) {
                try {
                    Send-JsonError $stream 500 $_.Exception.Message
                }
                catch {}
            }
        }
        finally {
            if ($null -ne $stream) { $stream.Dispose() }
            $client.Dispose()
        }
    }
}
finally {
    $listener.Stop()
}
