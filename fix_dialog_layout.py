with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# Replace Ký hiệu field
old_ky_hieu = """            <div class="field mb-3">
                <label class="font-bold">Ký hiệu</label>
                <p-select [options]="availableSymbols" [(ngModel)]="tempSymbol" optionLabel="name" appendTo="body">
                    <ng-template pTemplate="selectedItem" let-selectedOption>
                        <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                            <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400"
                                [ngStyle]="{'background-color': selectedOption.color, 'color': '#333'}">{{selectedOption.code}}</span>
                            <span>{{selectedOption.name}}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-option>
                        <div class="flex align-items-center gap-2">
                            <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400"
                                [ngStyle]="{'background-color': option.color, 'color': '#333'}">{{option.code}}</span>
                            <span>{{option.name}}</span>
                        </div>
                    </ng-template>
                </p-select>
            </div>"""

new_ky_hieu = """            <div class="field grid align-items-center mb-3">
                <label class="col-12 sm:col-4 mb-0 font-bold">Ký hiệu</label>
                <div class="col-12 sm:col-8">
                    <p-select [options]="availableSymbols" [(ngModel)]="tempSymbol" optionLabel="name" appendTo="body" styleClass="w-full">
                        <ng-template pTemplate="selectedItem" let-selectedOption>
                            <div class="flex align-items-center gap-2" *ngIf="selectedOption">
                                <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400"
                                    [ngStyle]="{'background-color': selectedOption.color, 'color': '#333'}">{{selectedOption.code}}</span>
                                <span>{{selectedOption.name}}</span>
                            </div>
                        </ng-template>
                        <ng-template pTemplate="item" let-option>
                            <div class="flex align-items-center gap-2">
                                <span class="px-2 py-1 border-round text-xs font-bold border-1 border-400"
                                    [ngStyle]="{'background-color': option.color, 'color': '#333'}">{{option.code}}</span>
                                <span>{{option.name}}</span>
                            </div>
                        </ng-template>
                    </p-select>
                </div>
            </div>"""

# Replace Tên ngày lễ field
old_ten_ngay_le = """            <div class="field" *ngIf="tempSymbol?.code === 'L'">
                <label class="font-bold">Tên ngày lễ</label>
                <input type="text" pInputText [(ngModel)]="tempHolidayName" placeholder="Ví dụ: Quốc khánh" />
            </div>"""

new_ten_ngay_le = """            <div class="field grid align-items-center" *ngIf="tempSymbol?.code === 'L'">
                <label class="col-12 sm:col-4 mb-0 font-bold">Tên ngày lễ</label>
                <div class="col-12 sm:col-8">
                    <input type="text" pInputText [(ngModel)]="tempHolidayName" placeholder="Ví dụ: Quốc khánh" class="w-full" />
                </div>
            </div>"""

content = content.replace(old_ky_hieu, new_ky_hieu)
content = content.replace(old_ten_ngay_le, new_ten_ngay_le)

# Update Save button color to success (green)
content = content.replace('class="p-button-primary"\n                (click)="saveCell()"', 'class="p-button-success"\n                (click)="saveCell()"')

# Widen dialog just in case
content = content.replace("[style]=\"{width: '350px'}\"", "[style]=\"{width: '450px'}\"")

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
