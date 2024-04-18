import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Amplify } from 'aws-amplify';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class CognitoService {}
