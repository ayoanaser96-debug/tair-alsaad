# Free a TCP listening port by stopping its owning processes (Windows).
# Skips Idle (PID 0), System (typically 4), and other invalid owning process IDs.

param(
  [Parameter(Position = 0)]
  [ValidateRange(1, 65535)]
  [int] $Port = 5173
)

$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if (-not $listeners.Count) {
  Write-Host "free-port: nothing listening on port $Port."
  exit 0
}

$owning = $listeners |
  Where-Object {
    $op = [int]$_.OwningProcess
    # Skip Idle (0), System (4), and other junk rows; avoids "Stop-Process ... Idle"
    $op -gt 99
  } |
  Select-Object -ExpandProperty OwningProcess -Unique

if (-not $owning) {
  Write-Host "free-port: connections on port $Port exist but OwningProcess missing or not in safe range (PID must be > 99). Try Task Manager or reboot."
  exit 1
}

foreach ($id in $owning) {
  try {
    $p = Get-Process -Id $id -ErrorAction Stop
    Write-Host ("free-port: stopping PID {0} ({1})" -f $id, $p.ProcessName)
    Stop-Process -Id $id -Force
  }
  catch {
    Write-Host ("free-port: could not stop PID {0}: {1}" -f $id, $_.Exception.Message)
  }
}

Write-Host "free-port: done."
