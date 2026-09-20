let ram
let vram
let emulator
let ispsp = false
let clickenabled = false

function EnterFullscreen(){
    if (!document.querySelector("#OperatingSystemSelector").value.startsWith("gdlite")) {
        document.getElementById("vm").requestFullscreen()
    } else {
        document.getElementById("iframe").requestFullscreen()
    }
}

document.addEventListener("fullscreenchange", function(){if (document.fullscreenElement) {emulator.screen_set_scale(1.5, 1.5)} else {emulator.screen_set_scale(1, 1)}})
Setup()
document.getElementById("vm").style.display = "flex";
document.getElementById("gamediv").style.display = "none";

let mouseA = false;

document.addEventListener("mousedown", function (e) { 
    if (!clickenabled) {return}

    if (!window.EJS_emulator) {
        console.log("EJS_emulator does not exist");
        return;
    }

    const id = e.target.id;
    const isCanvas = e.target.classList.contains("ejs_canvas");

    if (
        id !== "game" &&
        id !== "gamediv" &&
        id !== "gamecanvas" &&
        !isCanvas
    ) {
        console.log("Invalid target");
        return;
    }

    mouseA = true;
    console.log("Valid target - pressing A");

    if (ispsp) {
        EJS_emulator.gameManager.simulateInput(0, 0, 1);
    } else {
        EJS_emulator.gameManager.simulateInput(0, 8, 1);
    }
});

document.addEventListener("mouseup", function (e) {
    if (!clickenabled) {return}

    if (!window.EJS_emulator) {
        console.log("EJS_emulator does not exist");
        return;
    }

    if (!mouseA) {
        console.log("No active mouse A press");
        return;
    }

    mouseA = false;
    console.log("Releasing A");

    if (ispsp) {
        EJS_emulator.gameManager.simulateInput(0, 0, 0);
    } else {
        EJS_emulator.gameManager.simulateInput(0, 8, 0);
    }

});

async function ClearCookies() {
    const doit = confirm(
        "This will clear all website cookies, Local Storage, Session Storage, IndexedDB, and Cache Storage. Do you want to continue?"
    );

    if (!doit) return;

    // Clear accessible cookies
    document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim();

        for (const path of ["/", location.pathname]) {
            document.cookie =
                `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        }
    });

    // Clear Web Storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear IndexedDB
    if (indexedDB.databases) {
        const databases = await indexedDB.databases();

        await Promise.all(
            databases.map(db => {
                return new Promise(resolve => {
                    const request = indexedDB.deleteDatabase(db.name);

                    request.onsuccess = resolve;
                    request.onerror = resolve;
                    request.onblocked = resolve;
                });
            })
        );
    }

    // Clear Cache Storage
    if ("caches" in window) {
        const cacheNames = await caches.keys();

        await Promise.all(
            cacheNames.map(name => caches.delete(name))
        );
    }

    window.location.reload()
}

async function StartLinux(ISO) {
    document.getElementById("gamediv").style.display = "none";
    document.getElementById("vm").style.display = "flex";
    document.getElementById("button").remove()
    HideSettings()
    document.getElementById("controls").style.display = "flex"

    emulator = new V86({
        screen_container: document.getElementById("vm"),
        memory_size: ram,
        vga_memory_size: vram,
        network_adapter: true,
        audio: true,
        filesystem: {},
        cdrom: {
            buffer: ISO
        },

        bios: {
            url: "bios/seabios.bin"
        },

        vga_bios: {
            url: "bios/vgabios.bin"
        },

        net_device: {
            type: "ne2k",
            relay_url: "wss://relay.widgetry.org/"
        },
    })

    emulator.add_listener("emulator-ready", async function() {
        await emulator.run()
    })

    document.getElementById("vm").addEventListener("click", function() {
        emulator.lock_mouse()
    })
}

async function Setup(){
    ram = Math.abs(Number(document.getElementById("Ram").value) * 1024 * 1024)
    const gb = (ram / 1024 / 1024 / 1024).toFixed(2);
    document.getElementById("RamLabel").innerHTML = "Ram (" + gb + " GB) :"
    vram = Math.abs(Number(document.getElementById("VRam").value) * 1024 * 1024)
    const mb = (vram / 1024 / 1024).toFixed(0);
    document.getElementById("VRamLabel").innerHTML = "VRam (" + mb + " MB) :"
    document.getElementById("controls").style.display = "none"
}

async function HideSettings(){
    document.getElementById("Ram").style.display = "none"
    document.getElementById("VRam").style.display = "none"
    ram = Math.abs(Number(document.getElementById("Ram").value) * 1024 * 1024)
    const gb = (ram / 1024 / 1024 / 1024).toFixed(2);
    document.getElementById("RamLabel").innerHTML = "Ram (" + gb + " GB)"
    vram = Math.abs(Number(document.getElementById("VRam").value) * 1024 * 1024)
    const mb = (vram / 1024 / 1024).toFixed(0);
    document.getElementById("VRamLabel").innerHTML = "VRam (" + mb + " MB)"
}

document.getElementById("Ram").addEventListener("input", function(){
    ram = Math.abs(Number(document.getElementById("Ram").value) * 1024 * 1024)
    const gb = (ram / 1024 / 1024 / 1024).toFixed(2);
    document.getElementById("RamLabel").innerHTML = "Ram (" + gb + " GB) :"
})

document.getElementById("VRam").addEventListener("input", function(){
    vram = Math.abs(Number(document.getElementById("VRam").value) * 1024 * 1024)
    const mb = (vram / 1024 / 1024).toFixed(0);
    document.getElementById("VRamLabel").innerHTML = "VRam (" + mb + " MB) :"
})

async function ClearCookies() {
    const doit = confirm(
        "This will clear all website cookies, Local Storage, Session Storage, IndexedDB, and Cache Storage. Do you want to continue?"
    )

    if (!doit) return

    // Cookies
    document.cookie.split(";").forEach(cookie => {
        const name = cookie.split("=")[0].trim()

        for (const path of ["/", location.pathname]) {
            document.cookie =
                `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
        }
    })

    // Local + Session Storage
    localStorage.clear()
    sessionStorage.clear()

    // IndexedDB
    if (indexedDB.databases) {
        const databases = await indexedDB.databases()

        await Promise.all(
            databases.map(db => {
                return new Promise(resolve => {
                    const request = indexedDB.deleteDatabase(db.name)

                    request.onsuccess = resolve
                    request.onerror = resolve
                    request.onblocked = resolve
                })
            })
        )
    }

    // Cache Storage
    if ("caches" in window) {
        const cacheNames = await caches.keys()

        await Promise.all(
            cacheNames.map(name => caches.delete(name))
        )
    }

    // Reload so the application doesn't keep
    // using deleted database connections/state.
    location.reload()
}

function Notify(text, color = "#555") {
    const container = document.getElementById("notifications")

    const notification = document.createElement("div")
    notification.className = "notification"
    notification.style.background = color

    notification.innerHTML = `
        ${text}
        <button class="notification-close">×</button>
    `

    container.appendChild(notification)

    notification.offsetHeight

    notification.classList.add("show")

    const close = notification.querySelector(".notification-close")

    close.onclick = function() {
        notification.classList.remove("show")

        setTimeout(function() {
            notification.remove()
        }, 250)
    }

    setTimeout(function() {
        if (notification.parentElement) {
            notification.classList.remove("show")

            setTimeout(function() {
                notification.remove()
            }, 250)
        }
    }, 5000)
}

function downloadFromUrl() {
    document.location.href = document.getElementById("OperatingSystemSelector").value
}

async function StartConsole(id, threads, consolename, file, buttonmapping) {
    document.getElementById("vm").style.display = "none";
    document.getElementById("divbutton").style.display = "none";
    document.getElementById("gamediv").style.display = "";
    document.getElementById("settingsliders").style.display = "none"
    document.getElementById("controls").style.display = "flex";
    document.getElementById("fullscreenbutton").style.display = "none"
    document.querySelector("#OperatingSystemSelector").disabled = true;
    const startupBtn = document.getElementById("button");
    if (startupBtn) startupBtn.remove();

    const fileBlob = await new Blob([file]);

    const ROMURL = URL.createObjectURL(fileBlob);

    window.EJS_pathtodata = "https://cdn.emulatorjs.org/nightly/data/";
    window.EJS_startOnLoaded = true;
    window.EJS_player = "#game";
    window.EJS_core = consolename;
    window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
    window.EJS_gameUrl = ROMURL;
    window.EJS_gameName = id;
    EJS_threads = threads
    window.EJS_defaultControls = {
        0: {
            0: { 'value': buttonmapping[0], 'value2': 'BUTTON_2' },
            //  2: { 'value': 'Escape', 'value2': 'SELECT' },
            2: { 'value': buttonmapping[2], 'value2': 'SELECT' },
            3: { 'value': buttonmapping[3], 'value2': 'START' },
            4: { 'value': buttonmapping[4], 'value2': 'DPAD_UP' },
            5: { 'value': buttonmapping[5], 'value2': 'DPAD_DOWN' },
            6: { 'value': buttonmapping[6], 'value2': 'DPAD_LEFT' },
            7: { 'value': buttonmapping[7], 'value2': 'DPAD_RIGHT' },
            8: { 'value': buttonmapping[8], 'value2': 'BUTTON_1' },
            10: {
                'value': buttonmapping[10],
                'value2': 'LEFT_TOP_SHOULDER'
            },
            11: {
                'value': buttonmapping[11],
                'value2': 'RIGHT_TOP_SHOULDER'
            },
        },
        1: {},
        2: {},
        3: {}
    };

    const script = document.createElement("script");
    script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
    document.body.appendChild(script);
}

async function uploadFile() {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";

        input.onchange = async () => {
            resolve(await input.files[0].arrayBuffer());
        };

        input.click();
    });
}

async function WhichToStart(){
    const file = await uploadFile()
    const state = document.getElementById("Emulator").value
    const threads = document.getElementById("Threads").value
    const id = document.getElementById("gameid").value
    const canclick = document.getElementById("leftclick").value

    if (!file) {return}

    document.getElementById("settings").style.display = "none"
    document.getElementById("SettingsLabel").style.display = "none"
    document.getElementById("controlsiguess").style.display = "none"

    const pspbuttonmapping = {
            0: "space",
            2: "Tab",
            3: "Enter",
            4: "up arrow",
            5: "down arrow",
            6: "left arrow",
            7: "right arrow",
            8: "Backspace",
            10: "l",
            11: "r"
    }

    const buttonmapping = {
            0: "Backspace",
            2: "Tab",
            3: "Enter",
            4: "up arrow",
            5: "down arrow",
            6: "left arrow",
            7: "right arrow",
            8: "space",
            10: "l",
            11: "r"
    }

    clickenabled = canclick

    if (state == "v86") {
        StartLinux(file)
        return
    }

    if (state == "nes") {
        StartConsole(id, threads, "nes", file, buttonmapping)
        return
    }

    if (state == "gba") {
        StartConsole(id, threads, "gba", file, buttonmapping)
        return
    }

    if (state == "nds") {
        StartConsole(id, threads, "nds", file, buttonmapping)
        return
    }

    if (state == "psp") {
        StartConsole(id, threads, "psp", file, buttonmapping)
        ispsp = true
        return
    }
}
