const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('Connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error.message)
  })


const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username cannot be empty.'],
    minlength: [3, 'Must be atleast 3 characters.']
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: value => /^\d{2,3}-\d+$/.test(value) && value.length >= 8,
      message: props => `${props.value} is not a valid phone number!`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
