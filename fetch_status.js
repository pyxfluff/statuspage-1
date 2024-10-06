// Copyright (c) 2024 iiPython

const services = [
    { name: "Homepage", url: "https://notpyx.me" },
    { name: "Homepage (old)", url: "https://darkpixlz.com" },
    { name: "Navidrome", url: "https://music.notpyx.me" },
    { name: "Roblox Proxy", url: "https://rblx.notpyx.me" },
    { name: "Roblox Proxy (old)", url: "https://rblxproxy.darkpixlz.com" },
    { name: "Administer", url: "https://administer.notpyx.me" },
    { name: "Administer Documentation", url: "https://administer-docs.notpyx.me" },
    { name: "Codelet", url: "https://codelet.codes" },
    { name: "Codelet Inventory service", url: "https://inv.codelet.codes" },
];

async function fetch_status() {
    const slice = { time: Date.now() / 1000 | 0, services: {} };
    for (let { name, url } of services) {

        // Make request
        const control = new AbortController();
        const timeout = setTimeout(control.abort, 10000);

        try {
            const start = performance.now()
            const result = (await fetch(url, { redirect: "manual" }));
            const up = (result.status === 200 || result.status === 404 || result.status === 302 || result.status === 400);

            clearTimeout(timeout);
            slice.services[name] = up ? Math.round(performance.now() - start) : 0;

        } catch { slice.services[name] = 0; }
    }
    return slice;
}

export default {
    async scheduled(_, env, ctx) {
        ctx.waitUntil((async () => {
            await env.statuspage_data.put("urls", JSON.stringify(services));

            // Handle existing data
            let records = JSON.parse(await env.statuspage_data.get("records")) || [];
            if (records.length === 160) records = records.slice(1);

            // Go fetch status information
            records.push(await fetch_status());

            // Save new data
            await env.statuspage_data.put("records", JSON.stringify(records));
        })());
    }
}