// Copyright (c) 2023-2024 iiPython

(async () => {

    // Reduce filesize
    const E = e => document.createElement(e);
    const G = e => document.getElementById(e);

    // Initialization
    const table = document.querySelector("table").firstElementChild;

    // Handle CSS deferring
    const css = G("css");
    css.addEventListener("load", () => css.rel = "stylesheet");

    // Handle writing logs to the screen
    function make_box(container, timestamp, state, ping) {
        let box = E("div");
        box.classList = `indicator i-${state}`, timestamp = Number(timestamp);
        container.appendChild(box);

        // Handle hovering
        if (state == "unknown") return;
        function unregisterPopup() {
            let tooltip = G("tooltip");
            if (tooltip) tooltip.remove();
            if (window.popper) {
                window.popper.destroy();
                delete window.popper;
            }
        }
        box.addEventListener("mouseover", () => {
            unregisterPopup();

            // Create tooltip
            let tooltip = E("div");
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
        let tr = E("tr"),
            td = E("td"),
            header = E("p"),
            container = E("div");

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
        logs = [ ...Array(128 - logs.length).fill([0, "unknown", 0]), ...logs ];
        for (let i = 0; i < 128; i++) {
            let [timestamp, state, ping] = logs[i];
            make_box(container, timestamp, state, ping);
        }

        // Handle the "overall state" section
        let state_obj = E("p"), state = logs[logs.length - 1][1];
        td.appendChild(state_obj);
        state_obj.innerText = state;
        state_obj.classList = `state color-${(state == "online") ? "green" : "red"}`;

        // Throw the log in our table
        table.appendChild(tr);
    }

    async function write_logs() {
        try {
            const resp = await fetch("/api/status");
            if (!resp.ok) throw new Error("Failed to retrieve status information!");

            const data = await resp.json();
            if (!data.urls) throw new Error("Function had a server related issue and failed!");

            // Setup log information
            let logs = {};
            for (const record of data.records) {
                for (const service in record.services) {
                    if (!logs[service]) logs[service] = [];
                    logs[service].push([
                        record.time * 1000,
                        record.services[service] === 0 ? "offline" : "online",
                        record.services[service]
                    ]);
                }
            }
            for (let name in logs) add_service(data.urls.filter(u => u.name === name)[0].url, name, true, logs[name]);

        } catch (e) {
            console.warn(e);
            add_service(null, null, false);  // Show a "Failed to load" indicator
        }
    }

    // Process URLs
    await write_logs();

    // Loading complete
    css.rel = "stylesheet";
    G("spinner").remove();
    for (let tr of document.querySelectorAll("tr")) tr.style.display = "table";
})();
