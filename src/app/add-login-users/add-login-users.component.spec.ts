import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoginUsersComponent } from './add-login-users.component';

describe('AddLoginUsersComponent', () => {
  let component: AddLoginUsersComponent;
  let fixture: ComponentFixture<AddLoginUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLoginUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLoginUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
