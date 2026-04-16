# PowerShell สำหรับวิชาระบบปฏิบัติการและโปรแกรมระบบ
> ตั้งแต่พื้นฐานจนถึงระดับสูง — Operating System & System Programming

---

## สารบัญ
1. [Introduction](#1-introduction)
2. [Basic Cmdlets and Help](#2-basic-cmdlets-and-help)
3. [Variables and Data Types](#3-variables-and-data-types)
4. [Operators](#4-operators)
5. [Flow Control](#5-flow-control)
6. [File and Folder Management](#6-file-and-folder-management)
7. [Pipeline and Objects](#7-pipeline-and-objects)
8. [Functions and Scripts](#8-functions-and-scripts)
9. [Process Management](#9-process-management)
10. [Service Management](#10-service-management)
11. [Memory and Disk Management](#11-memory-and-disk-management)
12. [Background Jobs](#12-background-jobs)
13. [Error Handling](#13-error-handling)
14. [Registry Management](#14-registry-management)
15. [Remoting and WMI/CIM](#15-remoting-and-wmicim)
16. [Advanced Topics](#16-advanced-topics)

---

## 1. Introduction

PowerShell คือ Shell และภาษาสคริปต์ที่พัฒนาโดย Microsoft สร้างขึ้นบน .NET Framework ทำงานได้ทั้งบน Windows, Linux และ macOS (PowerShell Core / PowerShell 7+)

ความแตกต่างจาก CMD:
- CMD ส่งผ่าน **ข้อความ (Text)** ระหว่างคำสั่ง
- PowerShell ส่งผ่าน **Objects** ระหว่างคำสั่ง ทำให้จัดการข้อมูลได้ง่ายกว่ามาก

โครงสร้างคำสั่ง PowerShell เรียกว่า **Cmdlet** มีรูปแบบ `Verb-Noun` เช่น:
- `Get-Process` — ดึงข้อมูล Process
- `Stop-Service` — หยุด Service
- `New-Item` — สร้างไฟล์/โฟลเดอร์

```powershell
# ตรวจสอบเวอร์ชัน PowerShell
$PSVersionTable

# ดู PowerShell อยู่ที่ไหน
$PSHome
```

---

## 2. Basic Cmdlets and Help

### ระบบ Help

```powershell
# อัปเดต Help ก่อนใช้งาน (ต้องรัน Admin)
Update-Help

# ดู Help ของ Cmdlet
Get-Help Get-Process

# ดูพร้อมตัวอย่าง
Get-Help Get-Process -Examples

# ดูแบบละเอียด
Get-Help Get-Process -Full

# ค้นหา Help ที่มีคำว่า "process"
Get-Help *process*
```

### ค้นหาคำสั่ง

```powershell
# ดูคำสั่งทั้งหมด
Get-Command

# ค้นหาคำสั่งที่ขึ้นต้นด้วย Get-
Get-Command Get-*

# ค้นหา Cmdlet ที่เกี่ยวกับ Process
Get-Command -Noun Process

# ค้นหา Cmdlet ที่ใช้ Get เป็น Verb
Get-Command -Verb Get

# ดูคำสั่งใน Module ที่กำหนด
Get-Command -Module Microsoft.PowerShell.Management
```

### Output และการแสดงผล

```powershell
# แสดงข้อความ
Write-Host "Hello, PowerShell!"

# แสดงข้อความสี
Write-Host "ERROR" -ForegroundColor Red
Write-Host "OK"    -ForegroundColor Green -NoNewLine

# รับค่าจากผู้ใช้
$name = Read-Host "กรุณาใส่ชื่อ"
Write-Host "สวัสดี, $name"

# รับ Password (ปิดบังการแสดงผล)
$pwd = Read-Host "Password" -AsSecureString

# ล้างหน้าจอ
Clear-Host
```

### Alias — ชื่อย่อของ Cmdlet

```powershell
# ดู Alias ทั้งหมด
Get-Alias

# ดู Alias ของคำสั่งที่นิยม
Get-Alias ls        # → Get-ChildItem
Get-Alias cd        # → Set-Location
Get-Alias cat       # → Get-Content
Get-Alias rm        # → Remove-Item
Get-Alias cp        # → Copy-Item
Get-Alias mv        # → Move-Item
Get-Alias echo      # → Write-Output

# สร้าง Alias ใหม่
New-Alias -Name "list" -Value Get-ChildItem
```

---

## 3. Variables and Data Types

### การประกาศตัวแปร

```powershell
# ตัวแปรทั่วไป (ใช้ $ นำหน้า)
$name    = "PowerShell"
$version = 7
$pi      = 3.14159
$isAdmin = $true

# กำหนดชนิดข้อมูลแบบเข้มงวด (Strongly Typed)
[int]$age      = 25
[string]$city  = "Bangkok"
[double]$price = 99.99
[bool]$active  = $false
[datetime]$now = Get-Date

# หลาย Assignment พร้อมกัน
$a, $b, $c = 1, 2, 3

# สลับค่าตัวแปร
$a, $b = $b, $a

# Constant (เปลี่ยนค่าไม่ได้)
Set-Variable -Name Pi -Value 3.14159 -Option Constant

# ReadOnly (เปลี่ยนได้ด้วย -Force)
Set-Variable -Name Config -Value "prod" -Option ReadOnly
```

### Automatic Variables (ตัวแปรอัตโนมัติ)

```powershell
$true             # ค่า Boolean TRUE
$false            # ค่า Boolean FALSE
$null             # ค่า NULL
$_                # Object ปัจจุบันใน Pipeline
$PSItem           # เหมือน $_ (ชื่อเต็ม)
$Args             # Arguments ที่ส่งมายังสคริปต์/ฟังก์ชัน
$Error            # Array ของ Error ที่เกิดขึ้น
$?                # Boolean: คำสั่งล่าสุดสำเร็จหรือไม่
$LastExitCode     # Exit code ของโปรแกรมล่าสุด
$PWD              # Path ปัจจุบัน
$HOME             # Home directory ของผู้ใช้
$Env:USERNAME     # ชื่อผู้ใช้ปัจจุบัน
$Env:COMPUTERNAME # ชื่อเครื่อง
$Env:PATH         # PATH ของระบบ
```

### String

```powershell
# Double Quotes — แปลงตัวแปรและ Expression
$name = "World"
"Hello, $name!"            # → Hello, World!
"1 + 1 = $(1 + 1)"         # → 1 + 1 = 2

# Single Quotes — ไม่แปลงตัวแปร
'Hello, $name!'            # → Hello, $name!

# Here-String (ข้อความหลายบรรทัด)
$text = @"
ชื่อ: $name
วันที่: $(Get-Date)
"@

# เมธอดของ String
$str = "  Hello PowerShell  "
$str.ToUpper()              # HELLO POWERSHELL
$str.ToLower()              # hello powershell
$str.Trim()                 # "Hello PowerShell"
$str.Replace("Hello","Hi")  # "  Hi PowerShell  "
$str.Split(" ")             # แยกเป็น Array
$str.Length                 # ความยาว
$str.Contains("Power")      # $true
```

### Array

```powershell
# สร้าง Array
$fruits  = @("Apple", "Banana", "Cherry")
$numbers = 1..10             # Range 1 ถึง 10

# เข้าถึงสมาชิก
$fruits[0]                   # Apple
$fruits[-1]                  # Cherry (ตัวสุดท้าย)
$fruits[1..2]                # Banana, Cherry

# เพิ่มสมาชิก
$fruits += "Durian"

# ความยาว
$fruits.Count

# วนลูปใน Array
foreach ($fruit in $fruits) {
    Write-Host $fruit
}
```

### HashTable (Dictionary)

```powershell
# สร้าง HashTable
$person = @{
    Name = "Somchai"
    Age  = 30
    City = "Bangkok"
}

# เข้าถึงค่า
$person["Name"]
$person.Age

# เพิ่ม/แก้ไขค่า
$person["Email"] = "somchai@example.com"
$person.Age = 31

# ลบ key
$person.Remove("Email")

# วนลูป
foreach ($key in $person.Keys) {
    Write-Host "$key = $($person[$key])"
}
```

---

## 4. Operators

### Comparison Operators

```powershell
5 -eq 5          # Equal            → $true
5 -ne 3          # Not Equal        → $true
5 -gt 3          # Greater Than     → $true
5 -ge 5          # Greater or Equal → $true
3 -lt 5          # Less Than        → $true
3 -le 5          # Less or Equal    → $true

# Wildcard
"PowerShell" -like "Power*"        # $true
"PowerShell" -notlike "bash*"      # $true

# Regex
"abc123" -match "\d+"              # $true
"abc"    -notmatch "\d+"           # $true

# แทนที่
"Hello World" -replace "World","PowerShell"

# Array
1,2,3,4,5 -contains 3             # $true
"admin" -in "admin","user","guest" # $true
```

### Logical Operators

```powershell
$true -and $false   # AND → $false
$true -or  $false   # OR  → $true
-not $true          # NOT → $false
!$false             # NOT → $true
$true -xor $true    # XOR → $false
```

### Assignment Operators

```powershell
$x = 10
$x += 5    # $x = 15
$x -= 3    # $x = 12
$x *= 2    # $x = 24
$x /= 4    # $x = 6
$x %  4    # Modulo → 2
$x++       # เพิ่ม 1
$x--       # ลด 1
```

### Redirection Operators

```powershell
Get-Process > processes.txt    # บันทึก Output (เขียนทับ)
Get-Process >> processes.txt   # บันทึก Output (ต่อท้าย)
Get-Process xyz 2> error.txt   # บันทึก Error
Do-Something *> all.txt        # บันทึกทุก Stream
Do-Something 3> warning.txt    # บันทึก Warning
Get-Process 2>&1               # Merge Error → Success stream
```

---

## 5. Flow Control

### If / ElseIf / Else

```powershell
$score = 75

if ($score -ge 80) {
    Write-Host "A"
} elseif ($score -ge 70) {
    Write-Host "B"
} elseif ($score -ge 60) {
    Write-Host "C"
} else {
    Write-Host "F"
}
```

### Switch

```powershell
$day = "Monday"

switch ($day) {
    "Monday"    { Write-Host "วันจันทร์" }
    "Tuesday"   { Write-Host "วันอังคาร" }
    "Wednesday" { Write-Host "วันพุธ" }
    default     { Write-Host "วันอื่นๆ" }
}

# Switch กับ Wildcard
switch -Wildcard ($day) {
    "Mon*" { Write-Host "เริ่มต้นสัปดาห์" }
    "Fri*" { Write-Host "สิ้นสัปดาห์" }
}

# Switch กับ Regex
switch -Regex ("abc123") {
    "^\d+"   { Write-Host "ขึ้นต้นด้วยตัวเลข" }
    "^[a-z]" { Write-Host "ขึ้นต้นด้วยตัวอักษรพิมพ์เล็ก" }
}
```

### For Loop

```powershell
# For
for ($i = 0; $i -lt 5; $i++) {
    Write-Host "i = $i"
}

# ForEach-Object (Pipeline)
1..5 | ForEach-Object {
    Write-Host "Item: $_"
}

# Foreach (Statement)
$fruits = @("Apple","Banana","Cherry")
foreach ($fruit in $fruits) {
    Write-Host $fruit
}
```

### While และ Do-While

```powershell
# While
$count = 0
while ($count -lt 3) {
    Write-Host "Count: $count"
    $count++
}

# Do-While (ทำงานอย่างน้อย 1 ครั้ง)
$count = 0
do {
    Write-Host "Count: $count"
    $count++
} while ($count -lt 3)

# Do-Until
$count = 0
do { $count++ } until ($count -ge 3)
```

### Break และ Continue

```powershell
# Break — หยุดลูป
for ($i = 0; $i -lt 10; $i++) {
    if ($i -eq 5) { break }
    Write-Host $i
}

# Continue — ข้ามรอบนี้
for ($i = 0; $i -lt 10; $i++) {
    if ($i % 2 -eq 0) { continue }  # ข้ามเลขคู่
    Write-Host $i
}
```

---

## 6. File and Folder Management

### Navigation

```powershell
Get-Location                              # ดู Path ปัจจุบัน (pwd)
Set-Location C:\Users                     # เปลี่ยน Directory (cd)
Set-Location ..                           # ขึ้นไปหนึ่งระดับ
Set-Location ~                            # ไปที่ Home

Get-ChildItem                             # แสดงรายการไฟล์ (ls / dir)
Get-ChildItem -Path C:\Windows
Get-ChildItem *.txt                       # ไฟล์ .txt
Get-ChildItem -Recurse                    # ค้นหาแบบ Recursive
Get-ChildItem -Filter "*.log" -Recurse    # ค้นหา .log ทุก Subfolder
Get-ChildItem -Hidden                     # แสดงไฟล์ซ่อน
```

### สร้าง ลบ คัดลอก ย้าย

```powershell
# สร้างไฟล์และโฟลเดอร์
New-Item -Path "C:\test.txt"    -ItemType File -Value "Hello!"
New-Item -Path "C:\MyFolder"    -ItemType Directory

# ลบ
Remove-Item "C:\test.txt"
Remove-Item "C:\MyFolder" -Recurse -Force

# คัดลอก
Copy-Item "C:\source.txt" "C:\dest.txt"
Copy-Item "C:\Folder"     "C:\Backup" -Recurse

# ย้าย / Rename
Move-Item   "C:\old.txt" "C:\new.txt"
Rename-Item "C:\old.txt" "new.txt"
```

### อ่านและเขียนไฟล์

```powershell
Get-Content "C:\log.txt"                           # อ่านไฟล์ทั้งหมด
Get-Content "C:\log.txt" -TotalCount 10            # 10 บรรทัดแรก
Get-Content "C:\log.txt" -Tail 10                  # 10 บรรทัดสุดท้าย

Set-Content "C:\output.txt" "Hello World"          # เขียนทับ
Add-Content "C:\output.txt" "New Line"             # ต่อท้าย
"Line 1","Line 2" | Set-Content "C:\output.txt"    # เขียนหลายบรรทัด

Test-Path "C:\test.txt"                            # → $true / $false
```

### ค้นหาไฟล์

```powershell
# ค้นหาไฟล์ตามนามสกุล
Get-ChildItem C:\ -Filter "*.log" -Recurse -ErrorAction SilentlyContinue

# ค้นหาไฟล์ที่แก้ไขล่าสุดภายใน 7 วัน
$cutoff = (Get-Date).AddDays(-7)
Get-ChildItem C:\ -Recurse | Where-Object { $_.LastWriteTime -gt $cutoff }

# ค้นหาไฟล์ขนาดใหญ่กว่า 100MB
Get-ChildItem C:\ -Recurse | Where-Object { $_.Length -gt 100MB }
```

---

## 7. Pipeline and Objects

Pipeline (`|`) ส่ง Output ของ Cmdlet หนึ่งเป็น Input ให้อีก Cmdlet หนึ่ง โดยส่งเป็น **Object** ไม่ใช่แค่ข้อความ

```powershell
# ดู Members (Properties & Methods) ของ Object
Get-Process | Get-Member

# เลือก Property ที่ต้องการ
Get-Process | Select-Object Name, CPU, WorkingSet

# กรอง Object ด้วย Where-Object
Get-Process | Where-Object { $_.CPU -gt 10 }
Get-Process | Where-Object Name -eq "notepad"

# เรียงลำดับ
Get-Process | Sort-Object CPU -Descending

# นับ/รวม/เฉลี่ย
Get-Process | Measure-Object -Property CPU -Sum -Average -Maximum

# แสดง 5 อันดับแรก
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5

# จัดกลุ่ม
Get-Process | Group-Object -Property Company

# เปรียบเทียบ Object
Compare-Object (Get-Content file1.txt) (Get-Content file2.txt)
```

### Format Output

```powershell
Get-Process | Format-Table -AutoSize       # ตาราง
Get-Process | Format-List -Property *      # แสดงทุก Property
Get-Process | Format-Wide -Column 4        # Wide format
```

### Export และ Import

```powershell
# CSV
Get-Process | Export-Csv "processes.csv" -NoTypeInformation
$data = Import-Csv "processes.csv"

# JSON
Get-Process | ConvertTo-Json | Out-File "processes.json"
$json = Get-Content "processes.json" | ConvertFrom-Json

# HTML
Get-Process | ConvertTo-Html | Out-File "processes.html"

# XML
Get-Process | Export-Clixml "processes.xml"
$back = Import-Clixml "processes.xml"
```

---

## 8. Functions and Scripts

### การสร้างฟังก์ชัน

```powershell
# ฟังก์ชันพื้นฐาน
function Say-Hello {
    Write-Host "Hello, World!"
}
Say-Hello

# ฟังก์ชันรับ Parameter
function Greet {
    param(
        [string]$Name  = "Guest",
        [int]$Times    = 1
    )
    for ($i = 0; $i -lt $Times; $i++) {
        Write-Host "Hello, $Name!"
    }
}
Greet -Name "Somchai" -Times 3

# ฟังก์ชัน Return ค่า
function Add-Numbers {
    param([int]$A, [int]$B)
    return $A + $B
}
$result = Add-Numbers -A 5 -B 3
```

### Advanced Function

```powershell
function Get-DiskInfo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$DriveLetter,

        [Parameter(Mandatory=$false)]
        [ValidateSet("GB","MB","KB")]
        [string]$Unit = "GB"
    )

    $disk    = Get-PSDrive -Name $DriveLetter -ErrorAction Stop
    $divisor = switch ($Unit) {
        "GB" { 1GB } "MB" { 1MB } "KB" { 1KB }
    }
    [PSCustomObject]@{
        Drive     = $DriveLetter
        UsedSpace = [math]::Round($disk.Used / $divisor, 2)
        FreeSpace = [math]::Round($disk.Free / $divisor, 2)
        Unit      = $Unit
    }
}
Get-DiskInfo -DriveLetter "C" -Unit "GB"
```

### Script (.ps1)

```powershell
# ตรวจสอบและตั้งค่า Execution Policy
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser   # ต้องรัน Admin

# รัน Script
.\MyScript.ps1
.\MyScript.ps1 -Name "Test" -Verbose

# Dot-sourcing (import function เข้า session ปัจจุบัน)
. .\MyFunctions.ps1
```

### Script ตัวอย่าง: System Report

```powershell
# SystemCheck.ps1
param([string]$ComputerName = $Env:COMPUTERNAME)

Write-Host "=== System Report: $ComputerName ===" -ForegroundColor Cyan

$cpu   = Get-CimInstance Win32_Processor
$ram   = Get-CimInstance Win32_ComputerSystem
$os    = Get-CimInstance Win32_OperatingSystem
$ramGB = [math]::Round($ram.TotalPhysicalMemory / 1GB, 2)

Write-Host "CPU   : $($cpu.Name)"                                    -ForegroundColor Yellow
Write-Host "RAM   : $ramGB GB"                                       -ForegroundColor Yellow
Write-Host "OS    : $($os.Caption) Build $($os.BuildNumber)"         -ForegroundColor Yellow
Write-Host "Uptime: $((Get-Date) - $os.LastBootUpTime)"              -ForegroundColor Yellow

Get-PSDrive -PSProvider FileSystem | ForEach-Object {
    $free = [math]::Round($_.Free / 1GB, 2)
    $used = [math]::Round($_.Used / 1GB, 2)
    Write-Host "Drive $($_.Name): Used=$used GB, Free=$free GB"      -ForegroundColor Yellow
}
```

---

## 9. Process Management

Process ใน PowerShell สัมพันธ์โดยตรงกับแนวคิด **Process Management** ของวิชา OS

```powershell
# ดู Process ทั้งหมด
Get-Process

# ดู Process เฉพาะชื่อ
Get-Process -Name "notepad"
Get-Process -Name "note*"

# ดูรายละเอียด
Get-Process | Select-Object Name, Id, CPU, WorkingSet, StartTime

# Process ที่ใช้ CPU มากสุด 5 อันดับ
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU, Id

# Process ที่ใช้ RAM มากสุด
Get-Process | Sort-Object WorkingSet -Descending |
    Select-Object -First 5 Name,
        @{N="RAM(MB)"; E={[math]::Round($_.WorkingSet/1MB, 2)}}

# เริ่ม Process
Start-Process notepad
Start-Process "chrome.exe" -ArgumentList "https://www.google.com"
Start-Process powershell -Verb RunAs    # เปิด Admin

# หยุด Process
Stop-Process -Name "notepad"
Stop-Process -Id 1234
Stop-Process -Name "notepad" -Force     # บังคับหยุด

# รอจน Process สิ้นสุด
$p = Start-Process notepad -PassThru
$p.WaitForExit()
Write-Host "Notepad ปิดแล้ว"
```

---

## 10. Service Management

Service คือโปรแกรมที่ทำงานเป็น Background ใน Windows (คล้าย Daemon ใน Linux)

```powershell
# ดู Service ทั้งหมด
Get-Service

# กรองตามสถานะ
Get-Service | Where-Object { $_.Status -eq "Running" }
Get-Service | Where-Object { $_.Status -eq "Stopped" }

# ดู Service เฉพาะชื่อ
Get-Service -Name "wuauserv"    # Windows Update
Get-Service -Name "Spooler"    # Print Spooler

# เริ่ม/หยุด/Restart (ต้องรัน Admin)
Start-Service   -Name "Spooler"
Stop-Service    -Name "Spooler"
Restart-Service -Name "Spooler"

# ดูก่อนว่าจะทำอะไร (ไม่ได้รันจริง)
Stop-Service -Name "Spooler" -WhatIf

# ดู Dependencies
Get-Service -Name "wuauserv" -DependentServices
Get-Service -Name "wuauserv" -RequiredServices

# เปลี่ยน Startup Type
Set-Service -Name "Spooler" -StartupType Automatic
Set-Service -Name "Spooler" -StartupType Manual
Set-Service -Name "Spooler" -StartupType Disabled
```

---

## 11. Memory and Disk Management

### Memory (RAM)

```powershell
# ดู RAM ทั้งหมดและที่ว่าง
$os      = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeGB  = [math]::Round($os.FreePhysicalMemory     / 1MB, 2)
$usedGB  = $totalGB - $freeGB

Write-Host "Total: $totalGB GB | Used: $usedGB GB | Free: $freeGB GB"

# Performance Counter
Get-Counter '\Memory\Available MBytes'
Get-Counter '\Memory\% Committed Bytes In Use'
```

### Disk และ Storage

```powershell
# ดูไดรฟ์ทั้งหมด
Get-PSDrive -PSProvider FileSystem

# ดู Logical Disk รายละเอียด
Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID,
    @{N="Size(GB)";     E={[math]::Round($_.Size/1GB, 2)}},
    @{N="FreeSpace(GB)";E={[math]::Round($_.FreeSpace/1GB, 2)}},
    @{N="Used%";        E={[math]::Round((($_.Size-$_.FreeSpace)/$_.Size)*100, 1)}}

# ดู Physical Disk
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size, HealthStatus

# ดูขนาดโฟลเดอร์
$size = (Get-ChildItem "C:\Windows" -Recurse -ErrorAction SilentlyContinue |
         Measure-Object -Property Length -Sum).Sum
Write-Host "$([math]::Round($size/1GB,2)) GB"
```

### CPU Usage

```powershell
# ดู CPU Usage
Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 3

# ดูข้อมูล CPU
Get-CimInstance Win32_Processor |
    Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

# Monitor CPU ทุก 2 วินาที
1..5 | ForEach-Object {
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    Write-Host "CPU: $([math]::Round($cpu,1))%"
    Start-Sleep -Seconds 2
}
```

---

## 12. Background Jobs

Jobs คือการรัน Script ใน Background โดยไม่ block Shell หลัก — คล้ายกับ Background Process ใน OS

```powershell
# เริ่ม Background Job
$job = Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 3
}

Get-Job               # ดู Job ทั้งหมด
$job.State            # Running / Completed / Failed

Wait-Job    -Job $job  # รอจน Job เสร็จ
Receive-Job -Job $job  # ดึงผลลัพธ์
Stop-Job    -Job $job  # หยุด Job
Remove-Job  -Job $job  # ลบ Job

# รัน Job หลายงานพร้อมกัน
$jobs = @()
foreach ($server in "Server1","Server2","Server3") {
    $jobs += Start-Job -ScriptBlock {
        param($srv)
        Test-Connection $srv -Count 1 -Quiet
    } -ArgumentList $server
}
Wait-Job -Job $jobs
$jobs | ForEach-Object { Receive-Job $_ }
Remove-Job -Job $jobs
```

### ForEach-Object -Parallel (PowerShell 7+)

```powershell
1..10 | ForEach-Object -Parallel {
    Start-Sleep -Seconds 1
    "Item $_"
} -ThrottleLimit 5     # รันพร้อมกันสูงสุด 5 งาน
```

---

## 13. Error Handling

### Try / Catch / Finally

```powershell
try {
    Get-Item "C:\ไม่มีไฟล์นี้.txt" -ErrorAction Stop
}
catch [System.IO.FileNotFoundException] {
    Write-Host "ไม่พบไฟล์!" -ForegroundColor Red
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    Write-Host "Finally block ทำงานเสมอ"
}
```

### ErrorAction

```powershell
Get-Item "nofile.txt" -ErrorAction Stop              # หยุดทันที
Get-Item "nofile.txt" -ErrorAction Continue          # แสดง Error แล้วทำต่อ (Default)
Get-Item "nofile.txt" -ErrorAction SilentlyContinue  # ซ่อน Error
Get-Item "nofile.txt" -ErrorAction Inquire           # ถามผู้ใช้

# เก็บ Error ลงตัวแปร
Get-Item "nofile.txt" -ErrorAction SilentlyContinue -ErrorVariable myErr
if ($myErr) { Write-Host "มีข้อผิดพลาด: $myErr" }

$Error        # Error ทั้งหมดใน Session
$Error[0]     # Error ล่าสุด
$Error.Clear() # ล้าง Error
```

### Preference Variables

```powershell
$ErrorActionPreference = "Stop"      # หยุดทุก Error
$VerbosePreference     = "Continue"  # แสดง Write-Verbose
$DebugPreference       = "Continue"  # แสดง Write-Debug
```

---

## 14. Registry Management

Registry คือฐานข้อมูลกำหนดค่าระบบ Windows — PowerShell เข้าถึงได้เหมือน FileSystem

```powershell
# ดู Registry Key
Get-Item "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"

# ดู Value
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name "ProductName"

# นำทางใน Registry
Set-Location HKLM:\SOFTWARE
Get-ChildItem

# สร้าง Key และ Value
New-Item         -Path "HKCU:\SOFTWARE\MyApp"
New-ItemProperty -Path "HKCU:\SOFTWARE\MyApp" -Name "Version" -Value "1.0" -PropertyType String

# แก้ไข / ลบ
Set-ItemProperty    -Path "HKCU:\SOFTWARE\MyApp" -Name "Version" -Value "2.0"
Remove-ItemProperty -Path "HKCU:\SOFTWARE\MyApp" -Name "Version"
Remove-Item         -Path "HKCU:\SOFTWARE\MyApp" -Recurse
```

---

## 15. Remoting and WMI/CIM

### PowerShell Remoting

```powershell
# เปิดใช้ Remoting (ต้องรัน Admin)
Enable-PSRemoting -Force

# รันคำสั่งบนเครื่องอื่น
Invoke-Command -ComputerName "Server01" -ScriptBlock {
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
}

# รันพร้อมกันหลายเครื่อง
Invoke-Command -ComputerName "Server01","Server02","Server03" -ScriptBlock {
    Get-Service | Where-Object { $_.Status -eq "Stopped" }
}

# ส่งตัวแปร Local ด้วย $using:
$localPath = "C:\Logs"
Invoke-Command -ComputerName "Server01" -ScriptBlock {
    Get-ChildItem $using:localPath
}

# Persistent Session
$session = New-PSSession    -ComputerName "Server01"
Invoke-Command -Session $session -ScriptBlock { Get-Process }
Enter-PSSession -Session $session   # เข้าไปในเครื่องนั้น
Exit-PSSession
Remove-PSSession -Session $session
```

### WMI / CIM

```powershell
# ดูข้อมูลระบบ
Get-CimInstance -ClassName Win32_OperatingSystem
Get-CimInstance -ClassName Win32_Processor        | Select-Object Name, NumberOfCores, MaxClockSpeed
Get-CimInstance -ClassName Win32_PhysicalMemory   | Select-Object Capacity, Speed, Manufacturer
Get-CimInstance -ClassName Win32_DiskDrive        | Select-Object Model, Size, MediaType
Get-CimInstance -ClassName Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled }

# Query แบบ WQL (คล้าย SQL)
Get-CimInstance -Query "SELECT * FROM Win32_Process WHERE Name='notepad.exe'"

# ดูข้อมูลจากเครื่องอื่น
Get-CimInstance -ClassName Win32_OperatingSystem -ComputerName "Server01"
```

---

## 16. Advanced Topics

### Custom Objects

```powershell
# สร้าง Custom Object
$server = [PSCustomObject]@{
    Name     = "WebServer01"
    IP       = "192.168.1.10"
    OS       = "Windows Server 2022"
    RAM_GB   = 32
    IsOnline = $true
}
$server | Format-List

# Array ของ Custom Objects
$servers = @(
    [PSCustomObject]@{ Name="Web01"; IP="192.168.1.10"; Role="Web" },
    [PSCustomObject]@{ Name="DB01";  IP="192.168.1.20"; Role="DB"  }
)
$servers | Format-Table
```

### Variable Scope

```powershell
$global:var  = "ทุกที่เข้าถึงได้"
$local:var   = "เฉพาะ scope นี้"       # Default
$script:var  = "เฉพาะไฟล์ script"
$private:var = "ลูก scope เข้าไม่ได้"

Get-Variable           # ดูตัวแปรทั้งหมด
Get-ChildItem Variable:
```

### Modules

```powershell
Get-Module -ListAvailable          # ดู Module ที่ติดตั้ง
Import-Module ActiveDirectory      # Import Module

Find-Module    -Name "PSWindowsUpdate"                   # ค้นหา
Install-Module -Name "PSWindowsUpdate" -Scope CurrentUser # ติดตั้ง

Get-Command -Module ActiveDirectory  # ดูคำสั่งใน Module
```

### Regular Expression

```powershell
"abc123" -match "^\w+\d+$"    # $true
$Matches[0]                    # ค่าที่ตรงกัน

"Phone: 0812345678" -replace "\d{10}", "XXXXXXXXXX"

# ค้นหาทุก Match
$str = "IP: 192.168.1.1 and 10.0.0.1"
[regex]::Matches($str, "\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}") |
    ForEach-Object { Write-Host "Found IP: $($_.Value)" }
```

### Calculated Properties

```powershell
Get-Process | Select-Object Name, Id,
    @{Name="RAM_MB"; Expression={ [math]::Round($_.WorkingSet/1MB, 2) }},
    @{Name="CPU_s";  Expression={ [math]::Round($_.CPU, 2) }} |
    Sort-Object RAM_MB -Descending |
    Select-Object -First 10 |
    Format-Table -AutoSize
```

### Script ระดับสูง: Process Monitor

```powershell
# monitor.ps1
param(
    [string]$ProcessName = "notepad",
    [int]$IntervalSec    = 5,
    [int]$MaxCPU         = 80
)

Write-Host "Monitoring '$ProcessName' ทุก $IntervalSec วินาที..." -ForegroundColor Cyan

while ($true) {
    $procs     = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    $timestamp = Get-Date -Format "HH:mm:ss"

    if (-not $procs) {
        Write-Host "[$timestamp] ไม่พบ $ProcessName" -ForegroundColor Yellow
    } else {
        foreach ($p in $procs) {
            $cpu   = [math]::Round($p.CPU, 2)
            $ram   = [math]::Round($p.WorkingSet / 1MB, 1)
            $color = if ($cpu -gt $MaxCPU) { "Red" } else { "Green" }
            Write-Host "[$timestamp] PID=$($p.Id) CPU=$cpu% RAM=$ram MB" -ForegroundColor $color
        }
    }
    Start-Sleep -Seconds $IntervalSec
}
```

### Environment Variables

```powershell
Get-ChildItem Env:              # ดูทั้งหมด
$Env:PATH
$Env:USERNAME
$Env:COMPUTERNAME
$Env:TEMP

$Env:MY_VAR = "Hello"           # ตั้งค่าชั่วคราว
$Env:PATH  += ";D:\MyTools"     # เพิ่ม PATH ชั่วคราว

# ตั้งค่าถาวร
[System.Environment]::SetEnvironmentVariable("MY_VAR","Hello","User")    # User
[System.Environment]::SetEnvironmentVariable("MY_VAR","Hello","Machine") # Machine (Admin)
```

---

## ตารางสรุป Cmdlet สำคัญ

| หมวดหมู่ | Cmdlet | Alias | คำอธิบาย |
|---------|--------|-------|----------|
| Help | `Get-Help` | `help`, `man` | ดูคู่มือคำสั่ง |
| Help | `Get-Command` | `gcm` | ค้นหา Cmdlet |
| Help | `Get-Member` | `gm` | ดู Property/Method ของ Object |
| File | `Get-ChildItem` | `ls`, `dir` | แสดงรายการไฟล์ |
| File | `Set-Location` | `cd` | เปลี่ยน Directory |
| File | `Get-Content` | `cat`, `gc` | อ่านไฟล์ |
| File | `Set-Content` | `sc` | เขียนไฟล์ (ทับ) |
| File | `Add-Content` | `ac` | ต่อท้ายไฟล์ |
| File | `New-Item` | `ni` | สร้างไฟล์/โฟลเดอร์ |
| File | `Remove-Item` | `rm`, `del` | ลบ |
| File | `Copy-Item` | `cp`, `copy` | คัดลอก |
| File | `Move-Item` | `mv`, `move` | ย้าย/Rename |
| Process | `Get-Process` | `gps` | ดู Process |
| Process | `Start-Process` | `saps` | เริ่ม Process |
| Process | `Stop-Process` | `kill` | หยุด Process |
| Service | `Get-Service` | `gsv` | ดู Service |
| Service | `Start-Service` | `sasv` | เริ่ม Service |
| Service | `Stop-Service` | `spsv` | หยุด Service |
| Pipeline | `Where-Object` | `where`, `?` | กรอง Object |
| Pipeline | `Select-Object` | `select` | เลือก Property |
| Pipeline | `Sort-Object` | `sort` | เรียงลำดับ |
| Pipeline | `ForEach-Object` | `foreach`, `%` | วนลูปใน Pipeline |
| Pipeline | `Measure-Object` | `measure` | นับ/รวม/เฉลี่ย |
| Pipeline | `Group-Object` | `group` | จัดกลุ่ม |
| Output | `Write-Host` | — | แสดงข้อความบน Console |
| Output | `Write-Output` | `echo` | ส่ง Object ต่อ Pipeline |
| Output | `Out-File` | — | บันทึก Output ไปไฟล์ |
| Job | `Start-Job` | `sajb` | เริ่ม Background Job |
| Job | `Get-Job` | `gjb` | ดู Job ทั้งหมด |
| Job | `Receive-Job` | `rcjb` | ดึงผลลัพธ์ Job |
| Job | `Remove-Job` | `rjb` | ลบ Job |
| Network | `Invoke-WebRequest` | `curl`, `wget` | HTTP Request |
| Network | `Test-Connection` | — | Ping |

---

## ตารางสรุป Automatic Variables

| ตัวแปร | ความหมาย |
|--------|----------|
| `$_` / `$PSItem` | Object ปัจจุบันใน Pipeline |
| `$?` | `$true` ถ้าคำสั่งล่าสุดสำเร็จ |
| `$Error` | Array ของ Error ที่ผ่านมา |
| `$LastExitCode` | Exit code ของโปรแกรมล่าสุด |
| `$Args` | Arguments ที่ส่งมาให้ Script/Function |
| `$true` / `$false` / `$null` | ค่า Boolean และ Null |
| `$PWD` | Path ปัจจุบัน |
| `$HOME` | Home Directory |
| `$Env:USERNAME` | ชื่อ User ปัจจุบัน |
| `$Env:COMPUTERNAME` | ชื่อเครื่อง |
| `$PSVersionTable` | ข้อมูล PowerShell Version |
| `$profile` | Path ของ Profile Script |
| `$Host` | ข้อมูล Host ที่รัน PowerShell |
