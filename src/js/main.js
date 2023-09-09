"use strict";

// Copyright 2023 iiPython

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
        tooltip.innerHTML = `
            <p>${new Date(timestamp).toLocaleString()}</p>
            <p>${ping}ms</p>
        `;
        tooltip.role = "tooltip";
        tooltip.id = "tooltip";
        tooltip.classList.add("tooltip")
        container.appendChild(tooltip);

        // Handle Popper element
        window.popper = Popper.createPopper(box, tooltip, { modifiers: [{ name: "offset", options: { offset: [0, 12] } }] });
    });
    box.addEventListener("mouseleave", unregisterPopup);
}

function add_service(service, success, logs) {

    // Create object structure
    let tr = document.createElement("tr"),
        td = document.createElement("td"),
        header = document.createElement("p"),
        container = document.createElement("div");

    tr.style.display = "none";
    container.className = "status-container";
    tr.append(td)
    td.append(header, container);

    // Setup header text
    if (!success) {
        header.innerText = "Failed to load service info.";
        header.classList = "color-red no-margin"
        return table.appendChild(tr);
    }
    header.innerHTML = `<a href = "${service.url}">${service.name}</a>`;

    // Process log frames
    logs = logs.map((frame) => frame.split(" "))
    for (let i = 0; i < 48 - logs.length; i++) make_box(container, 0, "unknown", 0); 
    for (let i = 0; i < logs.length; i++) {
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

async function write_logs(service) {
    try {
        let resp = await fetch(`./logs/${service.name}.log`);
        if (!resp.ok) throw new Error(`Non-200 from service log '${service.name}'!`);
        add_service(service, true, (await resp.text()).split("\n"));

    } catch (e) {
        console.warn(e);
        add_service(service, false);
    }
}

// Process URLs
(async () => {
    let urls = await (await fetch("./urls.json")).json();
    for (let url of urls) await write_logs(url);

    // Loading complete
    main_css.rel = "stylesheet";
    document.getElementById("spinner").remove();
    for (let tr of document.getElementsByTagName("tr")) tr.style.display = "block";
})();
