import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export function errorHandlingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error) => {
      // TODO: Here should be snackbar or so
      console.error(`Failed with the next message: ${error.error.message}`);
      return throwError(() => error)
    })
  );
}
