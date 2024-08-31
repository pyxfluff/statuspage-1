# iiPythonx/Statuspage

A multi-server status page.  
Simple, fast as hell, efficient on resources, and powered by Github Pages.

## Setting up

- Fork iiPythonx/statuspage to your own profile
- Edit `urls.json` to match the URLs you wish to track
- Edit `static/index.html` to remove my branding (or add your own)
- Replace `static/favicon.ico` with the favicon of your choice
- Enable all actions in your new fork
- (optional) run the "Build and push to prod" action to test config

Problems? [Make an issue.](https://github.com/iiPythonx/statuspage/issues/new)

## Internal workings

Most of the hard work for this repository is done via [`status_check.py`](https://github.com/iiPythonx/statuspage/blob/main/.github/workflows/status_check.py), which handles pinging the sites and recording their status. All site data is then thrown together into a massive JSON-encoded file, and gzipped for transfer speed.  

The client (in reality), only fetches this gzipped file, decompresses it, and loads the status information into the UI. Additionally, it uses [PopperJS](https://popper.js.org/) for the detailed snapshot info when hovering over a timestamp.

## Development

- Clone iiPythonx/statuspage:
```bash
git clone git@github.com:iiPythonx/statuspage
# or alternatively:
git clone https://github.com/iiPythonx/statuspage
```
- Install Nova:
```bash
pip install git+https://github.com/iiPythonx/nova
```
- Build the site and launch it:
```bash
nova serve --reload --open
```
- Make your changes, commit, push, and pull request.

## Copyright

MIT license, [more details here](https://github.com/iiPythonx/statuspage/blob/main/LICENSE.txt).
