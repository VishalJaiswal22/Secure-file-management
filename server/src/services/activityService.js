const ActivityLog = require("../models/ActivityLog");

async function logActivity({ userId, action, targetType, targetId, details, ipAddress }) {
  await ActivityLog.create({
    user: userId,
    action,
    targetType,
    targetId,
    details,
    ipAddress
  });
}

module.exports = { logActivity };
