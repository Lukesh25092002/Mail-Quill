import express from "express";
import { getOrganisationPeople, removeUserFromOrganisation, updateUserPrivileges ,getOrganisationInvitations, deleteOrganisation, uploadOrganisationPicture } from "../controllers/organisation.controller.js";
import multerClient from "../multerClient.js";
import isLoggedIn from "../middleware/isUserLoggedIn.js";
import organisationResolver from "../middleware/organisationResolver.middleware.js";

const organisationRouter = express.Router();
organisationRouter.use(isLoggedIn);
organisationRouter.use(organisationResolver);

organisationRouter.delete('/', deleteOrganisation);
organisationRouter.delete('/user/:userId', removeUserFromOrganisation);
organisationRouter.put('/user/:userId/privilege',updateUserPrivileges);
organisationRouter.patch('/organisation-picture', multerClient.single('organisation-picture'), uploadOrganisationPicture);
organisationRouter.get('/people', getOrganisationPeople);
organisationRouter.get('/collaboration', getOrganisationInvitations);

export default organisationRouter;