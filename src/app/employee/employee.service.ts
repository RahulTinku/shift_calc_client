import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';

@Injectable()
export class EmployeeService {
  baseUrl : any;

  constructor(private _http : Http) { 
    this.baseUrl = environment.baseUrl;
  }

  convertDate(dateToConvert){
    let today = new Date(dateToConvert);
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!

    let yyyy = today.getFullYear();
    // if (dd < 10) {
    //   dd = '0' + dd;
    // } 
    // if (mm < 10) {
    //   mm = '0' + mm;
    // } 
    return mm + '/' + dd + '/' + yyyy;
  }

  makeAbsent(data: any) : Observable<any> {
  	let headers = new Headers({
  		'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
  	});
  	let options = new RequestOptions({headers: headers});
  	return this._http.put(this.baseUrl +'api/attendance/' + data._id , data, options)
  				.map(res => res.json())
  				.catch(this.HandleError)
  }

  getShiftDetails(id) : Observable<any> {
      let headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
     let options = new RequestOptions({headers: headers});
     return this._http.get(this.baseUrl +`api/shift/${id}`, options)
              .map(res => res.json())
              .catch(this.HandleError)
  }

  getAttendance(_id, dateRange) : Observable<any> {
      var headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });

      const options = new RequestOptions({headers: headers});

      let startDate = this.convertDate(dateRange[0]);
      let endDate = this.convertDate(dateRange[1]);
      
      return this._http.get(this.baseUrl+`api/absentDate/${_id}?startDate=${startDate}&endDate=${endDate}`, options)
              .map((res:any) => res.json())
              .catch(this.HandleError)   
  }

  getAllowance(employee) : Observable<any> {

    let emp = employee;
      var headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
      const options = new RequestOptions({headers: headers});

      return this._http.get(this.baseUrl+`api/allowance/${emp.shift_id}?emp_type=${emp.emp_type}`, options)
              .map((res:any) => res.json())
              .catch(this.HandleError)   
  }

  putRosterShifts(rosterData) : Observable<any> {

    let headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
      const options = new RequestOptions({headers: headers});

    return this._http.post(this.baseUrl+`api/rosterShifts`, rosterData, options)
            .map((res :any) => res.json())
            .catch(this.HandleError)
  }

  getRoster(_id) : Observable<any> {
    let headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
    const options = new RequestOptions({headers: headers});

    return this._http.get(this.baseUrl+`api/rosterShift/${_id}`, options)
            .map((res :any) => res.json())
            .catch(this.HandleError)
  }

  changeEmployeeDetails(data) : Observable<any>{
    let headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
    const options = new RequestOptions({headers: headers});
    let _id = data._id;
    return this._http.put(this.baseUrl+`api/employee/${_id}`, data, options)
            .map((res :any) => res.json())
            .catch(this.HandleError)     
  }

  private HandleError(error : Response | any) {
  	if(error.status === 409){
      return Observable.throw('Duplicate entry');
    } if(error.status === 403) {
      return Observable.throw('Forbidden');
    } if(error.status === 401){
      return Observable.throw('Unauthorized');
    } else{
      return Observable.throw(error || 'Server error');
    }
  }
}
