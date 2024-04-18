import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  getWeather() {
    return this.http.get(
      'https://gbbkdcchgd.execute-api.us-east-1.amazonaws.com/getCurrPhxWeather'
    );
  }
}
