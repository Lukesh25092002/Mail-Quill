import express from "express";
import { revokeOrganisationInvitation, getOrganisationInvitationDetails, createOrganisationInvitation } from "../controllers/collaboration.controller.js";
import isLoggedIn from "../middleware/isUserLoggedIn.js";
import organisationResolver from "../middleware/organisationResolver.middleware.js";

const collaborationRouter = express.Router();

collaborationRouter.get('/:invitationId', getOrganisationInvitationDetails);

collaborationRouter.use(isLoggedIn);
collaborationRouter.use(organisationResolver);

collaborationRouter.post("/organisation", createOrganisationInvitation);

collaborationRouter.delete('/organisation/:invitationId', revokeOrganisationInvitation);

export default collaborationRouter;