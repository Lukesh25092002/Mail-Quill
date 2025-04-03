import { log } from "console"

const ROLE = {
    ADMIN: "admin",
    MEMBER: "member",
    GUEST: "guest"
}

const PERMISSION = {
    UPDATE_ORGANISATION_PICTURE: "update_organisation_picture",
    CREATE_CHAT: "create_chat",
    DELETE_CHAT: "delete_chat",
    DELETE_ACCOUNT: "delete_account",
    DELETE_ORGANISATION: "delete_organisation",
    SEND_ORGANISATION_INVITATION: "send_organisation_invitation",
    REVOKE_ORGANISATION_INVITATION: "revoke_organisation_invitation",
    UPDATE_USER_PRIVILEGES: "update_user_privileges"
}

const ACCESS_CONTROL = {
    [ROLE.ADMIN]: [
        PERMISSION.UPDATE_ORGANISATION_PICTURE,
        PERMISSION.CREATE_CHAT,
        PERMISSION.DELETE_CHAT,
        PERMISSION.DELETE_ACCOUNT,
        PERMISSION.DELETE_ORGANISATION,
        PERMISSION.SEND_ORGANISATION_INVITATION,
        PERMISSION.REVOKE_ORGANISATION_INVITATION,
        PERMISSION.UPDATE_USER_PRIVILEGES
    ],
    [ROLE.MEMBER]: [
        PERMISSION.CREATE_CHAT,
        PERMISSION.DELETE_ACCOUNT
    ],
    [ROLE.GUEST]: [
        PERMISSION.DELETE_ACCOUNT
    ]
}

const hasPermission = (role, permission) => {
    if (!ACCESS_CONTROL[role])
        throw new Error("Invalid role");
    else
        return ACCESS_CONTROL[role].includes(permission);
}

const hasPermissions = (role, permissions)=> {
    for(const permission of permissions){
        if(!hasPermission(role,permission))
            return false;
    }

    return true;
}

export {
    ROLE,
    PERMISSION,
    hasPermission,
    hasPermissions
};