with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

old_preview_cell = """                    <div *ngFor="let cell of monthDays"
                        class="flex flex-column p-2 border-right-1 border-bottom-1 border-300"
                        style="width: 14.28%; height: 80px;" [ngClass]="{'bg-surface-100': cell.isWeekend}">
                        <div class="text-right text-500 font-bold text-sm">{{cell.date}}</div>
                        <div *ngIf="cell.date" class="mt-auto text-center">
                            <span class="p-1 border-round text-sm font-bold" [ngClass]="{
                                'bg-green-100 text-green-700': cell.type === 'HC',
                                'bg-gray-200 text-gray-700': cell.type === 'OFF',
                                'bg-yellow-100 text-yellow-700': cell.type === '?'
                            }">
                                {{cell.type}}
                            </span>
                        </div>
                    </div>"""

new_preview_cell = """                    <div *ngFor="let cell of monthDays"
                        class="flex flex-column p-2 border-right-1 border-bottom-1 border-300"
                        style="width: 14.28%; height: 90px;" [ngClass]="{'bg-surface-100': cell.isWeekend}">
                        <div class="text-right text-500 font-bold text-sm">{{cell.date}}</div>
                        
                        <div class="flex-grow-1 flex align-items-center justify-content-center overflow-hidden px-1">
                            <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-sm text-500 text-center font-italic text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                                {{cell.holidayName}}
                            </div>
                        </div>

                        <div *ngIf="cell.date" class="mt-auto text-center mb-1">
                            <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                                {{cell.type}}
                            </span>
                        </div>
                    </div>"""

content = content.replace(old_preview_cell, new_preview_cell)

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
