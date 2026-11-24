@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Preparando el proyecto para grabar el video ===

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No tienes Node.js. Instala la version LTS desde https://nodejs.org y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Instalando dependencias...
  call npm install
)

if not exist .env (
  echo Creando .env con una JWT_SECRET aleatoria...
  powershell -NoProfile -Command "$s=[guid]::NewGuid().ToString('N')+[guid]::NewGuid().ToString('N'); (Get-Content .env.example) -replace 'cambia_esta_clave_secreta',$s | Set-Content -Encoding UTF8 .env"
)

echo Iniciando el mock SOAP y la API en ventanas separadas...
start "Mock SOAP Estrella" cmd /k npm run mock
start "API Reyes Magos" cmd /k npm start
timeout /t 3 >nul

where code >nul 2>nul
if not errorlevel 1 (
  echo Abriendo VS Code con los archivos del recorrido...
  call code . src\routes\index.js src\middlewares\auth.js src\controllers\caravana.controller.js src\services\caravana.service.js src\repositories\caravana.repository.js
)

start "" "docs\arquitectura.png"

echo.
echo === Listo ===
echo Falta solo Postman: Import ^> postman\ReyesMagos.postman_collection.json
echo y ejecutar "0 - Autenticacion > Login JEFE_CARAVANA".
echo Para empezar con datos limpios: cierra las ventanas de la API y del mock y vuelve a ejecutar este archivo.
pause
