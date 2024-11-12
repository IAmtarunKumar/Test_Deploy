// const { uploadFileToFirebase } = require("./fireBase");

// async function uploadFiles(req) {
//     let fileUrls = [];
  
  
//     if (req.files && req.files.length > 0) {
//        const newFileUrls = await uploadFileToFirebase(req.files);  
//       fileUrls = newFileUrls;
//     }
  
//      if (!Array.isArray(fileUrls) || fileUrls.some(url => typeof url !== 'string')) {
//       throw new Error('Invalid file URLs format');
//     }
  
//     return fileUrls;
//   }
  
//   module.exports = { uploadFiles };
  
