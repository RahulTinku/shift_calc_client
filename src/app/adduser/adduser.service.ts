import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';

@Injectable()
export class AdduserService {
  baseUrl : any;

  constructor(private _http: Http) { 
    this.baseUrl = environment.baseUrl;
  }

  newUser(data : any) : Observable<any>{
  	let header = new Headers({
  		'Content-Type' : 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
  	});
  	let options = new RequestOptions({headers : header})
  	return this._http.post(this.baseUrl + 'api/adduser', data, options)
  					.map(res => res.json())
  					.catch(this.HandleError)
  }

  addLogin(data: any) : Observable<any>{
    let header = new Headers({
      'Content-Type' : 'application/json',
    'Authorization' : 'Bearer ' + JSON.parse(localStorage.getItem('token'))
    });
    let options = new RequestOptions({headers : header})
    return this._http.post(this.baseUrl + 'api/addloginuser', data, options)
        .map(res => res.json())
        .catch(this.HandleError)
  }
  private HandleError(error : Error | any) {
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
