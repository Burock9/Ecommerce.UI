import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesBar } from './categories-bar';

describe('CategoriesBar', () => {
  let component: CategoriesBar;
  let fixture: ComponentFixture<CategoriesBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
