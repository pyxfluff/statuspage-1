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
    const resp = new Response((await fetch(`/logs/main.gz`)).body.pipeThrough(new DecompressionStream("gzip")));
    if (!resp.ok) throw new Error(`Non-200 while retrieving main.gz!`);
    const data = await resp.json();
    let logs = {}
    for (let k in data) {
        for (let name in data[k]) {
            const info = data[k][name];
            if (!logs[name]) logs[name] = [];
            logs[name].push([k, info[0] ? "limited" : "offline", info[1]]);
        }
    }
    for (let name in logs) add_service(urls[name], name, logs[name]);
}
write_logs();
const xhr = new XMLHttpRequest();
xhr.onload = (e) => { if (e.target.status !== 302) location.href = "/"; }
xhr.open("HEAD", "https://cdn.iipython.dev", true);
xhr.send();
