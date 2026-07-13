with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# Replace text-xs with text-sm for the holidayName divs
# We can just look for the specific lines.
lines = content.split('\n')
for i, line in enumerate(lines):
    if "cell.holidayName" in line and "text-xs" in line:
        lines[i] = line.replace("text-xs", "text-sm")

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write('\n'.join(lines))
