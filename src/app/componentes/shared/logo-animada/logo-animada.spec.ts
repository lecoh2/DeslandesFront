import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoAnimada } from './logo-animada';

describe('LogoAnimada', () => {
  let component: LogoAnimada;
  let fixture: ComponentFixture<LogoAnimada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoAnimada]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoAnimada);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
