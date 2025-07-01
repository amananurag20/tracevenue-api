const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  signatureVersion: 'v4',
});

exports.getSignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileName or fileType' });
    }

    const fileKey = `uploads/${Date.now()}-${fileName}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Expires: 60, // 60 seconds expiry for signed URL
      ContentType: fileType,
    };

    const signedUrl = await s3.getSignedUrlPromise('putObject', params);

    res.json({
      signedUrl,
      fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
    });
  } catch (error) {
    console.error('S3 URL error:', error);
    res.status(500).json({ error: 'Error generating S3 signed URL' });
  }
};
