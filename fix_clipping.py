with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# Replace line-height-1 in the holidayName div
content = content.replace("line-height-1 ", "")

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
