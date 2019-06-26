import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { ListEmployeeComponent } from '../list-employee/list-employee.component';
import { EmployeeComponent } from '../employee/employee.component';
import { CalculateComponent } from '../calculate/calculate.component';
import { AdduserComponent } from '../adduser/adduser.component';
import { AddLoginUsersComponent } from '../add-login-users/add-login-users.component';

const appRoutes : Routes = [
		{
			path : 'login',
			component : LoginComponent
		}, {
			path: 'list/:id',
			component: ListEmployeeComponent
		}, {
			path: 'employee/:id',
			component: EmployeeComponent
		}, {
			path: 'calculate',
			component : CalculateComponent
		},{
			path : 'adduser/:id',
			component : AdduserComponent
		},{
			path : 'addloginuser/:id',
			component : AddLoginUsersComponent
		},{
			path: '',
			component : LoginComponent,
			pathMatch: 'full'
		}
	]

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports : [RouterModule]
})
export class AppRoutingModule { }
