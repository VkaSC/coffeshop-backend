import Token from "../models/token.model";
import User from "../models/user.model";
import HTMLResponse from "../output/htmlResponse.output";
import JWTUtils from "../utils/jwt.utils";

export default class UserMiddlewares {

    static async authUser(req, res, next) {
        const response = new HTMLResponse(req, res);
        if (!req.header(JWTUtils.USER_AUTH_HEADER))
            return response.badRequest('Not ' + JWTUtils.USER_AUTH_HEADER + ' header on request', HTMLResponse.MISSING_AUTH_STATUS);
        try {
            const tokenValue = req.header(JWTUtils.USER_AUTH_HEADER).replace('Bearer ', '');
            const jwtUtils = new JWTUtils();
            const tokenVerification = jwtUtils.verify(tokenValue);
            if (tokenVerification.success) {
                const tokenResult = await this.query('SELECT ' + Token.visibleFields().join(', ') + ' FROM ' + Token.table() + ' WHERE token = ?', [tokenValue])
                if (tokenVerification.decoded.action !== JWTUtils.APP_AUTH_ACTION || !tokenResult || tokenResult.length === 0 || !tokenResult[0].active) {
                    return response.forbidden('Permission Denied', HTMLResponse.USER_PERMISSION_DENIED_STATUS);
                }
                if (tokenVerification.decoded.type !== JWTUtils.USER_TOKEN) {
                    return response.forbidden('Permission Denied. Wrong Token type', HTMLResponse.WRONG_TOKEN_TYPE_STATUS);
                }
                const userResult = await this.query('SELECT ' + User.visibleFields().join(', ') + ' FROM ' + User.table() + ' WHERE id = ?', [tokenVerification.decoded.id]);
                if (!userResult || userResult.length === 0) {
                    return response.notFound('User not found');
                }
                const user = new User(userResult[0]);
                if (!user.active) {
                    return response.unauthorized('The user is not active.', HTMLResponse.INACTIVE_USER_STATUS);
                }
                req.tokenDecoded = tokenVerification.decoded;
                req.user = user;
            } else {
                return JWTUtils.processError(response, tokenVerification);
            }
            next()
        } catch (error) {
            return response.error('An error ocurred while trying to autenticate', error);
        }
    }

}