with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

old_header = """    <div class="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center mb-5">
        <div class="flex flex-column sm:flex-row align-items-start sm:align-items-center gap-3 mb-3 md:mb-0">
            <h5 class="m-0">Lịch làm việc</h5>
            <p-cascadeSelect [options]="scopeOptions" [(ngModel)]="selectedScope" optionLabel="label"
                optionGroupLabel="label" [optionGroupChildren]="['items']" [style]="{'minWidth': '14rem'}"
                placeholder="Chọn đối tượng" (onChange)="onScopeChange($event)">
            </p-cascadeSelect>
            <p-datePicker [(ngModel)]="currentMonth" view="month" dateFormat="mm/yy" [readonlyInput]="true"
                (onSelect)="onMonthSelect()">
            </p-datePicker>
        </div>
        <button pButton pRipple label="Thêm lịch làm việc" icon="pi pi-plus" class="p-button-primary"
            (click)="openWizard()"></button>
    </div>"""

new_header = """    <div class="mb-5">
        <div class="flex justify-content-between align-items-center mb-4">
            <h2 class="m-0 text-3xl font-bold text-gray-800">Lịch làm việc</h2>
            <button pButton pRipple label="Thêm lịch làm việc" icon="pi pi-plus" class="p-button-success p-button-lg"
                (click)="openWizard()"></button>
        </div>
        <div class="flex flex-column sm:flex-row align-items-start sm:align-items-center gap-3">
            <p-cascadeSelect [options]="scopeOptions" [(ngModel)]="selectedScope" optionLabel="label"
                optionGroupLabel="label" [optionGroupChildren]="['items']" [style]="{'minWidth': '14rem'}"
                placeholder="Chọn đối tượng" (onChange)="onScopeChange($event)">
            </p-cascadeSelect>
            <p-datePicker [(ngModel)]="currentMonth" view="month" dateFormat="mm/yy" [readonlyInput]="true"
                (onSelect)="onMonthSelect()">
            </p-datePicker>
        </div>
    </div>"""

content = content.replace(old_header, new_header)

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(content)
