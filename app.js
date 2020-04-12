require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = process.env.PORT || 3000

const bodyParser = require("body-parser")

//routes
const productRoutes = require('./routes/product')
const orderRoutes = require('./routes/orders')
const userRoutes = require('./routes/user')


mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connected')
}).catch(err => console.log(err))

// Handling uploads folder for image
app.use('/uploads', express.static('uploads'))

// This gave me shit ton of headache and now i wont forget writing this ever in my whole life.

app.use(bodyParser.json())


app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)

app.use((req, res, next) => {
    const error = new Error('Not found!')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen(port, () => console.log(`Server is up and running on port ${port}`))