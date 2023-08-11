# Copyright 2023 iiPython

# Modules
import os
import sys
import json
import time
from pathlib import Path

from requests import get

# Initialization
root_dir = Path(__file__).parent.parent
urls_json, logs_folder = root_dir / "urls.json", root_dir / "logs"
if not (logs_folder.is_dir()):
    os.mkdir(logs_folder)

with open(urls_json, "r") as fh:
    urls = json.loads(fh.read())

def write_log(name: str, state: str, latency: float) -> None:
    full_path, frames = logs_folder / f"{name}.log", []
    if full_path.is_file():
        with open(full_path, "r") as fh:
            frames = fh.read().splitlines()

    frames.append(f"{time.time() * 1000} {state} {latency}")
    if len(frames) > 48:
        frames = frames[1:]

    with open(full_path, "w+") as fh:
        fh.write("\n".join(frames))

# Perform all status checks
for service in urls:
    try:
        resp = get(service["url"], timeout = 10)
        if resp.status_code != 200:
            raise Exception()

        write_log(service["name"], "online", round(resp.elapsed.total_seconds() * 1000, 2))

    except Exception:
        write_log(service["name"], "down", 0)

# Commit results to repository
if "--no-commit" not in sys.argv:
    os.system("git config --global user.name 'statuspage'")
    os.system("git config --global user.email ben@iipython.dev")
    os.system("git add -A --force logs/")
    os.system("git commit -am '[Automated] Update system status'")
    os.system("git push")
