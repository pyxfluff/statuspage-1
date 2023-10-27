# iiPythonx/Statuspage

A multi-server status page.  
Simple, fast as hell, efficient on resources, and powered by Github Pages.

## Setting up

- Fork iiPythonx/statuspage to your own profile
- Edit `urls.json` to match the URLs you wish to track
- Edit `src/index.html` to remove my branding (or add your own)
- Replace `favicon.ico` with the favicon of your choice
- Enable all actions in your new fork
- (optional, if you edited `index.html`) run the "Minify HTML" action manually
- (optional) run the "Update Status" action to test config

Problems? [Make an issue.](https://github.com/iiPythonx/statuspage/issues/new)

## Internal workings

Most of the hard work for this repository is done via [`status_check.py`](https://github.com/iiPythonx/statuspage/blob/main/src/status_check.py), which handles pinging the sites and recording their status. All site data is then thrown together into a massive JSON-encoded file, and gzipped for transfer speed.  

The client (in reality), only fetches this gzipped file, decompresses it, and loads the status information into the UI. Additionally, it uses [PopperJS](https://popper.js.org/) for the detailed snapshot info when hovering over a timestamp.

## Copyright

MIT license, [more details here](https://github.com/iiPythonx/statuspage/blob/main/LICENSE.txt).
