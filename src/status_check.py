# Copyright (c) 2023-2024 iiPython

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

removed_services = []
for entry_time, services in status_info.items():
    for service in services.copy():
        if service not in urls:
            if service not in removed_services:
                removed_services.append(service)

            del status_info[entry_time][service]

for service in removed_services:
    print(f"[-] Removed no longer existant service '{service}'")

# Perform all status checks
time_key = str(round(time.time() * 1000))
status_info[time_key] = {}
for name, url in urls.items():
    try:
        resp_main = get(f"{url}/_statuscheck/{time_key}", timeout = 10, allow_redirects = False)
        status_info[time_key][name] = [
            1,
            round(resp_main.elapsed.total_seconds() * 1000, 1)
        ]
        if resp_main.status_code != 404:
            raise Exception()

    except Exception:
        status_info[time_key][name] = [0, 0]

if len(status_info) > 48:
    del status_info[sorted(status_info.keys())[0]]

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
