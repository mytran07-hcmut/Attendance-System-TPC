with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# We need to move </ng-container> to before the dialog
dialog_start_marker = "    <!-- Edit Cell Dialog -->"
if dialog_start_marker in content and "</ng-container>" in content:
    # First remove the last </ng-container>
    # Actually, we can split by dialog_start_marker
    parts = content.split(dialog_start_marker)
    
    # We remove </ng-container> from the second part
    part2 = parts[1].replace("</ng-container>", "")
    
    # We append </ng-container> at the end of the first part
    part1 = parts[0] + "\n</ng-container>\n"
    
    new_content = part1 + dialog_start_marker + part2
    
    with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
        f.write(new_content)

