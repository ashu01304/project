import express from 'express';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';
import { addProduct, getProducts , productById, changeStock} from '../controllers/productController.js';


const productRouter = express.Router();

// productRouter.post('/add', upload.array(["images"]), authSeller, addProduct);
// productRouter.get('/list', getProducts);
// productRouter.get('/id', productById);
// productRouter.get('/stock', authSeller, changeStock);
productRouter.post('/add', authSeller, upload.array('image', 4), addProduct);
productRouter.get('/list', getProducts);
productRouter.get('/:id', productById);
productRouter.put('/stock', authSeller, changeStock);

export default productRouter;

