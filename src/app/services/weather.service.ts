import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiUrl = environment.api.weather.base_url + 'current.json';
  private apiKey = environment.api.weather.api_key; // Replace with your API key

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<any> {
    const url = `http://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${city}`;
    return this.http.get(url);
  }
}
