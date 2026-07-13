with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

content = content.replace("p-button-success", "p-button-primary")

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
