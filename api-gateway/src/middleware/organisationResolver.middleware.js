import Organisation from "../models/organisation.model.js";

/*
Expects user in request object
Appends organisation in next request object
*/
const organisationResolver = async (req, res, next) => {
    const user = req.user;   // Expect user in request object
    const organisationId = user.organisationId;

    let organisation;
    try {
        organisation = await Organisation.findById(organisationId);
        if (!organisation)
            return res.status(401).json({ message: "No organisation found" });
    } catch (err) {
        return res.status(500).json({ err, message: "Couldn't fetch the organisation." });
    }

    req.organisation = organisation;
    next();
};

export default organisationResolver;