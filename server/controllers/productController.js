import {v2 as cloudinary} from 'cloudinary';
import Product from '../models/Product.js';

// add product : /api/products/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData);
        const images = req.files;

        let imageurl = await Promise .all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url;
            })
        )
        await Product.create({...productData, image: imageurl});
        res.json({success: true, message: "Product added successfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}
// get  products : /api/products/list
export const getProducts = async (req, res)=>{
    try {
        const products = await Product.find({});
        res.json({success: true, products});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// get single product : /api/products/:id
export const productById = async (req, res)=>{
    try {
        const {id} = req.body;
        const product = await Product.findById(id);
        // if(!product){
        //     return res.json({success: false, message: "Product not found"});
        // }
        res.json({success: true, product});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}
// change product instock : /api/products/:id
export const changeStock = async (req, res)=>{
    try {
        const {id, inStock} = req.body;
        await Product.findByIdAndUpdate(id, {inStock});
        res.json({success: true, message: "Product stock updated successfully"});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }

}