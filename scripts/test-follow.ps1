param(
    [string]$ApiBase = "http://localhost:3001/api/v1",
    [string]$LoginEmail = "test@example.com",
    [string]$LoginPassword = "password",
    [string]$TargetUsername = "someusername"
)

function ExitIfError($resp, $step) {
    if ($resp.StatusCode -ge 400) {
        Write-Host "ERROR during $step: Status $($resp.StatusCode)" -ForegroundColor Red
        Write-Host $resp.Content
        exit 1
    }
}

Write-Host "Login as $LoginEmail -> $ApiBase/auth/login"
$loginBody = @{ email = $LoginEmail; password = $LoginPassword } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$ApiBase/auth/login" -Method Post -Body $loginBody -ContentType 'application/json' -ErrorAction Stop

# Try to extract token (support both { access_token } or { token } shapes)
$token = $null
if ($loginResp.access_token) { $token = $loginResp.access_token }
elseif ($loginResp.token) { $token = $loginResp.token }
elseif ($loginResp.data -and $loginResp.data.access_token) { $token = $loginResp.data.access_token }

if (-not $token) {
    Write-Host "Failed to extract token from login response:" -ForegroundColor Red
    $loginResp | ConvertTo-Json | Write-Host
    exit 1
}

Write-Host "Token obtained (truncated): $($token.Substring(0,20))..."
$headers = @{ Authorization = "Bearer $token" }

function GetProfile($username) {
    $url = "$ApiBase/auth/$username"
    Write-Host "GET $url"
    try {
        $resp = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
        return $resp
    } catch {
        Write-Host "GET profile failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Get profile before
$before = GetProfile $TargetUsername
Write-Host "Before follower_count: $($before.data.follower_count)"

# Follow
Write-Host "POST follow -> $ApiBase/auth/$TargetUsername/follow"
try {
    $followResp = Invoke-RestMethod -Uri "$ApiBase/auth/$TargetUsername/follow" -Method Post -Headers $headers -ErrorAction Stop
    Write-Host "Follow response:"; $followResp | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Follow failed: $_" -ForegroundColor Red
    exit 1
}

# Get profile after follow
$afterFollow = GetProfile $TargetUsername
Write-Host "After follow follower_count: $($afterFollow.data.follower_count)"

# Unfollow
Write-Host "DELETE unfollow -> $ApiBase/auth/$TargetUsername/follow"
try {
    $unfollowResp = Invoke-RestMethod -Uri "$ApiBase/auth/$TargetUsername/follow" -Method Delete -Headers $headers -ErrorAction Stop
    Write-Host "Unfollow response:"; $unfollowResp | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Unfollow failed: $_" -ForegroundColor Red
    exit 1
}

# Get profile after unfollow
$afterUnfollow = GetProfile $TargetUsername
Write-Host "After unfollow follower_count: $($afterUnfollow.data.follower_count)"

Write-Host "Test follow/unfollow finished." -ForegroundColor Green
