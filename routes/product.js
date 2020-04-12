const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
// CHeck auth middleware
const checkAuth = require('../middleware/check-auth')

// Image uploading using multer.
const multer = require('multer')

// Destination and changing the filename to its original
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
// only images are stored
const imageFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
	{cb(null, true)}
	else {cb(null, false)}
}
// limit can also be applied
const upload = multer({ 
	storage,
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	imageFilter
})

const Product = require('../models/product')

router.get('/', (req, res) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
		const response = {
			count: docs.length,
			products: docs.map(doc => {
				return {
					name: doc.name,
					price: doc.price,
					productImage: doc.productImage,
					_id: doc._id
				}
			})
		}
		res.status(200).json(response)
	})
    .catch(err => {
        console.log(err)
        res.status(404).json({err})
    })
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(result => {
        if (result) {    
            console.log(result)
            res.status(200).json({result})
        } else {
            res.status(404).json({msg: 'Product not found'})
        }
    })
    .catch(err => {
        console.log(err)
        res.status(404).json({err})
    })
})

router.post('/', upload.single('productImage'),checkAuth, (req, res) => {
    console.log(req.file)
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
		price: req.body.price,
		productImage: req.file.path
    })
    product
    .save()
    .then(result => {
        console.log(result)
        res.status(200).json({
            message: 'Created product successfully',
            createdProduct: {
                name: req.body.name,
                price: req.body.price,
				id: result.id,
				productImage: result.productImage
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            message: "Can't add this product"
        })
    }) 
})

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId

    // updating any one of the req.body data
    const updateArray = {}
    for (const i of req.body) {
        updateArray[i.options] = i.value
    }
    
    Product.update({_id: id}, { $set: updateArray})
    .exec()
    .then(result => {
        let value = ''
        if (result.nModified === 1) {
             value = 'Your data is modified'
        } else {
             value = 'Your data is not modified'
        }
        console.log(result)
        res.status(200).json({
            message: value,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + result.id
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({err})
    })
})

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId
    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
        if (result.deletedCount > 0) {
        res.status(200).json({
            message: 'Product deleted',
            result
        })
    }else {
        res.status(401).json({message: 'Not found'})
    }
    })
    .catch(err => {
        console.log(err)
        res.status(404).json({err})
    })
})

router.delete('/', (req, res, next) => {
    Product
    .deleteMany()
    .exec()
    .then(() => {
        res.status(200).json({
            result: {
                msg: 'You just deleted all of your products',
                request : {
                    type: 'POST',
                    url: 'http://localhost:3000/products'
                }
            }
        })
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

module.exports = router