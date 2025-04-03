import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import constants from '../constants/constants';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const chatServiceUrl = environment.API_GATEWAY + "/chats"; // Base URL for ChatService
  const userServiceUrl = environment.API_GATEWAY + "/user"; // Base URL for UserService
  const organisationServiceUrl = environment.API_GATEWAY + "/organisation";  // Base URL for OrganisationService
  const collaborationServiceUrl = environment.API_GATEWAY + "/collaboration";  // Base URL for CollaborartionService
  const token = localStorage.getItem(constants.USER_AUTH_TOKEN);

  // Only modify requests targeting the ChatService and UserService
  if (token && (req.url.startsWith(chatServiceUrl) || req.url.startsWith(userServiceUrl) || req.url.startsWith(organisationServiceUrl) || req.url.startsWith(collaborationServiceUrl))) {
    req = req.clone({
      setHeaders: {
        UserAuthToken: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
