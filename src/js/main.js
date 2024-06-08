"use strict";

// Copyright (c) 2023-2024 iiPython

// Initialization
const table = document.getElementById("table").firstElementChild;
const main_css = document.getElementById("maincss");

// Handle CSS deferring
main_css.addEventListener("load", () => { main_css.rel = "stylesheet"; });

// Handle writing logs to the screen
function make_box(container, timestamp, state, ping) {
    let box = document.createElement("div");
    box.classList = `indicator i-${state}`, timestamp = Number(timestamp);
    container.appendChild(box);

    // Handle hovering
    if (state == "unknown") return;
    function unregisterPopup() {
        let tooltip = document.getElementById("tooltip");
        if (tooltip) tooltip.remove();
        if (window.popper) {
            window.popper.destroy();
            delete window.popper;
        }
    }
    box.addEventListener("mouseover", () => {
        unregisterPopup();

        // Create tooltip
        let tooltip = document.createElement("div");
        tooltip.innerHTML = `<p>${new Date(timestamp).toLocaleString()}</p><p>${ping}ms</p>`;
        tooltip.id = "tooltip";
        tooltip.classList.add("tooltip")
        container.appendChild(tooltip);

        // Handle Popper element
        window.popper = Popper.createPopper(box, tooltip);
    });
    box.addEventListener("mouseleave", unregisterPopup);
}

function add_service(url, name, success, logs) {

    // Create object structure
    let tr = document.createElement("tr"),
        td = document.createElement("td"),
        header = document.createElement("p"),
        container = document.createElement("div");

    tr.style.display = "none";
    tr.style.width = "fit-content";
    container.className = "status-container";
    tr.append(td)
    td.append(header, container);

    // Setup header text
    if (!success) {
        header.innerText = "Failed to load service info.";
        header.classList = "color-red no-margin"
        return table.appendChild(tr);
    }
    header.innerHTML = `<a href = "${url}">${name}</a>`;

    // Process log frames
    logs = [ ...Array(48 - logs.length).fill([0, "unknown", 0]), ...logs ];
    for (let i = 0; i < 48; i++) {
        let [timestamp, state, ping] = logs[i];
        make_box(container, timestamp, state, ping);
    }

    // Handle the "overall state" section
    let state_obj = document.createElement("p"), state = logs[logs.length - 1][1];
    td.appendChild(state_obj);
    state_obj.innerText = state;
    state_obj.classList = `state color-${(state == "online") ? "green" : "red"}`;

    // Throw the log in our table
    table.appendChild(tr);
}

async function write_logs() {
    try {

        // Fetch URLs (for labeling) and make initial request
        const urls = await (await fetch("/urls.json")).json();
        const resp = new Response(
            
            // Pipe everything through a gzip-decompression stream
            (await fetch(`/logs/main.gz`)).body.pipeThrough(new DecompressionStream("gzip"))
        );
        if (!resp.ok) throw new Error(`Non-200 while retrieving main.gz!`);
        const data = await resp.json();

        // Expand compact JSON into renderable
        let logs = {}
        for (let k in data) {
            for (let name in data[k]) {
                const info = data[k][name];
                if (!logs[name]) logs[name] = [];
                logs[name].push([k, info[0] ? "online" : "offline", info[1]]);
            }
        }
        for (let name in logs) add_service(urls[name], name, true, logs[name]);

    } catch (e) {
        console.warn(e);
        add_service(null, null, false);  // Show a "Failed to load" indicator
    }
}

// Process URLs
(async () => {
    await write_logs();

    // Loading complete
    main_css.rel = "stylesheet";
    document.getElementById("spinner").remove();
    for (let tr of document.getElementsByTagName("tr")) tr.style.display = "table";
})();
