// Copyright (c) 2024 iiPython

export async function onRequestGet(context) {
    return new Response(JSON.stringify({ code: 200 }));
}
