import { Component, OnInit } from '@angular/core';
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
import { DatabaseService, ScheduleSymbol } from '../../../core/services/database.service';

@Component({
  selector: 'app-hr-symbols',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, DialogModule, ColorPickerModule, TagModule, TooltipModule, TextareaModule],
  templateUrl: './symbols.html',
  styleUrl: './symbols.scss'
})
export class Symbols implements OnInit {
  symbols: ScheduleSymbol[] = [];
  displayDialog: boolean = false;
  symbol: any = {};
  isEdit: boolean = false;

  constructor(private db: DatabaseService) {}

  ngOnInit() {
    this.db.symbols$.subscribe(data => {
      this.symbols = [...data.map(s => ({ ...s }))];
    });
  }

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
    let updatedSymbols = [...this.symbols];
    if (this.isEdit) {
      const index = updatedSymbols.findIndex(s => s.code === this.symbol.code);
      if (index !== -1) {
        updatedSymbols[index] = this.symbol;
      }
    } else {
      updatedSymbols.push(this.symbol);
    }
    this.db.saveSymbols(updatedSymbols);
    this.displayDialog = false;
  }

  delete(symbol: any) {
    const updatedSymbols = this.symbols.filter(s => s.code !== symbol.code);
    this.db.saveSymbols(updatedSymbols);
  }

  resetDefault() {
    localStorage.removeItem('mock_db_symbols');
    window.location.reload(); // Simple way to trigger default init from service
  }
}
