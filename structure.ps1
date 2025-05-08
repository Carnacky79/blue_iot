# File: create-blue-site-structure.ps1
# Avviare questo script dalla cartella blue-site-monitor

# Funzione per creare directory
function Create-Folder {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

# Funzione per creare file vuoto
function Create-File {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path | Out-Null
    }
}

# === CLIENT STRUCTURE ===
$clientFolders = @(
    "client/public",
    "client/src/assets",
    "client/src/components/common",
    "client/src/components/dashboard",
    "client/src/components/map",
    "client/src/components/settings",
    "client/src/composables",
    "client/src/layouts",
    "client/src/router",
    "client/src/services",
    "client/src/stores",
    "client/src/types",
    "client/src/utils",
    "client/src/views"
)

$clientFiles = @(
    "client/src/services/blueiot.ts",
    "client/src/services/crm.ts",
    "client/src/services/auth.ts",
    "client/src/App.vue",
    "client/src/main.ts",
    "client/index.html",
    "client/vite.config.ts"
)

# === SERVER STRUCTURE ===
$serverFolders = @(
    "server/src/controllers",
    "server/src/middleware",
    "server/src/models",
    "server/src/routes",
    "server/src/services/blueiot",
    "server/src/services/crm",
    "server/src/services/websocket",
    "server/src/types",
    "server/src/utils"
)

$serverFiles = @(
    "server/src/app.ts",
    "server/tsconfig.json",
    "server/package.json"
)

# === MOCK SERVERS ===
$mockFolders = @(
    "mock-servers/blueiot-mock",
    "mock-servers/crm-mock"
)

# === ROOT FILES ===
$rootFiles = @(
    ".gitignore",
    "package.json",
    "README.md"
)

# === CREA STRUTTURA ===
$allFolders = $clientFolders + $serverFolders + $mockFolders
$allFiles = $clientFiles + $serverFiles + $rootFiles

Write-Host "Creazione cartelle..."
$allFolders | ForEach-Object { Create-Folder $_ }

Write-Host "Creazione file..."
$allFiles | ForEach-Object { Create-File $_ }

Write-Host "✅ Struttura completata."
