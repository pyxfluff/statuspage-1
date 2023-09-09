# Copyright 2023 iiPython

# Modules
import os
import json
import time
import gzip
from pathlib import Path

from requests import get

# Initialization
root_dir = Path(__file__).parent.parent
with open(root_dir / "urls.json", "r") as fh:
    urls = json.loads(fh.read())

os.makedirs(root_dir / "logs", exist_ok = True)

# Load existing data
status_info, log_file = {}, root_dir / "logs/main.gz"
if log_file.is_file():
    with gzip.open(log_file, "r") as fh:
        status_info = json.loads(fh.read())

def write_log(name: str, state: str, latency: float) -> None:
    full_path, frames =  f"logs/{name}.log", []
    with open(full_path, "r") as fh:
        frames = fh.read().splitlines()

    frames.append(f"{round(time.time() * 1000)} {state} {latency}")
    if len(frames) > 48:
        frames = frames[1:]

    with open(full_path, "w+") as fh:
        fh.write("\n".join(frames))

# Perform all status checks
time_key = str(round(time.time() * 1000))
status_info[time_key] = {}
for service in urls:
    try:
        resp = get(service["url"], timeout = 10)
        if resp.status_code != 200:
            raise Exception()

        write_log(
            service["name"],
            "online",
            round(resp.elapsed.total_seconds() * 1000, 2)
        )
        status_info[time_key][service["name"]] = [
            1,
            round(resp.elapsed.total_seconds() * 1000, 1)
        ]

    except Exception:
        status_info[time_key][service["name"]] = [0, 0]

if len(status_info) > 48:
    del status_info[sorted(status_info.keys())[0]]

print(status_info)
with gzip.open(log_file, "w+") as fh:
    fh.write(json.dumps(status_info).encode("utf-8"))

# Commit results to repository
if os.getenv("GITHUB_ACTIONS") == "true":
    for command in [
        "config --global user.name statuspage",
        "config --global user.email status@iipython.dev", "add -A --force logs/",
        "commit -am '[Automated] Update system status'", "push"
    ]:
        os.system(f"git {command}")
