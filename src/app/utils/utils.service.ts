import { Injectable } from '@angular/core';
import {cloneDeep, isEqual, isObject} from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }


  stripEmptyStrings(obj: object): any {
    const striped = cloneDeep(obj);
    Object.keys(striped).forEach((key) => {
      if (striped[key] === '') {
        delete striped[key];
      }
    });
    return striped;
  }


  isObject(x): boolean {
    return x !== null && typeof x === 'object';
  }


  whereToQueryString(where?): string {

    if (!where) {
      // simply returning an empty string rather than throwing an error can save code in the services that use this.
      return '';
    }

    const elements = [];
    Object.keys(where).forEach((key) => {
      if (this.isObject(where[key])) {
        Object.keys(where[key]).forEach((modKey) => {
          if (modKey === 'in') {
            elements.push(`${key}__${modKey}=${where[key][modKey].join(',')}`);
          } else {
            elements.push(`${key}__${modKey}=${where[key][modKey]}`);
          }
        });
      } else {
        elements.push(`${key}=${where[key]}`);
      }
    });
    if (elements.length) {
      return `?${elements.join('&')}`;
    } else {
      return '';
    }

  }

  removeUnchangedUpdates(updates: object, reference: object, keys?: string[]) {

    const keysToCheck = keys ? keys : Object.keys(updates);
    const output = cloneDeep(updates);

    keysToCheck.forEach((key) => {
      if (isEqual(output[key], reference[key])) {
        delete output[key];
      }
    });

    return output;
  }



}
