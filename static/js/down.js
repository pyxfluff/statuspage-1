"use strict";
const table = document.getElementById("table").firstElementChild;
function add_service(url, name, logs) {
    let tr = document.createElement("tr"), td = document.createElement("td"), header = document.createElement("p");
    tr.append(td)
    td.append(header);
    header.innerHTML = `<a href = "${url}">${name}</a>`;
    logs = [ ...Array(48 - logs.length).fill([0, "unknown", 0]), ...logs ];
    let state_obj = document.createElement("p"), state = logs[logs.length - 1][1];
    td.appendChild(state_obj);
    state_obj.innerText = state;
    state_obj.classList = `state color-${(state == "limited") ? "yellow" : "red"}`;
    table.appendChild(tr);
}
async function write_logs() {
    const urls = await (await fetch("/urls.json")).json();
    const resp = new Response((await fetch(`/main.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
    if (!resp.ok) throw new Error(`Non-200 while retrieving main.gz!`);
    const data = (await resp.text()).split("|").map(x => Number(x));
    const timestamps = data.slice(1, 48).map(t => data[0] - t);
    timestamps.push(data[0]);
    let logs = {};
    for (let index = 0; index < urls.length; index++) {
        const down = 48 * (index + 1), up = 48 * (index + 2);
        const points = data.slice(down, up);
        logs[urls[index][0]] = points.map((_, point) => [
            timestamps[point] * 1000,
            points[point] === 0 ? "offline" : "limited",
            points[point]
        ])
    }
    for (let name in logs) add_service(urls.filter(u => u[0] === name)[0][1], name, logs[name]);
}
write_logs();
const xhr = new XMLHttpRequest();
xhr.onload = (e) => { if (e.target.responseURL !== "https://status.iipython.dev/down") location.href = "/"; }
xhr.open("HEAD", "https://cdn.iipython.dev", true);
xhr.send();
