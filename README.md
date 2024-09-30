# iiPythonx/Statuspage

A multi-server status page.  
Simple, fast as hell, efficient on resources, and powered by Cloudflare Workers & Pages.

## Setting up

- Fork iiPythonx/statuspage to your own profile
- Edit `fetch_status.js` to match the URLs you want to track
- Edit `static/index.html` to remove my branding (or add your own)
- Replace `static/favicon.ico` with the favicon of your choice
- Create a new Cloudflare Page and link it to your repository
    - Set the build command to `nova build`
    - Set the output folder to `.build`
- Push the worker to Cloudflare with `wrangler deploy`
    - Install wrangler with `bun i -g wrangler`
- Wait for the start of the next hour for data to flow in

Problems? [Make an issue.](https://github.com/iiPythonx/statuspage/issues/new)

## Internal workings

Most of the hard work for this repository is done via [`fetch_status.js`](https://github.com/iiPythonx/statuspage/blob/main/fetch_status.js), which handles pinging the sites and recording their status. All site data is then thrown together into [Cloudflare KV](https://developers.cloudflare.com/kv/).  

The client (in reality), only fetches this data and loads the status information into the UI. Additionally, it uses [PopperJS](https://popper.js.org/) for the detailed snapshot info when hovering over a timestamp.

## Development

Not sure at the moment.

## Copyright

MIT license, [more details here](https://github.com/iiPythonx/statuspage/blob/main/LICENSE.txt).
