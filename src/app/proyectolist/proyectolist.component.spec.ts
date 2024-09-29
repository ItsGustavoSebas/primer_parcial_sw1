import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectolistComponent } from './proyectolist.component';

describe('ProyectolistComponent', () => {
  let component: ProyectolistComponent;
  let fixture: ComponentFixture<ProyectolistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProyectolistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProyectolistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
