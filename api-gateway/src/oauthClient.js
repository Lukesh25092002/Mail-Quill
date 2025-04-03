import { OAuth2Client } from 'google-auth-library';

import dotenv from 'dotenv';
dotenv.config();

const OAuthClient = new OAuth2Client(process.env.OAUTH_CLIENT_ID);

export default OAuthClient;