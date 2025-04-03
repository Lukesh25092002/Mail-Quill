enum Role {
    ADMIN = "admin",
    MEMBER = "member",
    GUEST = "guest"
};

enum Permission {
    UPDATE_ORGANISATION_PICTURE = "update_organisation_picture",
    CREATE_CHAT = "create_chat",
    DELETE_CHAT = "delete_chat",
    DELETE_ACCOUNT = "delete_account",
    DELETE_ORGANISATION = "delete_organisation",
    SEND_ORGANISATION_INVITATION = "send_organisation_invitation",
    REVOKE_ORGANISATION_INVITATION = "revoke_organisation_invitation",
    REMOVE_USER_FROM_ORGANISATION = "remove_user_from_organisation",
    UPDATE_USER_PRIVILEGES = "update_user_privileges"
}

const ACCESS_CONTROL: {[key in Role]: Permission[]} = {
    [Role.ADMIN]: [
        Permission.UPDATE_ORGANISATION_PICTURE,
        Permission.CREATE_CHAT,
        Permission.DELETE_CHAT,
        Permission.DELETE_ACCOUNT,
        Permission.DELETE_ORGANISATION,
        Permission.SEND_ORGANISATION_INVITATION,
        Permission.REVOKE_ORGANISATION_INVITATION,
        Permission.REMOVE_USER_FROM_ORGANISATION,
        Permission.UPDATE_USER_PRIVILEGES
    ],
    [Role.MEMBER]: [
        Permission.CREATE_CHAT,
        Permission.DELETE_ACCOUNT
    ],
    [Role.GUEST]: [
        Permission.DELETE_ACCOUNT
    ]
}

export { ACCESS_CONTROL, Role, Permission };