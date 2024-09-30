// Copyright (c) 2024 iiPython

export async function onRequestGet(context) {
    try {
        return new Response(JSON.stringify({
            urls: JSON.parse(await context.env.statuspage_data.get("urls", { cacheTtl: 900 })),
            records: JSON.parse(await context.env.statuspage_data.get("records", { cacheTtl: 900 }))
        }));
    } catch (e) {
        console.error(e);
        return new Response("{}", { status: 500 });
    }
}
