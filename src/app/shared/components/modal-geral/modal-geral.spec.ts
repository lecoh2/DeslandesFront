import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGeral } from './modal-geral';

describe('LogoAnimada', () => {
  let component: ModalGeral;
  let fixture: ComponentFixture<ModalGeral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalGeral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGeral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
