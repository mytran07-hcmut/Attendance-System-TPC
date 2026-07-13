import re

with open("src/app/pages/hr/schedule/schedule.html", "r") as f:
    content = f.read()

# Extract wizard steps
step1 = re.search(r'<!-- STEP 1 -->(.*?)<!-- STEP 2 -->', content, re.DOTALL).group(1)
step2 = re.search(r'<!-- STEP 2 -->(.*?)<!-- STEP 3 -->', content, re.DOTALL).group(1)
step3 = re.search(r'<!-- STEP 3 -->(.*?)</div>\n</div>', content, re.DOTALL).group(1)

new_content = f"""<p-toast></p-toast>
<div class="card">
    <div class="flex justify-content-between align-items-center mb-5" *ngIf="viewState === 'calendar'">
        <h5 class="m-0">Lịch làm việc toàn công ty tháng {{{{ currentMonth | date:'MM/yyyy' }}}}</h5>
        <button pButton pRipple label="Thêm lịch làm việc" icon="pi pi-plus" class="p-button-primary" (click)="openWizard()"></button>
    </div>

    <!-- MAIN CALENDAR VIEW -->
    <div *ngIf="viewState === 'calendar'">
        <!-- Custom Calendar Grid -->
        <div class="w-full border-round overflow-hidden" style="border: 1px solid var(--surface-d)">
            <div class="flex bg-primary text-white p-3">
                <div class="flex-1 text-center font-bold" *ngFor="let day of weekDays">{{{{day}}}}</div>
            </div>
            <div class="flex flex-wrap">
                <div *ngFor="let cell of monthDays" class="flex flex-column p-2 border-right-1 border-bottom-1 border-300" style="width: 14.28%; height: 120px;" [ngClass]="{{'bg-surface-100': cell.isWeekend}}">
                    <div class="text-right text-600 font-bold text-sm">{{{{cell.date}}}}</div>
                    <div *ngIf="cell.date" class="mt-auto text-center mb-2">
                        <span class="px-2 py-1 border-round text-sm font-bold" 
                            [ngClass]="{{
                                'bg-green-100 text-green-700': cell.type === 'HC',
                                'bg-gray-200 text-gray-700': cell.type === 'OFF',
                                'bg-yellow-100 text-yellow-700': cell.type === '?'
                            }}">
                            {{{{cell.type}}}}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- WIZARD VIEW -->
    <div *ngIf="viewState === 'wizard'">
        <div class="flex align-items-center mb-5">
            <button pButton pRipple icon="pi pi-arrow-left" class="p-button-text p-button-secondary mr-3" (click)="cancelWizard()" pTooltip="Quay lại"></button>
            <h5 class="m-0">Tạo lịch đi làm tháng {{{{ currentMonth | date:'MM/yyyy' }}}}</h5>
        </div>
        <p-steps [model]="items" [(activeIndex)]="activeIndex" [readonly]="false" class="mb-5"></p-steps>

        <!-- STEP 1 -->
        {step1}
        <!-- STEP 2 -->
        {step2}
        <!-- STEP 3 -->
        {step3}
    </div>
</div>
"""

with open("src/app/pages/hr/schedule/schedule.html", "w") as f:
    f.write(new_content)
