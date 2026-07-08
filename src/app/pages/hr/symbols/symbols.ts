import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-hr-symbols',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, DialogModule, ColorPickerModule, TagModule],
  templateUrl: './symbols.html',
  styleUrl: './symbols.scss'
})
export class Symbols {
  symbols = [
    { code: 'HC', name: 'Hành chính (Full-time)', color: '#22C55E' },
    { code: 'OFF', name: 'Nghỉ không lương', color: '#64748B' },
    { code: 'L', name: 'Nghỉ lễ / Phép năm', color: '#F59E0B' }
  ];
  
  displayDialog: boolean = false;
  symbol: any = {};
  isEdit: boolean = false;

  showDialogToAdd() {
    this.isEdit = false;
    this.symbol = { code: '', name: '', color: '#3B82F6' };
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
    this.symbols = [
      { code: 'HC', name: 'Hành chính (Full-time)', color: '#22C55E' },
      { code: 'OFF', name: 'Nghỉ không lương', color: '#64748B' },
      { code: 'L', name: 'Nghỉ phép', color: '#F59E0B' }
    ];
  }
}
