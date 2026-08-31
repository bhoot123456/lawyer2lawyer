// Rely on regex to validate incoming X-Device-Id without external dependency

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = function (req, res, next) {
  const deviceId = req.headers["x-device-id"];

  if (!deviceId) {
    req.deviceId = null;
    return next();
  }

  const trimmed = deviceId.trim();

  // Prefer strict UUID v4 validation to prevent malicious injection
  if (!UUID_V4_REGEX.test(trimmed)) {
    return res.status(400).json({
      success: false,
      message: "Invalid device ID format",
    });
  }

  req.deviceId = trimmed;
  next();
};
