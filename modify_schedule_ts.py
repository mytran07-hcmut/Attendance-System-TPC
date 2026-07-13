with open("src/app/pages/hr/schedule/schedule.ts", "r") as f:
    content = f.read()

# Add imports
content = content.replace("import { DatePickerModule } from 'primeng/datepicker';", "import { DatePickerModule } from 'primeng/datepicker';\nimport { DialogModule } from 'primeng/dialog';\nimport { InputTextModule } from 'primeng/inputtext';")

content = content.replace("ToastModule, DatePickerModule]", "ToastModule, DatePickerModule, DialogModule, InputTextModule]")

# Add variables inside class
vars_to_add = """  availableSymbols = [
    { code: 'HC', name: 'Hành chính', color: '#f4cccc' },
    { code: 'AL', name: 'Nghỉ phép năm', color: '#d9ead3' },
    { code: 'KP', name: 'Nghỉ không phép', color: '#c9daf8' },
    { code: 'OFF', name: 'Ngày nghỉ tuần', color: '#d9d2e9' },
    { code: 'L', name: 'Ngày Lễ', color: '#fff2cc' }
  ];
  displayEditDialog: boolean = false;
  editingCell: any = null;
  tempSymbol: any = null;
  tempHolidayName: string = '';

"""

content = content.replace("  viewState: 'calendar' | 'wizard' = 'calendar';", "  viewState: 'calendar' | 'wizard' = 'calendar';\n" + vars_to_add)


methods_to_add = """  openEditDialog(cell: any) {
    if (!cell.date) return;
    this.editingCell = cell;
    this.tempSymbol = this.availableSymbols.find(s => s.code === cell.type) || this.availableSymbols[0];
    this.tempHolidayName = cell.holidayName || '';
    this.displayEditDialog = true;
  }

  saveCell() {
    if (this.editingCell) {
      this.editingCell.type = this.tempSymbol.code;
      if (this.tempSymbol.code === 'L') {
        this.editingCell.holidayName = this.tempHolidayName;
      } else {
        this.editingCell.holidayName = '';
      }
    }
    this.displayEditDialog = false;
  }

  getSymbolColor(code: string): string {
    const symbol = this.availableSymbols.find(s => s.code === code);
    return symbol ? symbol.color : '#fff3cd';
  }

"""

content = content.replace("  openWizard() {", methods_to_add + "  openWizard() {")

with open("src/app/pages/hr/schedule/schedule.ts", "w") as f:
    f.write(content)
