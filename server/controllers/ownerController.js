import User from "../models/User.js";
import fs from 'fs';
import ImageKit from '@imagekit/nodejs';
import Car from "../models/Car.js";

//API to change role of user
export const changeRoleToOwner = async(req ,res)=>{
    try {
        const {_id} = req.user;
        await User.findByIdAndUpdate(_id, {role:"owner"})
        res.json({sucess:true, message:"Now you can list your cars"})  
    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
    
}

//API to list cars

export const addCar = async (req,res)=>{
    try {
        const {_id} = req.user;
        if (!req.body || !req.body.carData) {
            return res.status(400).json({ success:false, message: 'Missing carData in form body' });
        }
        // Accept file from req.file (single) or req.files (upload.any())
        if (!req.file && !(req.files && req.files.length)) {
            return res.status(400).json({ success:false, message: 'Missing image file' });
        }

        let car;
        try {
            car = JSON.parse(req.body.carData);
        } catch (e) {
            return res.status(400).json({ success:false, message: 'carData must be valid JSON string' });
        }

        const imageFile = req.file ? req.file : req.files[0];

        //Upload Image to Imagekit
        const client = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

        const uploadRes = await client.files.upload({
            file: fs.createReadStream(imageFile.path),
            fileName: imageFile.originalname
        });

        const uploadedPath = uploadRes.filePath || uploadRes.name || uploadRes.url;

        const optimizedImageUrl = client.helper.buildSrc({
            src: uploadedPath,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            transformation: [
                { width: 1280, height: 300, crop: 'maintain_ratio', quality: 'auto', format: 'webp' }
            ]
        });

        const image = optimizedImageUrl || uploadRes.url || uploadedPath;
        await Car.create({...car, owner: _id, image})

        res.json({sucess:true,message:"car added"})


    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:error.message || 'Server error'})
    }
}