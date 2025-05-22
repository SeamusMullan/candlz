@echo off
:: Script to start the candlz documentation server on Windows

echo Starting candlz documentation server...

:: Check if docsify-cli is installed
where docsify >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using docsify-cli to serve documentation
    docsify serve docs
    goto :end
)

:: Check if npx is available
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using npx to serve documentation
    npx docsify-cli serve docs
    goto :end
)

:: Check if Python is available
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python's built-in HTTP server
    cd docs && python -m http.server 3000
    goto :end
)

:: Check if Python3 is available
where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using Python's built-in HTTP server
    cd docs && python3 -m http.server 3000
    goto :end
)

:: If we get here, none of the options worked
echo Error: Could not find docsify-cli, npx, or python to serve the documentation
echo Please install one of the following:
echo   - docsify-cli: npm install -g docsify-cli
echo   - Node.js with npm (for npx)
echo   - Python 3
exit /b 1

:end
echo Documentation server started at http://localhost:3000
