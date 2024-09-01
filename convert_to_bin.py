import json
from pathlib import Path
from gzip import decompress, compress

status_buffer = ""
existing_data = json.loads(decompress(Path("main.gz").read_bytes()))

latest_timestamp = round(int(sorted(existing_data.keys())[-1]) / 1000)
status_buffer = [latest_timestamp]

for timestamp in existing_data:
    timestamp = round(int(timestamp) / 1000)
    if timestamp == latest_timestamp:
        continue

    status_buffer.append(latest_timestamp - timestamp)

mapped = {}
for entries in existing_data.values():
    for service, response in entries.items():
        if service not in mapped:
            mapped[service] = []

        mapped[service].append(response[1] if response[0] else 0)

for item in mapped.values():
    status_buffer += item

Path("main.gz").write_bytes(compress("|".join(map(lambda x: str(x), status_buffer)).encode("ascii")))
