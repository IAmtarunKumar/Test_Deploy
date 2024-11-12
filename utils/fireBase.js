const admin = require('firebase-admin');
 
FIREBASE_SERVICE_ACCOUNT_KEY = {
    "type": "service_account",
    "project_id": "fir-project-8d315",
    "private_key_id": "29c0a2f7b18c307fddd8c32a3bf21350e224220e",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxcSP2fC62JSHc\nQq9RQogDsVoltgZXVliSMHUTJN/gUH6TkeCQ91H6wI9h0sFfT6FUFA1PuMSYHUX6\njq+mjd1Bdoc8H+Evh7EzKRzSE4/xlT1Hgg26ONy4AkkZi+hdEBhMUP50d8O62Wgw\nJBMcowEuuncZcF5dL8sUfC4KdNK+/DUz2bocoNp7xcbXrm4S52kdZi+bEq9ldr+W\n4XbbAjg59EKD8DdeMIEtcgk+fawpu4FA2TVn5WSHEZwj3mREj/dwmEDumTkBhGK3\nYnkSPoBAjy9yGPknLZXe+QMM2BHDh37rVde+HeUpqyF/edBfW8f0PV3jNCgwBH6l\npL2xlckLAgMBAAECggEAUX9SEbEqsSzv1t7n7+4bU3rfGSf31KBLcOWBuCe9DaVa\n5YNgPaTiScWsdTUb7J9BzUCidoW6AdWcIP7tDRXmU91RMpu/zRlJGWLeIlyqxb4S\nVagVjvzz3y3pjiq0sB2m01J19F9Xjhexoz7GamYxslkhP5VdOfasEv4QFWxfqSig\nR+zzYVRElwYSM9j1Il645vdG+ZxkNK3UyfRxqTPjFFPsJP+HY61v/QHLXBuPoD71\nf0Zi2WeObZqQUu40RIv4kMrbAxPNthKclZwJo98IkjOv2jY4Q+Sfo1sF2kW6uuWc\nf/67fPOrH6TKM1sCvwQZMQ+KyKIwfN7rH0+2QmGWIQKBgQDjF6vh+z2HPQzPcf1J\noCV9E9NwV35uXt/7rcwM0r7MJPnyxzuKLDX1Sln1yEE2e56O38uC52myjliqjmvd\nLJUrXkSZaxE8+/mK0mQi/KiGPccMwQrVpRsrCSOdb3ByZFPAzND031oOk5JROqmD\nILUmLN5Y6lijJ6H3N2tOlOAKKwKBgQDIB35LD/6MOIENu0zjMBXDwthumuHotfrO\n2XrC2wjB9S/JMPLPQ40Zt/NprAnZgeIHBcsVAKOipypShaL6ZVvkSFq9lIaCuxwH\nNZWXvymUIR3JjaCwqXi4yEedfTnbo+9zHB98xJpO9hD5MV/Cs1wj+Uv+02temU7l\nSb1v5NAsoQKBgQCLBf3S7ZUgSs6h3L3cKe9pYA7MMrQS64Ahuqc1nnrxzR07dJ7N\nmv05elgScJMDwLAz9WvIatU5W42KdIAyOc3ka+SBK5u1AuklBGILTTP6Yq2N8Ewq\nuNYmBYVJJ2Tmkub3HCw8DNQ8IjmsAsatoQNlKIjCVE0JLQUprELEK73wWwKBgQCG\n1QY8cruSqUPUjbx2J6OEIYLii2RcCM7XP6GQVzTACRX8+BGzxEUIYQai5GR/SR2i\nvjT2I0gqC6Rrm8kQH+KhLmR8BfHljVqHQYdkkmbkgq4hfmYirxnA9L/RWOf3Nbni\nTcKrx5p8P0GRt8Zk56HkXdbsHnbxfUXBKMOY+ROaAQKBgGyqKWDieJme4YHcJRM0\nBKY7mkXNHFsjeNqpura6PmwS3BEFaQr7bfipPdRsB0rtmfL/Nl+rFX1nZuvFuD4O\nVfu6dQI7E/AjZXzbHgLPvsXtdmuv+vw/3RWe2Rj+jxv9u2/SIubyWU2yE28r+HPd\nDwt97/GknGNTYekG1GLgSisa\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-nyeoy@fir-project-8d315.iam.gserviceaccount.com",
    "client_id": "114451607466615377994",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-nyeoy%40fir-project-8d315.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }

// Initialize Firebase Admin SDK


admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT_KEY),
  storageBucket: 'fir-project-8d315.appspot.com' // Specify your bucket name
});

const bucket = admin.storage().bucket();

// Function to upload multiple files to Firebase
// const uploadFileToFirebase = async (files) => {
//   const fileUrls = [];
//   try {
//       for (const file of files) {
//           const docId = Math.floor(Math.random() * 900000000) + 100000000;
//           const fileType = file.originalname.split('.').pop();
//           const fileRef = bucket.file(`${docId}.${fileType}`);
//           const options = {
//               metadata: { contentType: file.mimetype },
//               resumable: false,
//           };

//           await new Promise((resolve, reject) => {
//               const writable = fileRef.createWriteStream(options);

//               writable.on('finish', async () => {
//                   try {
//                       const [fileUrl] = await fileRef.getSignedUrl({
//                           action: 'read',
//                           expires: '03-09-2491',
//                       });
//                       fileUrls.push(fileUrl);
//                       resolve();
//                   } catch (error) {
//                       reject(error);
//                   }
//               });

//               writable.on('error', (error) => {
//                   reject(error);
//               });

//               writable.end(file.buffer);
//           });
//       }
//       return fileUrls;
//   } catch (error) {
//       throw new Error(`Error uploading files: ${error.message}`);
//   }
// };


// Function to upload files (either single or multiple) to Firebase
const uploadFileToFirebase = async (files) => {
    const fileUrls = [];
  
    // Ensure files is an array to handle both single and multiple uploads
    files = Array.isArray(files) ? files : [files]; // Wrap in array if it's a single file object
  
    try {
        for (const file of files) {
            const docId = Math.floor(Math.random() * 900000000) + 100000000;
            const fileType = file.originalname.split('.').pop();
            const fileRef = bucket.file(`${docId}.${fileType}`);
            const options = {
                metadata: { contentType: file.mimetype },
                resumable: false,
            };
  
            await new Promise((resolve, reject) => {
                const writable = fileRef.createWriteStream(options);
  
                writable.on('finish', async () => {
                    try {
                        const [fileUrl] = await fileRef.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2491',
                        });
                        fileUrls.push(fileUrl);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
  
                writable.on('error', (error) => {
                    reject(error);
                });
  
                writable.end(file.buffer);
            });
        }
        return fileUrls;
    } catch (error) {
        throw new Error(`Error uploading files: ${error.message}`);
    }
  };
  
module.exports = { uploadFileToFirebase , bucket};