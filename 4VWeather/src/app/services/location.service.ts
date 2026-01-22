import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async getCurrentPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }
}
