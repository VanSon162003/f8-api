const slugify = require("slugify");

/**
 * Generate a unique slug from a string
 * @param {string} text - The text to convert to slug
 * @param {Object} Model - The Sequelize model to check uniqueness
 * @param {string} field - The field name to check uniqueness against
 * @param {number} id - Optional ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - The unique slug
 */
async function generateUniqueSlug(text, Model, field = "slug", id = null) {
    if (!text) return "";

    let baseSlug = slugify(text, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const whereClause = { [field]: slug };
        if (id) {
            whereClause.id = { [require("sequelize").Op.ne]: id };
        }

        const existing = await Model.findOne({ where: whereClause });
        if (!existing) {
            break;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

/**
 * Generate a unique username from email or name
 * @param {string} email - The email to generate username from
 * @param {string} firstName - Optional first name
 * @param {string} lastName - Optional last name
 * @param {Object} Model - The Sequelize model to check uniqueness
 * @param {number} id - Optional ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>} - The unique username
 */
async function generateUniqueUsername(
    email,
    Model,
    id = null,
    firstName = "",
    lastName = ""
) {
    let baseUsername = "";
    const checkEmailAuth0 = email.includes("auth0.com");

    if (email && !checkEmailAuth0) {
        baseUsername = email.split("@")[0];
    } else if (firstName || lastName) {
        baseUsername = `${firstName || ""}${lastName || ""}`
            .toLowerCase()
            .replace(/\s+/g, "");
    } else {
        baseUsername = "user";
    }

    // Clean username
    baseUsername = baseUsername.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    if (!baseUsername) {
        baseUsername = "user";
    }

    let username = baseUsername;
    let counter = 1;

    while (true) {
        const whereClause = { username };
        if (id) {
            whereClause.id = { [require("sequelize").Op.ne]: id };
        }

        const existing = await Model.findOne({ where: whereClause });
        if (!existing) {
            break;
        }

        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
}

module.exports = {
    generateUniqueSlug,
    generateUniqueUsername,
};
