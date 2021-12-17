import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

export interface AppState {
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private state = new BehaviorSubject<AppState>({
    limit: 10,
    offset: 0,
  });

  private increaseLimitAction = new Subject<number>();
  private decreaseLimitAction = new Subject<number>();
  private increaseOffsetAction = new Subject<number>();
  private decreaseOffsetAction = new Subject<number>();

  limit$ = this.createSelector((state) => state.limit);
  offset$ = this.createSelector((state) => state.offset);

  constructor() {
    this.createReducer(this.increaseLimitAction, (state, limit) => {
      state.limit += limit;
      return state;
    });
    this.createReducer(this.decreaseLimitAction, (state, limit) => {
      state.limit -= limit;
      return state;
    });
    this.createReducer(this.increaseOffsetAction, (state, offset) => {
      state.offset += offset;
      return state;
    });
    this.createReducer(this.decreaseOffsetAction, (state, offset) => {
      state.offset -= offset;
      return state;
    });
  }

  increaseLimit(limit: number) {
    this.increaseLimitAction.next(limit);
  }

  decreaseLimit(limit: number) {
    this.decreaseLimitAction.next(limit);
  }

  increaseOffset(offset: number) {
    this.increaseOffsetAction.next(offset);
  }

  decreaseOffset(offset: number) {
    this.decreaseOffsetAction.next(offset);
  }

  private createSelector<T>(selector: (state: AppState) => T): Observable<T> {
    return this.state.pipe(
      map(selector),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private createReducer<T>(
    action$: Observable<T>,
    accumulator: (state: AppState, action: T) => AppState
  ) {
    action$.subscribe((action) => {
      const state = { ...this.state.value };
      const newState = accumulator(state, action);
      this.state.next(newState);
    });
  }
}
