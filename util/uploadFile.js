const path = require("path");

exports.monkeyUpload = (req,fileKey,dest,max_mb=5,filesAllow=[".png",".jpg",".gif",".jpeg"]) => {
  return new Promise((resolve,reject) => {
    let myFile = req.files[fileKey];
    if(!myFile){
      reject({msg:"you need to send file",code:"send_file"})
    }
    if (myFile.size <= 1024 * 1024 * max_mb) {
      let extFile = path.extname(myFile.name)
      if (filesAllow.includes(extFile)) {
        dest = dest != "" ? dest+extFile : myFile.name
        myFile.mv("public/" + dest, (err) => {
          if (err) {reject({ msg: "error", err })}
          resolve({ msg: "file upload",fileName: dest });
        })
      }
      else{
        reject({ msg: "File not allowed ",code:"ext" });
      }
    }
    else {
      reject({ msg: "File too big, max "+max_mb+" mb!",code:"max" });
    }
  })

}