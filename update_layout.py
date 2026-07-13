import re

with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# Replace the first two lines:
# <p-toast></p-toast>
# <div class="card">
content = content.replace('<div class="card">\n    <div class="flex flex-column', '<div class="card" *ngIf="viewState === \'calendar\'">\n    <div class="flex flex-column')

# Remove the wrapper <div *ngIf="viewState === 'calendar'"> because we moved it to the card
# Wait, the structure currently has:
# <div class="card">
#     <div ... *ngIf="viewState === 'calendar'">
#     </div>
#     <div *ngIf="viewState === 'calendar'">
#         <!-- MAIN CALENDAR VIEW -->
#     </div>
#     <div *ngIf="viewState === 'wizard'">
#     ...
#     </div>
# </div>

# Let's write a targeted replacement
# We can just read the whole file and rebuild it structurally.

import sys

lines = content.split('\n')
new_lines = []

in_calendar = False
in_wizard = False
for i, line in enumerate(lines):
    if line.strip() == '<div class="card">':
        # Don't add the outer card yet
        pass
    elif line.strip() == '<!-- MAIN CALENDAR VIEW -->':
        # Add the card wrapper for calendar
        new_lines.append('<div class="card" *ngIf="viewState === \'calendar\'">')
        new_lines.append(line)
    elif line.strip() == '<div *ngIf="viewState === \'calendar\'">':
        # Skip this wrapper since the card has the ngIf
        pass
    elif line.strip() == '<!-- WIZARD VIEW -->':
        new_lines.append('</div> <!-- End Calendar Card -->')
        new_lines.append('')
        new_lines.append(line)
        new_lines.append('<ng-container *ngIf="viewState === \'wizard\'">')
        new_lines.append('    <div class="card">')
    elif line.strip() == '<div *ngIf="viewState === \'wizard\'">':
        pass
    elif line.strip() == '<!-- STEP 1 -->':
        # Close the first card and open the second one
        new_lines.append('    </div>')
        new_lines.append('    <div class="card mt-5">')
        new_lines.append(line)
    elif line.strip() == '</div>' and i == len(lines) - 2:
        # Last div is for the outer card, we replace it with closing ng-container and card
        new_lines.append('    </div>')
        new_lines.append('</ng-container>')
    else:
        # Also fix the first div of calendar which has *ngIf="viewState === 'calendar'"
        if '*ngIf="viewState === \'calendar\'"' in line and 'mb-5' in line:
            new_lines.append(line.replace('*ngIf="viewState === \'calendar\'"', ''))
        else:
            new_lines.append(line)

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write("\n".join(new_lines))

