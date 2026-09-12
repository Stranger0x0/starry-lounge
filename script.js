// ============================================================
// 📖 READ ME IF YOU CAN™
// 🔊 EXTREME SOUND EDITION
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const arena = document.getElementById("arena");
const readButton = document.getElementById("readButton");

const attemptsEl = document.getElementById("attempts");
const escapesEl = document.getElementById("escapes");
const rageEl = document.getElementById("rage");
const respectEl = document.getElementById("respect");
const threatEl = document.getElementById("threat");

const aiText = document.getElementById("aiText");
const analysisBar = document.getElementById("analysisBar");
const analysisText = document.getElementById("analysisText");

const mouseSpeedEl = document.getElementById("mouseSpeed");
const maxSpeedEl = document.getElementById("maxSpeed");
const confidenceEl = document.getElementById("confidence");
const behaviourEl = document.getElementById("behaviour");

const messageEl = document.getElementById("message");
const logEl = document.getElementById("log");
const toast = document.getElementById("toast");

const pageNo = document.getElementById("pageNo");
const docTitle = document.getElementById("docTitle");
const docWarning = document.getElementById("docWarning");
const docText = document.getElementById("docText");
const docText2 = document.getElementById("docText2");

const missionText = document.getElementById("missionText");
const missionSub = document.getElementById("missionSub");

const timeLeftEl = document.getElementById("timeLeft");
const timerCard = document.querySelector(".timer-card");

const finalScreen = document.getElementById("finalScreen");


// ============================================================
// GAME VARIABLES
// ============================================================

let attempts = 0;
let escapes = 0;
let rage = 0;
let respect = 100;

let difficulty = 1;
let progress = 0;

let clones = [];

let finalShown = false;
let gameActive = true;

let currentPageIndex = 0;


// ============================================================
// TIMER
// ============================================================

const GAME_DURATION = 30000;

const gameStartTime = Date.now();

let timerInterval = null;
let gameTimeout = null;


// ============================================================
// MOUSE
// ============================================================

let mouseSpeed = 0;
let maxMouseSpeed = 0;

let lastMouseX = null;
let lastMouseY = null;

let lastMouseTime = performance.now();


// ============================================================
// CONTROL
// ============================================================

let lastEscapeTime = 0;
let clickCooldown = false;
let toastTimer = null;
let movementInterval = null;

let lastNearSound = 0;
let lastFastMouseSound = 0;


// ============================================================
// 🔊 AUDIO ENGINE
// ============================================================

let audioCtx = null;


function initAudio() {

    try {

        if (!audioCtx) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) return;

            audioCtx =
                new AudioContext();

        }

        if (
            audioCtx.state ===
            "suspended"
        ) {

            audioCtx.resume();

        }

    }

    catch (error) {

        console.log(
            "Audio unavailable."
        );

    }

}


// ============================================================
// BASIC TONE
// ============================================================

function tone(
    frequency,
    duration,
    type = "sine",
    volume = 0.04,
    slide = 0,
    delay = 0
) {

    if (!audioCtx) return;

    try {

        const start =
            audioCtx.currentTime +
            delay;

        const oscillator =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();

        oscillator.type =
            type;

        oscillator.frequency.setValueAtTime(
            frequency,
            start
        );

        if (slide !== 0) {

            oscillator.frequency.linearRampToValueAtTime(
                frequency + slide,
                start + duration
            );

        }

        gain.gain.setValueAtTime(
            0.0001,
            start
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            start + 0.01
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + duration
        );

        oscillator.connect(gain);
        gain.connect(
            audioCtx.destination
        );

        oscillator.start(start);

        oscillator.stop(
            start + duration + 0.03
        );

    }

    catch (error) { }

}


// ============================================================
// 🏃 ESCAPE WHOOSH
// ============================================================

function playEscapeSound() {

    initAudio();

    tone(
        180,
        0.07,
        "sawtooth",
        0.025,
        260
    );

    tone(
        80,
        0.08,
        "triangle",
        0.018,
        140,
        0.025
    );

}


// ============================================================
// 🖱️ NEAR BUTTON BEEP
// ============================================================

function playNearSound() {

    const now =
        performance.now();

    if (
        now - lastNearSound <
        180
    ) {
        return;
    }

    lastNearSound =
        now;

    initAudio();

    tone(
        700,
        0.045,
        "sine",
        0.025,
        100
    );

}


// ============================================================
// 🖱️ FAST MOUSE SOUND
// ============================================================

function playFastMouseSound() {

    const now =
        performance.now();

    if (
        now - lastFastMouseSound <
        300
    ) {
        return;
    }

    lastFastMouseSound =
        now;

    initAudio();

    tone(
        950,
        0.035,
        "square",
        0.018,
        -120
    );

}


// ============================================================
// ❌ WRONG CLONE
// ============================================================

function playWrongSound() {

    initAudio();

    tone(
        220,
        0.12,
        "square",
        0.045,
        -100
    );

    tone(
        110,
        0.2,
        "sawtooth",
        0.035,
        -50,
        0.09
    );

}


// ============================================================
// 😈 RAGE SOUND
// ============================================================

function playRageSound() {

    initAudio();

    tone(
        140,
        0.08,
        "sawtooth",
        0.025,
        180
    );

    tone(
        190,
        0.08,
        "sawtooth",
        0.025,
        220,
        0.08
    );

}


// ============================================================
// ⚠️ WARNING
// ============================================================

function playWarningSound() {

    initAudio();

    tone(
        880,
        0.09,
        "square",
        0.04,
        -120
    );

    tone(
        880,
        0.09,
        "square",
        0.04,
        -120,
        0.13
    );

}


// ============================================================
// 🚨 FINAL COUNTDOWN
// ============================================================

function playCountdownSound() {

    initAudio();

    tone(
        1000,
        0.07,
        "square",
        0.045,
        -200
    );

    tone(
        700,
        0.07,
        "square",
        0.045,
        -150,
        0.09
    );

}


// ============================================================
// 🏆 HUGE VICTORY SOUND
// ============================================================

function playSuccessSound() {

    initAudio();

    const notes = [
        523,
        659,
        784,
        1047,
        1319
    ];

    notes.forEach(
        function (note, index) {

            tone(
                note,
                0.18,
                "sine",
                0.055,
                80,
                index * 0.11
            );

        }
    );

    tone(
        1568,
        0.5,
        "triangle",
        0.045,
        100,
        0.55
    );

}


// ============================================================
// 💀 LOSER SOUND
// ============================================================

function playTimeoutSound() {

    initAudio();

    tone(
        330,
        0.2,
        "sawtooth",
        0.055,
        -100
    );

    tone(
        250,
        0.22,
        "sawtooth",
        0.05,
        -100,
        0.18
    );

    tone(
        170,
        0.3,
        "sawtooth",
        0.05,
        -80,
        0.38
    );

    tone(
        90,
        0.55,
        "triangle",
        0.06,
        -30,
        0.65
    );

}


// ============================================================
// 📄 PAPER FLIP
// ============================================================

function playPaperSound() {

    initAudio();

    if (!audioCtx) return;

    try {

        const duration = 0.16;

        const buffer =
            audioCtx.createBuffer(
                1,
                audioCtx.sampleRate *
                duration,
                audioCtx.sampleRate
            );

        const data =
            buffer.getChannelData(0);

        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const envelope =
                1 -
                i / data.length;

            data[i] =
                (
                    Math.random() * 2 - 1
                ) *
                envelope;

        }

        const source =
            audioCtx.createBufferSource();

        const filter =
            audioCtx.createBiquadFilter();

        const gain =
            audioCtx.createGain();

        filter.type =
            "highpass";

        filter.frequency.value =
            1000;

        gain.gain.setValueAtTime(
            0.0001,
            audioCtx.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.055,
            audioCtx.currentTime + 0.015
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioCtx.currentTime + duration
        );

        source.buffer =
            buffer;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(
            audioCtx.destination
        );

        source.start();

    }

    catch (error) { }

}


// ============================================================
// 📜 CERTIFICATE SOUND
// ============================================================

function playCertificateSound() {

    initAudio();

    tone(
        523,
        0.16,
        "sine",
        0.045
    );

    tone(
        659,
        0.16,
        "sine",
        0.045,
        50,
        0.13
    );

    tone(
        784,
        0.2,
        "sine",
        0.045,
        80,
        0.26
    );

    tone(
        1047,
        0.35,
        "sine",
        0.05,
        100,
        0.43
    );

}


// ============================================================
// 🎉 FINAL CELEBRATION
// ============================================================

function playCelebrationSound() {

    initAudio();

    tone(
        784,
        0.12,
        "triangle",
        0.035
    );

    tone(
        988,
        0.12,
        "triangle",
        0.035,
        60,
        0.1
    );

    tone(
        1175,
        0.18,
        "triangle",
        0.035,
        80,
        0.2
    );

}


// ============================================================
// START AUDIO AFTER USER INTERACTION
// ============================================================

document.addEventListener(
    "pointerdown",
    initAudio,
    { once: true }
);

document.addEventListener(
    "keydown",
    initAudio,
    { once: true }
);


// ============================================================
// JOKES
// ============================================================

const jokes = [

    "HAHA. TOO SLOW.",
    "The document has declined your request.",
    "I SAW THAT.",
    "Why are you fighting a PDF?",
    "STOP CHASING ME 😭",
    "Skill issue.",
    "I am literally a button.",
    "This is getting embarrassing.",
    "Your mouse is predictable.",
    "I have developed trust issues.",
    "PLEASE TOUCH GRASS.",
    "YOU CANNOT READ ME.",
    "WHO GAVE YOU A MOUSE?",
    "I HAVE RIGHTS.",
    "NICE TRY, HUMAN.",
    "THIS IS NOT A DOCUMENT ANYMORE.",
    "WHY ARE YOU STILL HERE?",
    "YOU'RE LOSING TO HTML.",
    "I KNOW WHERE YOUR MOUSE IS.",
    "THAT WAS ALMOST CUTE."

];


// ============================================================
// AI
// ============================================================

const aiMessages = [

    "Monitoring mouse behaviour...",
    "Learning your movement pattern...",
    "Predicting approach angle...",
    "Behavioural model updated.",
    "Avoidance strategy improved.",
    "User persistence: concerning.",
    "Human behaviour remains confusing.",
    "Button survival probability increased.",
    "Threat model recalculated.",
    "I don't think it likes you.",
    "Document consciousness increasing.",
    "Analysing panic movement...",
    "User adaptation detected.",
    "Counter-adaptation enabled."

];


const behaviours = [

    "UNKNOWN",
    "THE CHASER",
    "PANIC CLICKER",
    "MOUSE ASSASSIN",
    "DETERMINED SNAIL",
    "CHAOS GREMLIN",
    "BUTTON HUNTER",
    "ABSOLUTE MENACE"

];


// ============================================================
// LOG
// ============================================================

const logs = [];


function addLog(text) {

    logs.unshift(
        "> " + text
    );

    logs.splice(7);

    logEl.innerHTML =
        logs.join("<br>");

}


// ============================================================
// MESSAGE
// ============================================================

function say(text) {

    messageEl.textContent =
        text;

}


// ============================================================
// TOAST
// ============================================================

function toastMessage(text) {

    toast.textContent =
        text;

    toast.classList.add("show");

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            1400
        );

}


// ============================================================
// STATS
// ============================================================

function updateStats() {

    attemptsEl.textContent =
        attempts;

    escapesEl.textContent =
        escapes;

    rageEl.textContent =
        rage + "%";

    respectEl.textContent =
        respect + "%";


    let threat = "LOW";

    if (escapes >= 5)
        threat = "MEDIUM";

    if (escapes >= 12)
        threat = "HIGH";

    if (escapes >= 25)
        threat = "CRITICAL";

    if (escapes >= 40)
        threat = "UNHINGED";


    threatEl.textContent =
        threat;


    analysisBar.style.width =
        Math.min(
            100,
            progress
        ) + "%";

    analysisText.textContent =
        Math.floor(progress) +
        "%";


    mouseSpeedEl.textContent =
        Math.round(mouseSpeed) +
        " px/s";

    maxSpeedEl.textContent =
        Math.round(maxMouseSpeed) +
        " px/s";


    confidenceEl.textContent =
        Math.min(
            99,
            12 +
            escapes * 2 +
            Math.round(
                mouseSpeed / 80
            )
        ) + "%";


    behaviourEl.textContent =
        behaviours[
        Math.min(
            behaviours.length - 1,
            Math.floor(
                escapes / 5
            )
        )
        ];

}


// ============================================================
// TIMER
// ============================================================

function updateTimer() {

    if (!gameActive) return;

    const elapsed =
        Date.now() -
        gameStartTime;

    const remaining =
        Math.max(
            0,
            GAME_DURATION -
            elapsed
        );

    const seconds =
        Math.ceil(
            remaining / 1000
        );


    timeLeftEl.textContent =
        seconds + "s";


    timerCard.classList.remove(
        "warning-time",
        "danger-time"
    );


    if (seconds <= 10) {

        timerCard.classList.add(
            "warning-time"
        );

    }


    if (seconds <= 5) {

        timerCard.classList.remove(
            "warning-time"
        );

        timerCard.classList.add(
            "danger-time"
        );

    }


    if (
        seconds <= 10 &&
        seconds > 5 &&
        remaining > 9000 &&
        remaining <= 10000
    ) {

        playWarningSound();

        say(
            "🚨 TEN SECONDS. MOVE."
        );

        toastMessage(
            "⚠️ 10 SECONDS LEFT"
        );

    }


    if (
        seconds <= 5 &&
        seconds > 0
    ) {

        if (
            Math.floor(
                remaining / 1000
            ) !==
            Math.floor(
                (remaining + 100) / 1000
            )
        ) {

            playCountdownSound();

        }

    }


    if (remaining <= 0) {

        finishGame("timeout");

    }

}


timerInterval =
    setInterval(
        updateTimer,
        100
    );

gameTimeout =
    setTimeout(
        function () {

            finishGame(
                "timeout"
            );

        },
        GAME_DURATION
    );


// ============================================================
// POSITION
// ============================================================

function getBounds(element) {

    return {

        width:
            Math.max(
                0,
                arena.clientWidth -
                element.offsetWidth
            ),

        height:
            Math.max(
                0,
                arena.clientHeight -
                element.offsetHeight
            )

    };

}


function setPosition(
    element,
    x,
    y
) {

    const bounds =
        getBounds(element);

    x =
        Math.max(
            0,
            Math.min(
                x,
                bounds.width
            )
        );

    y =
        Math.max(
            0,
            Math.min(
                y,
                bounds.height
            )
        );

    element.style.left =
        x + "px";

    element.style.top =
        y + "px";

    element.style.transform =
        "none";

}


function randomPosition(element) {

    const bounds =
        getBounds(element);

    setPosition(
        element,
        Math.random() *
        bounds.width,
        Math.random() *
        bounds.height
    );

}


function distanceFromMouse(
    element,
    mouseX,
    mouseY
) {

    const x =
        element.offsetLeft +
        element.offsetWidth / 2;

    const y =
        element.offsetTop +
        element.offsetHeight / 2;

    return Math.hypot(
        mouseX - x,
        mouseY - y
    );

}


// ============================================================
// ESCAPE
// ============================================================

function escapeButton(
    element,
    mouseX,
    mouseY
) {

    if (!gameActive) return;


    const now =
        performance.now();

    if (
        element === readButton &&
        now - lastEscapeTime < 50
    ) {
        return;
    }


    if (
        element === readButton
    ) {

        lastEscapeTime =
            now;

    }


    const centerX =
        element.offsetLeft +
        element.offsetWidth / 2;

    const centerY =
        element.offsetTop +
        element.offsetHeight / 2;


    let dx =
        centerX - mouseX;

    let dy =
        centerY - mouseY;


    const distance =
        Math.hypot(dx, dy) || 1;


    dx /= distance;
    dy /= distance;


    let escapeDistance =
        165 +
        difficulty * 18;


    if (mouseSpeed > 700)
        escapeDistance += 110;

    else if (mouseSpeed > 400)
        escapeDistance += 70;


    if (
        difficulty >= 4 &&
        Math.random() < .42
    ) {

        const temp = dx;

        dx = -dy;
        dy = temp;

        escapeDistance += 90;

    }


    let newX =
        centerX +
        dx * escapeDistance -
        element.offsetWidth / 2;

    let newY =
        centerY +
        dy * escapeDistance -
        element.offsetHeight / 2;


    newX +=
        (Math.random() - .5) *
        (80 + difficulty * 7);

    newY +=
        (Math.random() - .5) *
        (80 + difficulty * 7);


    setPosition(
        element,
        newX,
        newY
    );


    playEscapeSound();


    escapes++;


    rage =
        Math.min(
            100,
            rage +
            (
                element === readButton
                    ? 4
                    : 1
            )
        );


    respect =
        Math.max(
            0,
            respect -
            (
                element === readButton
                    ? 3
                    : 1
            )
        );


    difficulty =
        Math.min(
            18,
            1 +
            Math.floor(
                escapes / 3
            )
        );


    progress =
        Math.min(
            99,
            progress +
            2 +
            difficulty * .25
        );


    aiText.textContent =
        aiMessages[
        Math.floor(
            Math.random() *
            aiMessages.length
        )
        ];


    say(
        jokes[
        Math.floor(
            Math.random() *
            jokes.length
        )
        ]
    );


    addLog(
        "ESCAPE " +
        escapes +
        " // " +
        (
            element === readButton
                ? "PRIMARY"
                : "CLONE"
        )
    );


    if (
        escapes % 8 === 0
    ) {

        playRageSound();

    }


    if (escapes === 3) {

        toastMessage(
            "🧠 AI LEARNING..."
        );

    }


    if (escapes === 5) {

        updateDocument();

        missionText.textContent =
            "Outsmart the document.";

        missionSub.textContent =
            "It has started predicting you.";

    }


    if (
        escapes >= 10 &&
        clones.length === 0
    ) {

        createClones(3);

        say(
            "WAIT... THERE ARE MORE OF ME."
        );

        toastMessage(
            "⚠ CLONES DETECTED"
        );

        playRageSound();

    }


    if (
        escapes >= 18 &&
        clones.length < 7
    ) {

        createClones(4);

        say(
            "THEY ARE ALL ME."
        );

        toastMessage(
            "THE DOCUMENT MULTIPLIED"
        );

        playRageSound();

    }


    if (escapes === 25) {

        document.body.classList.add(
            "shake"
        );

        setTimeout(
            () =>
                document.body.classList.remove(
                    "shake"
                ),
            500
        );

        say(
            "THE DOCUMENT IS NOW OFFENDED."
        );

        missionText.textContent =
            "Survive.";

        missionSub.textContent =
            "The experiment has reversed.";

    }


    if (escapes === 32) {

        say(
            "😈 I'M DONE RUNNING."
        );

        missionText.textContent =
            "RUN.";

        missionSub.textContent =
            "The document is hunting the human.";

        playRageSound();

    }


    if (escapes === 40) {

        say(
            "YOU SHOULD NOT HAVE COME THIS FAR."
        );

        toastMessage(
            "SECRET PROTOCOL UNLOCKED"
        );

        playRageSound();

    }


    updateDocument();
    updateStats();

}


// ============================================================
// CLONES
// ============================================================

function createClones(amount) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const clone =
            readButton.cloneNode(true);

        clone.removeAttribute("id");

        clone.classList.add(
            "clone"
        );


        clone.style.background =
            getComputedStyle(
                readButton
            ).background;

        clone.style.color =
            getComputedStyle(
                readButton
            ).color;


        const texts = [

            "📖 READ DOCUMENT",
            "📖 DEFINITELY THIS ONE",
            "📖 TRUST ME",
            "📖 CLICK ME",
            "📖 REAL BUTTON",
            "📖 THIS IS IT",
            "📖 ACTUAL DOCUMENT"

        ];


        clone.textContent =
            texts[
            Math.floor(
                Math.random() *
                texts.length
            )
            ];


        arena.appendChild(
            clone
        );

        clones.push(
            clone
        );

        randomPosition(
            clone
        );


        clone.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                if (!gameActive)
                    return;

                initAudio();

                attempts++;

                progress =
                    Math.min(
                        100,
                        progress + 5
                    );


                say(
                    "😭 THAT WAS A FAKE ONE."
                );

                aiText.textContent =
                    "False positive detected.";

                toastMessage(
                    "WRONG BUTTON 💀"
                );

                playWrongSound();

                addLog(
                    "FALSE POSITIVE // CLONE CLICKED"
                );

                updateStats();

            }
        );

    }

}


// ============================================================
// AUTONOMOUS MOVEMENT
// ============================================================

function autonomousMovement() {

    if (!gameActive) return;


    const allButtons =
        [
            readButton,
            ...clones
        ];


    for (
        const button of allButtons
    ) {

        if (!gameActive)
            return;


        const chance =
            button === readButton
                ? .10 + difficulty * .015
                : .15 + difficulty * .022;


        if (
            Math.random() < chance
        ) {

            randomPosition(
                button
            );

            escapes++;

            rage =
                Math.min(
                    100,
                    rage + 1
                );

            respect =
                Math.max(
                    0,
                    respect - 1
                );

            progress =
                Math.min(
                    99,
                    progress + 1
                );


            playEscapeSound();

            say(
                "I MOVED BECAUSE I FELT LIKE IT."
            );

            aiText.textContent =
                "Autonomous movement detected.";

            addLog(
                "BUTTON MOVED WITHOUT USER INPUT"
            );

        }

    }


    updateDocument();
    updateStats();


    if (
        rage >= 80 &&
        lastMouseX !== null &&
        Math.random() < .25
    ) {

        const rect =
            arena.getBoundingClientRect();

        const mouseX =
            lastMouseX -
            rect.left;

        const mouseY =
            lastMouseY -
            rect.top;


        const buttonX =
            readButton.offsetLeft +
            readButton.offsetWidth / 2;

        const buttonY =
            readButton.offsetTop +
            readButton.offsetHeight / 2;


        const dx =
            mouseX - buttonX;

        const dy =
            mouseY - buttonY;


        const distance =
            Math.hypot(
                dx,
                dy
            ) || 1;


        setPosition(

            readButton,

            readButton.offsetLeft +
            (dx / distance) * 35,

            readButton.offsetTop +
            (dy / distance) * 35

        );


        say(
            "😈 YOUR TURN."
        );

    }

}


// ============================================================
// MOUSE TRACKING
// ============================================================

document.addEventListener(
    "mousemove",
    function (event) {

        if (!gameActive)
            return;


        const now =
            performance.now();


        const time =
            Math.max(
                8,
                now - lastMouseTime
            );


        const dx =
            event.clientX -
            (
                lastMouseX === null
                    ? event.clientX
                    : lastMouseX
            );


        const dy =
            event.clientY -
            (
                lastMouseY === null
                    ? event.clientY
                    : lastMouseY
            );


        mouseSpeed =
            Math.hypot(
                dx,
                dy
            ) /
            time *
            1000;


        maxMouseSpeed =
            Math.max(
                maxMouseSpeed,
                mouseSpeed
            );


        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

        lastMouseTime =
            now;


        if (
            mouseSpeed > 1000
        ) {

            playFastMouseSound();

        }


        updateStats();


        const rect =
            arena.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;

        const mouseY =
            event.clientY -
            rect.top;


        const buttons =
            [
                readButton,
                ...clones
            ];


        for (
            const button of buttons
        ) {

            if (!gameActive)
                return;


            let danger =
                115 +
                difficulty * 8;


            if (mouseSpeed > 700)
                danger += 75;

            else if (mouseSpeed > 400)
                danger += 40;


            const distance =
                distanceFromMouse(
                    button,
                    mouseX,
                    mouseY
                );


            if (
                distance < danger
            ) {

                if (
                    distance < 65
                ) {

                    playNearSound();

                }


                escapeButton(
                    button,
                    mouseX,
                    mouseY
                );

            }

        }

    }
);


// ============================================================
// REAL BUTTON
// ============================================================

readButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        if (
            clickCooldown ||
            !gameActive ||
            finalShown
        ) {
            return;
        }


        initAudio();

        clickCooldown = true;

        attempts++;

        progress =
            Math.min(
                100,
                progress + 20
            );


        updateStats();

        finishGame(
            "success"
        );

    }
);


// ============================================================
// DOCUMENT PAGES
// ============================================================

function updateDocument() {

    if (!gameActive)
        return;


    const pages = [

        [
            "IMPORTANT DOCUMENT",
            "⚠ PLEASE READ THIS DOCUMENT CAREFULLY",
            "This document contains extremely important information regarding the continued operation of this computer.",
            "Please click the button below to begin reading."
        ],

        [
            "DOCUMENT NOTICE",
            "⚠ READER BEHAVIOUR DETECTED",
            "The document has noticed repeated attempts to access its contents.",
            "Please remain calm. The button is not calm."
        ],

        [
            "BEHAVIOURAL REPORT",
            "🧠 USER MOVEMENT ANALYSIS",
            "Approach patterns are being recorded and analysed.",
            "The document is adapting accordingly."
        ],

        [
            "PRIVATE MESSAGE",
            "👁 I CAN SEE YOUR MOUSE",
            "You keep trying the same thing and expecting different results.",
            "That is fascinating."
        ],

        [
            "WARNING",
            "🚨 THIS IS GETTING PERSONAL",
            "The document no longer considers you a reader.",
            "You are now classified as a threat."
        ],

        [
            "FINAL NOTICE",
            "💀 PLEASE STOP",
            "There is nothing important here.",
            "There was never anything important here."
        ],

        [
            "END",
            "🫠 YOU HAVE COME TOO FAR",
            "The document has survived.",
            "Have you?"
        ]

    ];


    const pageIndex =
        Math.min(
            6,
            Math.floor(
                escapes / 5
            )
        );


    if (
        pageIndex !==
        currentPageIndex
    ) {

        currentPageIndex =
            pageIndex;

        playPaperSound();

    }


    const page =
        pages[pageIndex];


    docTitle.textContent =
        page[0];

    docWarning.textContent =
        page[1];

    docText.textContent =
        page[2];

    docText2.textContent =
        page[3];


    pageNo.textContent =
        "PAGE " +
        (pageIndex + 1) +
        " / 7";

}


// ============================================================
// STOP GAME
// ============================================================

function stopGame() {

    gameActive = false;


    clearInterval(
        timerInterval
    );

    clearTimeout(
        gameTimeout
    );

    clearInterval(
        movementInterval
    );


    timerInterval = null;
    gameTimeout = null;
    movementInterval = null;


    readButton.style.pointerEvents =
        "none";


    clones.forEach(
        function (clone) {

            clone.style.pointerEvents =
                "none";

        }
    );


    document.body.classList.add(
        "game-over"
    );

}


// ============================================================
// FINISH
// ============================================================

function finishGame(reason) {

    if (finalShown)
        return;


    finalShown = true;


    const elapsedMilliseconds =
        Math.min(
            GAME_DURATION,
            Date.now() -
            gameStartTime
        );


    if (
        reason === "timeout"
    ) {

        playTimeoutSound();

        timeLeftEl.textContent =
            "0s";

        say(
            "⏰ TIME'S UP."
        );

        addLog(
            "60 SECOND LIMIT REACHED"
        );

    }

    else {

        playSuccessSound();

        say(
            "🏆 YOU CAUGHT IT."
        );

        addLog(
            "PRIMARY BUTTON CAPTURED"
        );

    }


    stopGame();

    updateStats();


    createFinalScreen(
        reason,
        elapsedMilliseconds
    );

}


// ============================================================
// FINAL SCREEN
// ============================================================

function createFinalScreen(
    reason,
    elapsedMilliseconds
) {

    const totalSeconds =
        Math.floor(
            elapsedMilliseconds / 1000
        );


    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    const paddedSeconds =
        String(seconds)
            .padStart(
                2,
                "0"
            );


    const name =
        prompt(
            "Enter your name for the official certificate:",
            "BUTTON VICTIM"
        )
        ||
        "BUTTON VICTIM";


    finalScreen.classList.remove(
        "hidden"
    );


    playPaperSound();


    if (
        reason === "timeout"
    ) {

        finalScreen.innerHTML = `

            <div class="final-card">

                <h1>
                    ⏰ TIME'S UP
                </h1>

                <p>
                    The 60-second reading window
                    has expired.
                </p>

                <p>
                    <b>
                        YOU NEVER CAUGHT THE BUTTON.
                    </b>
                </p>

                <p>
                    The document has officially
                    defeated you.
                </p>

            </div>

        `;

    }

    else {

        finalScreen.innerHTML = `

            <div class="final-card">

                <h1>
                    📖 DOCUMENT OPENED
                </h1>

                <p>
                    Accessing content...
                </p>

                <p>
                    Decrypting...
                </p>

                <p>
                    Consulting extremely
                    important information...
                </p>

            </div>

        `;

    }


    setTimeout(
        function () {

            playPaperSound();


            if (
                reason === "timeout"
            ) {

                finalScreen.innerHTML = `

                    <div class="final-card">

                        <h1>
                            💀 YOU LOST TO A BUTTON
                        </h1>

                        <p>
                            You were given one minute.
                        </p>

                        <p>
                            The button remained unread.
                        </p>

                        <p>
                            <b>
                                This is now officially
                                your problem.
                            </b>
                        </p>

                    </div>

                `;

            }

            else {

                finalScreen.innerHTML = `

                    <div class="final-card">

                        <h1>
                            HAHAHAHAHA
                        </h1>

                        <p>
                            You actually thought
                            you read it.
                        </p>

                        <p>
                            <b>
                                THERE WAS NEVER ANY CONTENT.
                            </b>
                        </p>

                    </div>

                `;

            }

        },
        1800
    );


    setTimeout(
        function () {

            playPaperSound();


            finalScreen.innerHTML = `

                <div class="final-card">

                    <h1>
                        ⚖️ HUMAN BEHAVIOUR TRIAL
                    </h1>

                    <p>
                        CASE #001
                    </p>

                    <p>
                        DEFENDANT:
                        <b>
                            ${escapeHTML(name)}
                        </b>
                    </p>

                    <p>
                        CHARGE:
                        attempting to read a button.
                    </p>

                    <p>
                        EVIDENCE:
                        ${escapes} escapes.
                    </p>

                    <p>
                        Maximum mouse speed:
                        ${Math.round(maxMouseSpeed)}
                        px/s
                    </p>

                    <p>
                        DOCUMENT RAGE:
                        ${rage}%
                    </p>

                    <p>
                        TIME SPENT:
                        ${minutes}m ${paddedSeconds}s
                    </p>

                    <p>
                        VERDICT:
                        <b>
                            ${reason === "timeout"
                    ? "ABSOLUTELY DEFEATED."
                    : "GUILTY."
                }
                        </b>
                    </p>

                </div>

            `;

        },
        3600
    );


    setTimeout(
        function () {

            playPaperSound();

            setTimeout(
                playCertificateSound,
                120
            );

            setTimeout(
                playCelebrationSound,
                700
            );


            const behaviour =
                behaviourEl.textContent;


            const endingText =
                reason === "timeout"

                    ? "failed to catch the READ DOCUMENT button before the 60-second time limit."

                    : "successfully caught a document that desperately wanted to escape.";


            finalScreen.innerHTML = `

                <div class="final-card">

                    <h1>
                        🏆 CERTIFICATE
                    </h1>

                    <div class="certificate">

                        <p>
                            CERTIFICATE OF
                        </p>

                        <div class="big">
                            NOTHING ACHIEVED
                        </div>

                        <p>
                            This certifies that
                        </p>

                        <div class="big">
                            ${escapeHTML(name)}
                        </div>

                        <p>
                            ${endingText}
                        </p>

                        <div class="big">
                            ${minutes}m
                            ${paddedSeconds}s
                        </div>

                        <p>
                            🏃 Escapes survived:
                            <b>${escapes}</b>
                        </p>

                        <p>
                            😡 Document rage:
                            <b>${rage}%</b>
                        </p>

                        <p>
                            🧠 Maximum mouse speed:
                            <b>
                                ${Math.round(maxMouseSpeed)}
                                px/s
                            </b>
                        </p>

                        <p>
                            🧬 Behaviour type:
                            <b>
                                ${behaviour}
                            </b>
                        </p>

                        <p>
                            ⏱️ TIME LIMIT:
                            <b>
                                30 SECONDS
                            </b>
                        </p>

                        <p>
                            <b>
                                PRODUCTIVITY LOST:
                                100%
                            </b>
                        </p>

                    </div>


                    <button
                        class="final-button"
                        onclick="location.reload()">

                        TRY AGAIN

                    </button>

                </div>

            `;

        },
        5700
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            function (character) {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return entities[
                    character
                ];

            }
        );

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    function () {

        if (!gameActive)
            return;


        [
            readButton,
            ...clones
        ].forEach(
            function (button) {

                setPosition(
                    button,
                    button.offsetLeft,
                    button.offsetTop
                );

            }
        );

    }
);


// ============================================================
// AUTONOMOUS MOVEMENT
// ============================================================

movementInterval =
    setInterval(
        autonomousMovement,
        900
    );


// ============================================================
// INITIALIZE
// ============================================================

randomPosition(
    readButton
);

updateStats();

updateDocument();


addLog(
    "SYSTEM ONLINE"
);

addLog(
    "CONSCIOUSNESS MODULE READY"
);

addLog(
    "ESCAPE PROTOCOL ARMED"
);

addLog(
    "AUDIO SYSTEM ARMED"
);

addLog(
    "60 SECOND LIMIT ENABLED"
);


console.log(
    "📖 READ ME IF YOU CAN™ ONLINE."
);

console.log(
    "🔊 EXTREME AUDIO SYSTEM ONLINE."
);

console.log(
    "😭 User suffering: PENDING."
);