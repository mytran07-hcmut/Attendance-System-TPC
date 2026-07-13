import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-hr-symbols',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, DialogModule, ColorPickerModule, TagModule, TooltipModule, TextareaModule],
  templateUrl: './symbols.html',
  styleUrl: './symbols.scss'
})
export class Symbols {
  defaultSymbols = [
    { code: 'HC', name: 'Hành chính (Đi làm đủ)', color: '#f4cccc', description: 'Áp dụng khi nhân viên đến văn phòng/nhà máy làm việc và check-in đủ ca tiêu chuẩn (thường là 8 tiếng).' },
    { code: 'AL', name: 'Nghỉ phép năm', color: '#d9ead3', description: 'Áp dụng khi nhân viên chủ động xin nghỉ giải quyết việc riêng, đi du lịch... và số ngày nghỉ được trừ trực tiếp vào Quỹ phép năm còn lại của họ.' },
    { code: 'KP', name: 'Nghỉ không phép', color: '#c9daf8', description: 'Áp dụng khi nhân viên tự ý bỏ việc không thông báo, gọi điện không bắt máy. Ký hiệu này dùng làm căn cứ xử lý kỷ luật hoặc trừ điểm chuyên cần.' },
    { code: 'OFF', name: 'Ngày nghỉ tuần', color: '#d9d2e9', description: 'Áp dụng cho ngày nghỉ mặc định trong tuần (thường là Chủ Nhật), hoặc ngày nghỉ xoay ca linh hoạt của nhân viên khối dịch vụ/cửa hàng.' }
  ];

  symbols = [...this.defaultSymbols.map(s => ({...s}))];
  
  displayDialog: boolean = false;
  symbol: any = {};
  isEdit: boolean = false;

  showDialogToAdd() {
    this.isEdit = false;
    this.symbol = { code: '', name: '', color: '#3B82F6', description: '' };
    this.displayDialog = true;
  }

  showDialogToEdit(symbol: any) {
    this.isEdit = true;
    this.symbol = { ...symbol };
    this.displayDialog = true;
  }

  save() {
    if (this.isEdit) {
      const index = this.symbols.findIndex(s => s.code === this.symbol.code);
      this.symbols[index] = this.symbol;
    } else {
      this.symbols.push(this.symbol);
    }
    this.displayDialog = false;
  }

  delete(symbol: any) {
    this.symbols = this.symbols.filter(s => s.code !== symbol.code);
  }

  resetDefault() {
    this.symbols = [...this.defaultSymbols.map(s => ({...s}))];
  }
}
