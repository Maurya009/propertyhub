const SiteContent = require("../models/SiteContent");

const sectionFields = {
  hero: [
    "eyebrow",
    "title",
    "description",
    "primaryCtaLabel",
    "secondaryCtaLabel",
  ],
  story: [
    "eyebrow",
    "title",
    "description",
  ],
  projectStats: [
    "acres",
    "acresLabel",
    "towers",
    "towersLabel",
  ],
  contact: [
    "eyebrow",
    "title",
    "description",
    "ctaLabel",
  ],
};

function cleanString(value, maxLength = 5000) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value).trim().slice(0, maxLength);
}

async function getSiteContent(req, res) {
  try {
    let content = await SiteContent.findOne({
      key: "main",
    });

    if (!content) {
      content = await SiteContent.create({
        key: "main",
      });
    }

    return res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get site content failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load site content.",
    });
  }
}

async function updateSiteContent(req, res) {
  try {
    let content = await SiteContent.findOne({
      key: "main",
    });

    if (!content) {
      content = new SiteContent({
        key: "main",
      });
    }

    const body = req.body || {};

    for (const [sectionName, fields] of Object.entries(
      sectionFields
    )) {
      if (
        !body[sectionName] ||
        typeof body[sectionName] !== "object" ||
        Array.isArray(body[sectionName])
      ) {
        continue;
      }

      for (const field of fields) {
        const value = cleanString(
          body[sectionName][field]
        );

        if (value !== undefined) {
          content[sectionName][field] = value;
        }
      }
    }

    await content.save();

    return res.json({
      success: true,
      message: "Site content updated successfully.",
      data: content,
    });
  } catch (error) {
    console.error("Update site content failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update site content.",
    });
  }
}

module.exports = {
  getSiteContent,
  updateSiteContent,
};
