const File = require("../models/File");
const ActivityLog = require("../models/ActivityLog");
const Session = require("../models/Session");
const asyncHandler = require("../utils/asyncHandler");

exports.getDashboardData = asyncHandler(async (req, res) => {
  const myFilesCount = await File.countDocuments({ owner: req.user._id });
  const sharedFilesCount = await File.countDocuments({ "sharedWith.user": req.user._id });
  const recentFiles = await File.find({
    $or: [{ owner: req.user._id }, { "sharedWith.user": req.user._id }]
  })
    .sort({ updatedAt: -1 })
    .limit(6)
    .populate("owner", "name");
  const activities = await ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8);
  const sessions = await Session.find({ user: req.user._id, status: "active" }).sort({ updatedAt: -1 });

  res.json({
    stats: {
      myFilesCount,
      sharedFilesCount,
      storageUsed: req.user.storageUsed,
      storageLimit: req.user.storageLimit
    },
    recentFiles,
    activities,
    sessions
  });
});
