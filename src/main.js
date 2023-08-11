// Copyright 2023 iiPython

// Initialization
const table = document.getElementById("table").firstElementChild;

// Handle writing logs to the screen
function add_service(service, success, logs) {

    // Create object structure
    let tr = document.createElement("tr"),
        td = document.createElement("td"),
        header = document.createElement("p"),
        container = document.createElement("div");

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

    // Filter out empty lines and fill gaps
    logs = logs.filter(n => n);
    if (logs.length !== 48) {
        (fill = []).length = (48 - logs.length);
        logs = fill.fill("0 unknown 0").concat(logs);
    }

    // Process log frames
    let state_obj = document.createElement("p");
    td.appendChild(state_obj);
    logs.forEach((frame, index) => {
        if (!frame.length) return;
        [timestamp, state, ping] = frame.split(" ");

        // Add this frames box
        let box = document.createElement("div");
        box.classList = `indicator i-${state}`;
        box.setAttribute("timestamp", timestamp);
        box.setAttribute("ping", ping);
        container.appendChild(box);

        // Handle hovering
        let service_id = service.name.replace(" ", "-");
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
                <p>${new Date(Number(box.getAttribute("timestamp"))).toLocaleString()}</p>
                <p>${box.getAttribute("ping")}ms</p>
            `;
            tooltip.role = "tooltip";
            tooltip.id = "tooltip";
            tooltip.classList.add("tooltip")
            box.appendChild(tooltip);

            // Handle Popper element
            window.popper = Popper.createPopper(box, tooltip, { modifiers: [{ name: "offset", options: { offset: [0, 12] } }] });
        });
        box.addEventListener("mouseleave", unregisterPopup);

        // Process overall service state
        if (index == logs.length - 1) {
            state_obj.innerText = state;
            state_obj.classList = `state color-${(state == "online") ? "green" : "red"}`;
        }
    });

    // Throw the log in our table
    table.appendChild(tr);
}

async function write_logs(service) {
    try {
        let resp = await fetch(`./logs/${service.name}.log`);
        if (!resp.ok) throw new Error(`Non-200 from service log '${service.name}'!`);
        add_service(service, true, (await resp.text()).split(/\n/));

    } catch (e) {
        console.warn(e);
        add_service(service, false);
    }
}

// Process URLs
(async () => {
    let urls = await (await fetch("./urls.json")).json();
    for (let url of urls) await write_logs(url);
})();
