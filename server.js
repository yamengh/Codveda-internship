// 1. Import our libraries
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// 2. Import our routes
const productRoutes = require('./routes/products')

// 3. Load our .env file
dotenv.config()

// 4. Create our express app
const app = express()

// 5. Middleware - tell express to understand JSON
app.use(express.json())

// 6. Tell express to use our routes
app.use('/api/products', productRoutes)

// 7. Test route
app.get('/', (req, res) => {
    res.send('API is running!')
})

// 8. Connect to MongoDB then start the server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB!')
        app.listen(process.env.PORT, () => {
            console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log('❌ Connection failed!', error)
    })