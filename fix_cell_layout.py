with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# MAIN CALENDAR
old_main_cell = """                <div *ngFor="let cell of monthDays"
                    class="flex flex-column p-2 border-right-1 border-bottom-1 border-300 cursor-pointer"
                    style="width: 14.28%; height: 120px;" [ngClass]="{'bg-surface-100': cell.isWeekend}"
                    (click)="openEditDialog(cell)">
                    <div class="text-right text-600 font-bold text-sm">{{cell.date}}</div>
                    <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                        <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mb-1 line-height-1 text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                            {{cell.holidayName}}
                        </div>
                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>
                    </div>
                </div>"""

new_main_cell = """                <div *ngFor="let cell of monthDays"
                    class="flex flex-column p-2 border-right-1 border-bottom-1 border-300 cursor-pointer calendar-cell"
                    style="width: 14.28%; height: 120px;" [ngClass]="{'bg-surface-100': cell.isWeekend}"
                    (click)="openEditDialog(cell)">
                    
                    <!-- Hover Edit Overlay -->
                    <div class="edit-overlay" *ngIf="cell.date">
                        <i class="pi pi-pencil"></i>
                    </div>

                    <div class="text-right text-600 font-bold text-sm">{{cell.date}}</div>
                    
                    <div class="flex-grow-1 flex align-items-center justify-content-center overflow-hidden px-1">
                        <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 line-height-1 text-center font-italic text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                            {{cell.holidayName}}
                        </div>
                    </div>

                    <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>
                    </div>
                </div>"""

# PREVIEW CALENDAR (Step 3)
old_preview_cell = """                    <div *ngFor="let cell of monthDays"
                        class="flex flex-column p-2 border-right-1 border-bottom-1 border-300"
                        style="width: 14.28%; height: 80px;" [ngClass]="{'bg-surface-100': cell.isWeekend}">
                        <div class="text-right text-500 font-bold text-sm">{{cell.date}}</div>
                        <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                            <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mb-1 line-height-1 text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
                                {{cell.holidayName}}
                            </div>
                            <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400 block w-max mx-auto" [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
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
                            <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-500 line-height-1 text-center font-italic text-overflow-ellipsis overflow-hidden white-space-nowrap" style="max-width: 100%;">
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

content = content.replace(old_main_cell, new_main_cell)
content = content.replace(old_preview_cell, new_preview_cell)

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
