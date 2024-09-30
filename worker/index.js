// Copyright (c) 2024 iiPython

const services = [
    { name: "iiPython Front Page", url: "https://iipython.dev" },
    { name: "Geesecraft Archives", url: "https://gc.iipython.dev" },
    { name: "Public CDN", url: "https://cdn.iipython.dev" },
    { name: "Consumet API", url: "https://anisq.iipython.dev" },
    { name: "File Sharing", url: "https://files.iipython.dev" },
    { name: "Local Network", url: "https://lan.iipython.dev" },
    { name: "Codelet", url: "https://codelet.codes" },
    { name: "Inventory Service", url: "https://inv.codelet.codes" },
]

async function fetch_status() {
    const slice = { time: Date.now() / 1000 | 0, services: {} };
    for (let { name, url } of services) {

        // Make request
        const control = new AbortController();
        const timeout = setTimeout(control.abort, 10000);

        try {
            const start = performance.now()
            await fetch(`${url}/_statuscheck/${slice.time}`, { redirect: "manual" });
            clearTimeout(timeout);
            slice.services[name] = Math.round(performance.now() - start);

        } catch { slice.services[name] = 0; }
    }
    return slice;
}

export default {
    async scheduled(_, env, ctx) {
        ctx.waitUntil((async () => {

            // Handle existing data
            let records = JSON.parse(await env.statuspage_data.get("records")) || [];
            if (records.length === 48) records = records.slice(1);

            // Go fetch status information
            records.push(await fetch_status());

            // Save new data
            await env.statuspage_data.put("records", JSON.stringify(records));
        })());
    }
}