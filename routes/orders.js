const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/order')
const Product = require('../models/product')
const checkAuth = require('../middleware/check-auth')

router.get('/', checkAuth, (req, res, next) => {
    Order.find()
    .select('product quantity _id')
    .populate('product', '_id name price')
    .exec()
    .then(result => {
        if (!result) {
            return res.status(404).json({message: 'Order not found!'})
        }
        res.status(201).json({
            result,
            count: result.length
        })
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId
    Order.findById(id)
    .select('_id product quantity')
    .populate('product')
    .exec()
    .then(result => {
        res.status(201).json({result})
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

router.post('/', checkAuth, (req, res, next) => {
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'No such product exist'
            })
        }
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            product: req.body.productId,
            quantity: req.body.quantity
        })
        return order.save()
    })
    .then(result => {
        res.status(201).json({
            id: result._id,
            quantity: result.quantity,
            productId: result.product
        })
    })
    .catch(err => {
        res.status(500).json({err})
    })
})

router.delete('/:orderId', checkAuth, (req, res, next) => {
    Order.deleteOne({_id: req.params.orderId})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'order deleted'
        })
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

router.delete('/', checkAuth, (req, res, next) => {
    Order.deleteMany()
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'All your orders are deleted'
        })
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

module.exports = router