#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# --- 0. Pre-run Cleanup (Target only python module, not the script itself) ---
echo "Cleaning up any stale emulator processes..."
sudo pkill -f "python3 -m elm" || true
sudo rfcomm release 0 2>/dev/null || true

# --- 1. Python Virtual Environment Activation ---
VENV_PATH="./elm327_emulation_env"

if [ -d "$VENV_PATH" ]; then
  echo "Activating virtual environment from $VENV_PATH..."
  source "$VENV_PATH/bin/activate"
else
  echo "Error: Virtual environment not found at $VENV_PATH"
  exit 1
fi

# Ensure ELM327-emulator is available
if ! python3 -m elm --help > /dev/null 2>&1; then
  echo "Error: 'ELM327-emulator' is not installed correctly in $VENV_PATH."
  exit 1
fi

# Cleanup function on script exit or Ctrl+C
cleanup() {
  echo ""
  echo "Stopping emulator..."
  if [ -n "$EMU_PID" ]; then
    kill "$EMU_PID" 2>/dev/null || true
  fi
  echo "Done."
}
trap cleanup EXIT INT TERM

# --- 2. Enable Bluetooth Serial Port Profile (SPP) ---
echo "Registering Bluetooth Serial Port Profile (SPP)..."
sudo sdptool add SP || true

# --- 3. Launch ELM327 Emulator in Native Bluetooth Mode ---
echo "=========================================================="
echo "Starting ELM327 Emulator on Bluetooth SPP (Channel 1)..."
echo "Ready for your React Native app to connect!"
echo "Press Ctrl+C to stop."
echo "=========================================================="

python3 -m elm -w -s car
