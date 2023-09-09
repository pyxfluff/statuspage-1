import gzip
import os

new = {}
for file in os.listdir("logs"):
    with open(f"logs/{file}") as f:
        lines = f.read().splitlines()

    for line in lines:
        line = line.split(" ")
        ts, state, ping = round(float(line[0])), {"online": 1, "down": 0}[line[1]], round(float(line[2]), 1)
        if ts not in new:
            new[ts] = {file[:-4]: [state, ping]}

        else:
            new[ts][file[:-4]] = [state, ping]

print(new)
