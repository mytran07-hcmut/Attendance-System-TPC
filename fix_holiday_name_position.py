with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# For the main calendar cell
old_block_1 = """                    <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>
                        <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mt-1 line-height-1">
                            {{cell.holidayName}}
                        </div>
                    </div>"""

new_block_1 = """                    <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                        <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mb-1 line-height-1 text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                            {{cell.holidayName}}
                        </div>
                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>
                    </div>"""

# For the preview calendar cell
old_block_2 = """                        <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                            <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                                {{cell.type}}
                            </span>
                            <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mt-1 line-height-1">
                                {{cell.holidayName}}
                            </div>
                        </div>"""

new_block_2 = """                        <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                            <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mb-1 line-height-1 text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                                {{cell.holidayName}}
                            </div>
                            <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                                {{cell.type}}
                            </span>
                        </div>"""

if old_block_1 in content:
    content = content.replace(old_block_1, new_block_1)

if old_block_2 in content:
    content = content.replace(old_block_2, new_block_2)

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
