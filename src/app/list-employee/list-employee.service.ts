import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class ListEmployeeService {
  baseUrl : any;

  constructor(private _http: Http) { 
    this.baseUrl = environment.baseUrl;
  }

  getList(manager_id) : Observable<any> {
	var headers = new Headers({
		'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
	});
	const options = new RequestOptions({headers: headers});
  	return this._http.get(this.baseUrl+`api/completeList/${manager_id}`, options)
  		.map((res:any) => res.json())
  		.catch(this.HandleError)
  }

  getEmployee(_id) : Observable<any> {
  	var headers = new Headers({
		'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
		});
	  const options = new RequestOptions({headers: headers});
  	return this._http.get(this.baseUrl+`api/employee/${_id}`, options)
  		  		.map((res:any) => res.json())
  				.catch(this.HandleError)
  }

  getAttendance(id) : Observable<any> {
      var headers = new Headers({
        'Content-Type': 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
      });
      const options = new RequestOptions({headers: headers});
      return this._http.get(this.baseUrl+`api/calculate/${id}`, options)
              .map((res:any) => res.json())
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
