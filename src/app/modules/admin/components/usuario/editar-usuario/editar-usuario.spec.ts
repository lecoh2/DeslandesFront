import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuario } from './editar-usuario';

describe('EditarUsuarioComponent', () => {
  let component: EditarUsuario;
  let fixture: ComponentFixture<EditarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
