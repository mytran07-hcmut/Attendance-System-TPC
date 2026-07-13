with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# 1. Main calendar cell
old_main_cell_start = '<div *ngFor="let cell of monthDays" class="flex flex-column p-2 border-right-1 border-bottom-1 border-300" style="width: 14.28%; height: 120px;" [ngClass]="{\'bg-surface-100\': cell.isWeekend}">'
new_main_cell_start = '<div *ngFor="let cell of monthDays" class="flex flex-column p-2 border-right-1 border-bottom-1 border-300 cursor-pointer" style="width: 14.28%; height: 120px;" [ngClass]="{\'bg-surface-100\': cell.isWeekend}" (click)="openEditDialog(cell)">'
content = content.replace(old_main_cell_start, new_main_cell_start)

# 2. Update ngStyle and add holiday text for both main and preview calendar
old_span = """                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400" 
                            [ngStyle]="{
                                'background-color': cell.type === 'HC' ? '#f4cccc' : (cell.type === 'OFF' ? '#d9d2e9' : '#fff3cd'),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>"""

new_span = """                        <span class="px-2 py-1 border-round text-sm font-bold border-1 border-400" 
                            [ngStyle]="{
                                'background-color': getSymbolColor(cell.type),
                                'color': '#333'
                            }">
                            {{cell.type}}
                        </span>
                        <div *ngIf="cell.type === 'L' && cell.holidayName" class="text-xs text-600 mt-1 line-height-1">
                            {{cell.holidayName}}
                        </div>"""

content = content.replace(old_span, new_span)

# 3. Add dialog to the end of the file
dialog_html = """
    <!-- Edit Cell Dialog -->
    <p-dialog header="Chỉnh sửa ký hiệu" [(visible)]="displayEditDialog" [modal]="true" [style]="{width: '350px'}">
        <div class="p-fluid mt-2">
            <div class="field mb-3">
                <label class="font-bold">Ký hiệu</label>
                <p-select [options]="availableSymbols" [(ngModel)]="tempSymbol" optionLabel="name" appendTo="body">
                    <ng-template pTemplate="selectedItem" let-selectedOption>
                        <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                            <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400" [ngStyle]="{'background-color': selectedOption.color, 'color': '#333'}">{{selectedOption.code}}</span>
                            <span>{{selectedOption.name}}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-option>
                        <div class="flex align-items-center gap-2">
                            <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400" [ngStyle]="{'background-color': option.color, 'color': '#333'}">{{option.code}}</span>
                            <span>{{option.name}}</span>
                        </div>
                    </ng-template>
                </p-select>
            </div>
            <div class="field" *ngIf="tempSymbol?.code === 'L'">
                <label class="font-bold">Tên ngày lễ</label>
                <input type="text" pInputText [(ngModel)]="tempHolidayName" placeholder="Ví dụ: Quốc khánh" />
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton pRipple label="Hủy" icon="pi pi-times" class="p-button-text p-button-secondary" (click)="displayEditDialog = false"></button>
            <button pButton pRipple label="Lưu" icon="pi pi-check" class="p-button-primary" (click)="saveCell()"></button>
        </ng-template>
    </p-dialog>
</div>
"""
# Assuming the file ends with a closing div (or we can just append it before the very last ng-container closure)
# Let's replace the last </div> or </ng-container> safely
content = content.replace("</ng-container>", dialog_html + "\n</ng-container>")

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
