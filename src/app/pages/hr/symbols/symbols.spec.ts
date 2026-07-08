import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Symbols } from './symbols';

describe('Symbols', () => {
  let component: Symbols;
  let fixture: ComponentFixture<Symbols>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Symbols],
    }).compileComponents();

    fixture = TestBed.createComponent(Symbols);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
