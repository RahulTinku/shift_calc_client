import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing/app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ListEmployeeComponent } from './list-employee/list-employee.component';
import { EmployeeComponent } from './employee/employee.component';
import { AdduserComponent } from './adduser/adduser.component';
import { CalculateComponent } from './calculate/calculate.component';

import { CommonService } from './common/commonService';
import { ExcelService } from './common/excel.service';
import { EmployeeService } from './employee/employee.service';
import { AdduserService } from './adduser/adduser.service';
import { ListEmployeeService } from './list-employee/list-employee.service';

import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { Ng2SearchPipeModule } from 'ng2-search-filter'; //importing the module
import { Ng2OrderModule } from 'ng2-order-pipe';
import { NgxPaginationModule} from 'ngx-pagination';
import { AddLoginUsersComponent } from './add-login-users/add-login-users.component';
import { HeaderComponent } from './header/header.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ListEmployeeComponent,
    EmployeeComponent,
    CalculateComponent,
    AdduserComponent,
    AddLoginUsersComponent,
    HeaderComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    AccordionModule.forRoot(),
    BsDropdownModule.forRoot(),
    Ng2SearchPipeModule,
    Ng2OrderModule,
    NgxPaginationModule
  ],
  providers: [
    ListEmployeeService, 
    CommonService,
    EmployeeService,
    AdduserService,
    ExcelService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
